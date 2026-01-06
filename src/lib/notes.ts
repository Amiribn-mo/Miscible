import { db } from "./db";
import { encryptNote, decryptNote } from "./crypto/hybrid";

export async function createNote(title: string, content: string) {
  const encrypted = await encryptNote(content);
  const now = Date.now();

  return db.notes.add({
    title,
    encryptedContent: encrypted.encryptedContent,
    encryptedKey: encrypted.encryptedKey,
    iv: encrypted.iv,
    createdAt: now,
    updatedAt: now,
  });
}


export async function updateNote(id: number, title: string, content: string) {
  const enc = await encryptNote(content);
  return db.notes.update(id, { title, ...enc, updatedAt: Date.now() });
}

export async function deleteNote(id: number) {
  return db.notes.delete(id);
}

export async function listNotes() {
  return db.notes.toArray();
}

export async function getNote(id: number) {
  const note = await db.notes.get(id);
  if (!note) return null;
  const content = await decryptNote(note);
  return { ...note, content };
}
