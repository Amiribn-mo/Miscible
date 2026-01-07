"use client";

/**
 * Derives an AES-256 key from a passphrase using PBKDF2
 */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts data with a passphrase-derived key
 */
export async function encryptWithPassphrase(
  data: ArrayBuffer,
  passphrase: string
): Promise<{ encrypted: ArrayBuffer; salt: Uint8Array; iv: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );

  return { encrypted, salt, iv };
}

/**
 * Decrypts data with a passphrase
 */
export async function decryptWithPassphrase(
  encrypted: ArrayBuffer,
  passphrase: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<ArrayBuffer> {
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  return crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encrypted
  );
}