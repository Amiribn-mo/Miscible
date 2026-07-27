import { db } from "./db";
import { encryptNote, decryptNote } from "./crypto/hybrid";
import { loadPublicKey } from "./crypto/keyStore";

import { getDerivedKey } from "./session";

export async function createNote(title: string, content: string): Promise<number> {
  const publicKey = await loadPublicKey();
  if (!publicKey) {
    throw new Error("Encryption keys not found. Please complete onboarding first.");
  }

  const encrypted = await encryptNote(content);
  const now = Date.now();

  const id = await db.notes.add({
    title,
    encryptedContent: encrypted.encryptedContent,
    encryptedKey: encrypted.encryptedKey,
    iv: encrypted.iv,
    createdAt: now,
    updatedAt: now,
    formatVersion: 1,
    alg: "AES-GCM+RSA-OAEP",
  });

  return id;
}

export async function updateNote(id: number, title: string, content: string) {
  const enc = await encryptNote(content);
  return db.notes.update(id, { title, ...enc, updatedAt: Date.now() });
}

export async function deleteNote(id: number) {
  return db.notes.delete(id);
}

export async function listNotes() {
  return db.notes.orderBy("createdAt").reverse().toArray();
}


export async function getNote(id: number) {
  const derived = getDerivedKey();
  if (!derived) throw new Error("Not authenticated. Please unlock first.");

  const note = await db.notes.get(id);
  if (!note) return null;

  const content = await decryptNote(note);
  return { ...note, content };
}