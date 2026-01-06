"use client";

import { loadKey } from "./keyStore";
import { encryptAESKeyWithRSA, decryptAESKeyWithRSA } from "./rsaWrap";
import { EncryptedNote } from "../db";

/**
 * Generates a random AES-256-GCM key
 */
async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts note content with AES-GCM, then wraps the AES key with RSA
 */
export async function encryptNote(content: string) {
  // Load RSA public key
  const publicKey = await loadKey("public");
  if (!publicKey) throw new Error("Public key not found");

  // Generate random AES key for this note
  const aesKey = await generateAESKey();

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Encrypt content with AES-GCM
  const encodedContent = new TextEncoder().encode(content);
  const encryptedContent = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    encodedContent
  );

  // Wrap AES key with RSA public key
  const encryptedKey = await encryptAESKeyWithRSA(aesKey, publicKey);

  return {
    encryptedContent,
    encryptedKey,
    iv,
  };
}

/**
 * Decrypts a note by unwrapping the AES key with RSA, then decrypting content
 */
export async function decryptNote(note: EncryptedNote): Promise<string> {
  // Load RSA private key
  const privateKey = await loadKey("private");
  if (!privateKey) throw new Error("Private key not found");

  // Unwrap AES key using RSA private key
  const aesKey = await decryptAESKeyWithRSA(note.encryptedKey, privateKey);

  // Decrypt content with AES-GCM
  const decryptedContent = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(note.iv),
    },
    aesKey,
    note.encryptedContent
  );

  // Convert back to string
  return new TextDecoder().decode(decryptedContent);
}