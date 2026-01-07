import Dexie, { Table } from "dexie";

export interface EncryptedNote {
  id?: number;
  title: string;
  encryptedContent: ArrayBuffer;
  encryptedKey: ArrayBuffer;
  iv: Uint8Array;
  createdAt: number;
  updatedAt: number;
}

class DB extends Dexie {
  notes!: Table<EncryptedNote>;

  constructor() {
    super("SecureVault");
    
    // Bump to version 10 to match existing DB
    this.version(10).stores({
      notes: "++id, title, createdAt, updatedAt",
    });
  }
}

export const db = new DB();