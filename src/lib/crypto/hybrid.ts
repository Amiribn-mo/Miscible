"use client";

import { loadPublicKey, loadPrivateKey } from "./keyStore";
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
  // Load RSA public key (no passphrase needed for public key)
  const publicKey = await loadPublicKey();
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

  // Export AES key as raw bytes
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);

  // Wrap AES key with RSA public key
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  return {
    encryptedContent,
    encryptedKey,
    iv,
  };
}

/**
 * Decrypts a note by unwrapping the AES key with RSA, then decrypting content
 * Requires passphrase to decrypt the private key
 */
export async function decryptNote(note: EncryptedNote): Promise<string> {
  // Get passphrase from session
  const passphrase = sessionStorage.getItem("passphrase");
  if (!passphrase) {
    throw new Error("Not authenticated. Please unlock first.");
  }

  // Load RSA private key (requires passphrase)
  const privateKey = await loadPrivateKey(passphrase);
  if (!privateKey) throw new Error("Failed to decrypt private key. Wrong passphrase?");

  // Unwrap AES key using RSA private key
  const rawAesKey = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    note.encryptedKey
  );

  // Import the raw AES key
  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

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