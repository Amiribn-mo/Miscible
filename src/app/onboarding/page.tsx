"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRSAKeyPair } from "@/lib/crypto/rsa";
import { saveKey } from "@/lib/crypto/keyStore";
import { exportPrivateKeyWithPassphrase } from "@/lib/crypto/privateKeyExport";

export default function Onboarding() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);

  async function setup() {
    if (passphrase.length < 6) {
      alert("Passphrase must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Generate RSA keypair
      const { publicKey, privateKey } = await generateRSAKeyPair();

      // Export keys for storage
      const publicKeyRaw = await crypto.subtle.exportKey("spki", publicKey);
      const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", privateKey);

      // Save both keys to IndexedDB
      await saveKey(publicKeyRaw, "public");
      await saveKey(privateKeyRaw, "private");

      // Export encrypted backup of private key
      const encryptedKey = await exportPrivateKeyWithPassphrase(
        privateKey,
        passphrase
      );

      // Download backup file
      const blob = new Blob(
        [JSON.stringify(encryptedKey)],
        { type: "application/json" }
      );

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "securevault-private-key.svaultkey";
      a.click();

      // Navigate to notes
      router.push("/notes");
    } catch (error) {
      console.error("Setup failed:", error);
      alert("Failed to set up encryption. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-sm w-full space-y-4">
        <h1 className="text-2xl font-semibold">SecureVault Setup</h1>
        
        <div className="text-sm text-gray-400 space-y-2">
          <p>Your encryption keys will be generated locally.</p>
          <p className="font-semibold text-yellow-400">
            ⚠️ Save the backup file! If you lose your browser data, this is your only way to recover your notes.
          </p>
        </div>

        <input
          type="password"
          placeholder="Passphrase (protects your private key)"
          className="w-full border rounded px-3 py-2 text-black"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
        />

        <button
          onClick={setup}
          disabled={loading}
          className="w-full bg-black text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Encryption Keys"}
        </button>
      </div>
    </main>
  );
}