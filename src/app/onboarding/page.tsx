"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePublicKey, savePrivateKey } from "@/lib/crypto/keyStore";

export default function OnboardingPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSetup = async () => {
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters");
      return;
    }

    if (passphrase !== confirmPassphrase) {
      setError("Passphrases don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Generate RSA keypair
      const keyPair = await crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      // Export keys
      const publicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

      // Save public key (unencrypted)
      await savePublicKey(publicKey);

      // Save private key (encrypted with passphrase)
      await savePrivateKey(privateKey, passphrase);

      // Store passphrase in session for immediate use
      sessionStorage.setItem("passphrase", passphrase);

      router.push("/notes");
    } catch (error) {
      console.error("Setup failed:", error);
      setError("Failed to set up encryption. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-neutral-900 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-black dark:bg-white flex items-center justify-center">
            <svg className="w-10 h-10 text-white dark:text-black" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3">Create Your Passphrase</h1>
          <p className="text-gray-600 dark:text-gray-400">
            This passphrase encrypts your notes. You'll need it to access your notes on any device.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Passphrase</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter passphrase (min 8 characters)"
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Passphrase</label>
            <input
              type="password"
              value={confirmPassphrase}
              onChange={(e) => setConfirmPassphrase(e.target.value)}
              placeholder="Re-enter passphrase"
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleSetup}
            disabled={loading || !passphrase || !confirmPassphrase}
            className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-lg font-medium disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
          >
            {loading ? "Setting up..." : "Create Encryption Keys"}
          </button>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ <strong>Important:</strong> Store this passphrase safely. Without it, you cannot access your notes on new devices. We cannot recover it for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}