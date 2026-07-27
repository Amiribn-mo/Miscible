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

  // Include metadata (versioning and KDF params) for future upgrades
  const metadata = {
    version: 1,
    alg: "RSA-OAEP-2048-SHA256",
    kdf: {
      id: "pbkdf2",
      iterations: 100000,
      hash: "SHA-256",
    },
  };

  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const storedKey: StoredKey = {
    type: "encrypted-private",
    data: encrypted,
    salt,
    iv,
    // @ts-ignore - attach metadata for backups/exports
    metadata,
  };
  tx.objectStore(STORE).put(storedKey, "private");

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Save a private key encrypted directly with an already-derived AES CryptoKey.
 * This avoids requiring the plaintext passphrase when rotating keys while
 * session is unlocked.
 */
export async function savePrivateKeyWithDerivedKey(aesKey: CryptoKey, privateKeyData: ArrayBuffer, metadata?: any) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, privateKeyData);

  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  const storedKey: StoredKey = {
    type: "encrypted-private",
    data: encrypted,
    salt: new Uint8Array(0), // no salt since key already derived
    iv,
    // @ts-ignore
    metadata: metadata ?? { version: 1, alg: 'RSA-OAEP-2048-SHA256', kdf: { id: 'derived' } },
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
  // Backwards-compatible helper that still accepts a passphrase string
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

    // Import private key as non-extractable to reduce risk of exfiltration
    return crypto.subtle.importKey(
      "pkcs8",
      decryptedData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false, // make it non-extractable
      ["decrypt"]
    );
  } catch (error) {
    // Wrong passphrase
    return null;
  }
}

/**
 * Load private key using an already-derived AES CryptoKey. This avoids ever
 * storing/using the plaintext passphrase after derivation.
 */
export async function loadPrivateKeyWithDerivedKey(aesKey: CryptoKey): Promise<CryptoKey | null> {
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
    const decryptedData = await decryptWithKey(storedKey.data, aesKey, storedKey.iv);

    // Import private key as non-extractable to reduce risk of exfiltration
    return crypto.subtle.importKey(
      "pkcs8",
      decryptedData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false, // make it non-extractable
      ["decrypt"]
    );
  } catch (error) {
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

/**
 * Retrieve the encrypted private key blob as stored (no decryption).
 * Useful for backups where the raw encrypted bytes (still protected by passphrase) are exported.
 */
export async function getEncryptedPrivateKeyBlob(): Promise<
  | { encrypted: ArrayBuffer; salt: Uint8Array; iv: Uint8Array; metadata?: any }
  | null
> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get("private");

  const storedKey = await new Promise<any | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  if (!storedKey || storedKey.type !== "encrypted-private") return null;
  if (!storedKey.salt || !storedKey.iv) return null;

  return { encrypted: storedKey.data, salt: storedKey.salt, iv: storedKey.iv, metadata: storedKey.metadata };
}

/**
 * Rotation helpers - store a small rotation state in the keys DB so rotation
 * can be resumed or inspected by UI.
 */
export async function setRotationState(state: any) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put({ type: 'rotation', state }, 'rotation');

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getRotationState(): Promise<any | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get('rotation');

  const res = await new Promise<any | undefined>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

  return res?.state ?? null;
}

export async function clearRotationState() {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete('rotation');

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
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