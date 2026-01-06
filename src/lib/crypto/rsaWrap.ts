"use client";

export async function encryptAESKeyWithRSA(
  aesKey: CryptoKey,
  publicKey: CryptoKey
) {
  const rawKey = await window.crypto.subtle.exportKey("raw", aesKey);

  return window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    rawKey
  );
}

export async function decryptAESKeyWithRSA(
  encryptedKey: ArrayBuffer,
  privateKey: CryptoKey
) {
  const rawKey = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey,
    encryptedKey
  );

  return window.crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    true,
    ["encrypt", "decrypt"]
  );
}
