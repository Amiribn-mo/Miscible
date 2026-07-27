import { savePublicKey, savePrivateKey, savePrivateKeyWithDerivedKey, setRotationState, clearRotationState } from "./keyStore";
import { db } from "../db";
import { decryptNote, encryptNote } from "./hybrid";

async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  return { publicKey: keyPair.publicKey, privateKey: keyPair.privateKey };
}

/**
 * Rotate RSA keypair and re-wrap/re-encrypt all notes with the new public key.
 * Works in small batches and records progress to support resumability.
 * If newPassphrase is omitted, the existing passphrase will be used to encrypt the new private key.
 */
export async function rotateKeypair(newPassphrase?: string, batchSize = 20) {
  // Require an unlocked session (derived AES key must be present)
  const session = await import("../session");
  const derived = session.getDerivedKey();
  if (!derived) throw new Error("Not unlocked. Unlock and try again.");

  // Generate new RSA key pair
  const { publicKey, privateKey } = await generateKeyPair();

  // Export public & private bytes to store
  const publicBytes = await crypto.subtle.exportKey("spki", publicKey);
  const privateBytes = await crypto.subtle.exportKey("pkcs8", privateKey);

  // Save new public and private (encrypted with chosen passphrase if provided)
  // If newPassphrase not provided, reuse current derived key: re-encrypting will require calling savePrivateKey with the current passphrase, so we fetch the original metadata and keep the same kdf; for now we re-use the same blob by encrypting with a provided passphrase if given
  await savePublicKey(publicBytes);
  if (newPassphrase) {
    await savePrivateKey(privateBytes, newPassphrase);
  } else {
    // Re-encrypt private key with the currently-derived AES key (no passphrase needed)
    const session = await import("../session");
    const derived = session.getDerivedKey();
    if (!derived) throw new Error("Session expired; unlock again to rotate keys without supplying a new passphrase.");
    await savePrivateKeyWithDerivedKey(derived, privateBytes, { version: 1, alg: 'RSA-OAEP-2048-SHA256', kdf: { id: 'derived' } });
  }

  // Record rotation state
  const all = await db.notes.toArray();
  const total = all.length;
  await setRotationState({ inProgress: true, total, processed: 0, startedAt: Date.now() });

  try {
    for (let i = 0; i < total; i += batchSize) {
      const slice = all.slice(i, i + batchSize);

      await Promise.all(
        slice.map(async (n) => {
          try {
            const plaintext = await decryptNote(n as any);
            const enc = await encryptNote(plaintext);

            await db.notes.update(n.id!, {
              encryptedContent: enc.encryptedContent,
              encryptedKey: enc.encryptedKey,
              iv: enc.iv,
              updatedAt: Date.now(),
            });
          } catch (err) {
            console.error("Failed to rotate note", n.id, err);
          }
        })
      );

      // update state
      const processed = Math.min(i + batchSize, total);
      await setRotationState({ inProgress: true, total, processed, lastUpdated: Date.now() });

      // yield to event loop
      await new Promise((r) => setTimeout(r, 50));
    }
  } finally {
    await clearRotationState();
  }
}
