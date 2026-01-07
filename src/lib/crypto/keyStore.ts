"use client";

import { encryptWithPassphrase, decryptWithPassphrase } from "./passphrase";

const DB_NAME = "SecureVaultKeys";
const STORE = "keys";

interface StoredKey {
  type: "public" | "encrypted-private";
  data: ArrayBuffer;
  salt?: Uint8Array;
  iv?: Uint8Array;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2); // Bump version for new schema

    req.onupgradeneeded = (event) => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Save public key (unencrypted)
 */
export async function savePublicKey(publicKeyData: ArrayBuffer) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const storedKey: StoredKey = {
    type: "public",
    data: publicKeyData,
  };
  tx.objectStore(STORE).put(storedKey, "public");

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Save private key (encrypted with passphrase)
 */
export async function savePrivateKey(
  privateKeyData: ArrayBuffer,
  passphrase: string
) {
  const { encrypted, salt, iv } = await encryptWithPassphrase(
    privateKeyData,
    passphrase
  );

  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const storedKey: StoredKey = {
    type: "encrypted-private",
    data: encrypted,
    salt,
    iv,
  };
  tx.objectStore(STORE).put(storedKey, "private");

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load public key
 */
export async function loadPublicKey(): Promise<CryptoKey | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get("public");

  const storedKey = await new Promise<StoredKey | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!storedKey || storedKey.type !== "public") return null;

  return crypto.subtle.importKey(
    "spki",
    storedKey.data,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

/**
 * Load private key (requires passphrase to decrypt)
 */
export async function loadPrivateKey(passphrase: string): Promise<CryptoKey | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get("private");

  const storedKey = await new Promise<StoredKey | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!storedKey || storedKey.type !== "encrypted-private") return null;
  if (!storedKey.salt || !storedKey.iv) return null;

  try {
    const decryptedData = await decryptWithPassphrase(
      storedKey.data,
      passphrase,
      storedKey.salt,
      storedKey.iv
    );

    return crypto.subtle.importKey(
      "pkcs8",
      decryptedData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["decrypt"]
    );
  } catch (error) {
    // Wrong passphrase
    return null;
  }
}

/**
 * Check if keys exist
 */
export async function hasKeys(): Promise<boolean> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get("public");

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(!!req.result);
    req.onerror = () => reject(req.error);
  });
}

// Keep old API for compatibility
export async function saveKey(raw: ArrayBuffer, type: "public" | "private") {
  if (type === "public") {
    return savePublicKey(raw);
  }
  throw new Error("Use savePrivateKey with passphrase instead");
}

export async function loadKey(type: "public" | "private"): Promise<CryptoKey | null> {
  if (type === "public") {
    return loadPublicKey();
  }
  throw new Error("Use loadPrivateKey with passphrase instead");
}