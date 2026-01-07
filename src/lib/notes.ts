import { db } from "./db";
import { encryptNote, decryptNote } from "./crypto/hybrid";
import { loadPublicKey, loadPrivateKey } from "./crypto/keyStore";

function getPassphrase(): string {
  const passphrase = sessionStorage.getItem("passphrase");
  if (!passphrase) {
    throw new Error("Not authenticated. Please unlock first.");
  }
  return passphrase;
}

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
  const passphrase = getPassphrase();
  const privateKey = await loadPrivateKey(passphrase);
  
  if (!privateKey) {
    throw new Error("Failed to decrypt. Wrong passphrase.");
  }

  const note = await db.notes.get(id);
  if (!note) return null;

  const content = await decryptNote(note);
  return { ...note, content };
}