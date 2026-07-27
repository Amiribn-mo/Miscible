// src/lib/session.ts

import { deriveKeyFromPassphrase } from "./crypto/passphrase";

const EXPIRES_AT_KEY = "passphrase_expires_at";

// Default TTL: 15 minutes
const DEFAULT_TTL_MS = 15 * 60 * 1000;

let derivedKey: CryptoKey | null = null;

/**
 * Derives and stores an AES CryptoKey in memory, sets an expiry in sessionStorage.
 * Returns true if we could derive a key (private key blob must exist with salt).
 */
export async function setPassphrase(passphrase: string, ttlMs = DEFAULT_TTL_MS) {
  // Dynamically import keyStore to avoid circular imports at module init
  const { getEncryptedPrivateKeyBlob } = await import("./crypto/keyStore");
  const blob = await getEncryptedPrivateKeyBlob();
  if (!blob) return false;

  // Derive AES key using the stored salt
  const aesKey = await deriveKeyFromPassphrase(passphrase, blob.salt);

  derivedKey = aesKey;
  const expiresAt = Date.now() + ttlMs;
  sessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));

  // Zero-passphrase handling: do not store the passphrase anywhere
  return true;
}

/**
 * Get the in-memory derived AES key, returning null if expired or not set
 */
export function getDerivedKey(): CryptoKey | null {
  const exp = sessionStorage.getItem(EXPIRES_AT_KEY);
  if (!derivedKey || !exp) return null;
  const expiresAt = Number(exp);
  if (Date.now() > expiresAt) {
    clearDerivedKey();
    return null;
  }
  return derivedKey;
}

/**
 * Clear the in-memory derived key and session expiry markers
 */
export function clearDerivedKey() {
  derivedKey = null;
  sessionStorage.removeItem(EXPIRES_AT_KEY);
}

export function extendExpiry(ttlMs = DEFAULT_TTL_MS) {
  const key = getDerivedKey();
  if (!key) return;
  const expiresAt = Date.now() + ttlMs;
  sessionStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
}

export function isUnlocked() {
  return getDerivedKey() !== null;
}
