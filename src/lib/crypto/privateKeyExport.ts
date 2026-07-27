"use client";

import { getEncryptedPrivateKeyBlob } from "./keyStore";

export async function exportEncryptedPrivateKeyBlob() {
  // Return the encrypted private key blob as-is for backup (still protected by original passphrase)
  const blob = await getEncryptedPrivateKeyBlob();
  if (!blob) throw new Error("No encrypted private key found");

  return {
    version: blob.metadata?.version ?? 1,
    alg: blob.metadata?.alg ?? "RSA-OAEP-2048-SHA256",
    kdf: blob.metadata?.kdf ?? { id: "pbkdf2", iterations: 100000, hash: "SHA-256" },
    salt: Array.from(new Uint8Array(blob.salt)),
    iv: Array.from(new Uint8Array(blob.iv)),
    encryptedPrivateKey: Array.from(new Uint8Array(blob.encrypted)),
  };
}

export async function exportPrivateKeyWithPassphrase(
  privateKey: CryptoKey,
  passphrase: string
) {
  try {
    const pkcs8 = await crypto.subtle.exportKey("pkcs8", privateKey);

    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const aesKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 250_000,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );

    const encryptedPrivateKey = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      pkcs8
    );

    // Zero pkcs8 buffer immediately
    try {
      const arr = new Uint8Array(pkcs8);
      arr.fill(0);
    } catch (_) {}

    return {
      salt: Array.from(salt),
      iv: Array.from(iv),
      encryptedPrivateKey: Array.from(new Uint8Array(encryptedPrivateKey)),
    };
  } catch (err) {
    throw new Error(
      "Private key is not exportable from memory. Use 'exportEncryptedPrivateKeyBlob' to back up the encrypted private key as stored (still protected by your passphrase)."
    );
  }
}
