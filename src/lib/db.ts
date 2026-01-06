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
    this.version(1).stores({
      notes: "++id, title, updatedAt",
    });
  }
}

export const db = new DB();
