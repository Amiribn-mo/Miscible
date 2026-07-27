// src/lib/crypto/keyExport.ts

export async function exportPublicKey(key: CryptoKey) {
  return crypto.subtle.exportKey("spki", key);
}

export async function exportPrivateKey(key: CryptoKey) {
  try {
    return await crypto.subtle.exportKey("pkcs8", key);
  } catch (err) {
    throw new Error(
      "Private key is not exportable. This operation is disallowed for security reasons."
    );
  }
}
