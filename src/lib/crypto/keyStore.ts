"use client";

const DB_NAME = "SecureVaultKeys";
const STORE = "keys";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);

    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveKey(
  raw: ArrayBuffer,
  type: "public" | "private"
) {
  const db = await openDB();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).put(raw, type);

  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getRawKey(type: "public" | "private"): Promise<ArrayBuffer | null> {
  const db = await openDB();
  const tx = db.transaction(STORE, "readonly");
  const req = tx.objectStore(STORE).get(type);

  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function loadKey(type: "public" | "private"): Promise<CryptoKey | null> {
  const raw = await getRawKey(type);
  if (!raw) return null;

  return crypto.subtle.importKey(
    type === "public" ? "spki" : "pkcs8",
    raw, // ✅ REAL ArrayBuffer now
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    type === "public" ? ["encrypt"] : ["decrypt"]
  );
}
