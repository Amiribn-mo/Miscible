// src/lib/crypto/keyExport.ts

export async function exportPublicKey(key: CryptoKey) {
  return crypto.subtle.exportKey("spki", key);
}

export async function exportPrivateKey(key: CryptoKey) {
  return crypto.subtle.exportKey("pkcs8", key);
}
