"use client";

export async function exportPrivateKeyWithPassphrase(
  privateKey: CryptoKey,
  passphrase: string
) {
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

  return {
    salt: Array.from(salt),
    iv: Array.from(iv),
    encryptedPrivateKey: Array.from(new Uint8Array(encryptedPrivateKey)),
  };
}
