"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadPrivateKey } from "@/lib/crypto/keyStore";

export default function UnlockPage() {
  const router = useRouter();
  const [passphrase, setPassphrase] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = async () => {
    if (!passphrase) return;

    setLoading(true);
    setError("");

    try {
      const privateKey = await loadPrivateKey(passphrase);

      if (!privateKey) {
        setError("Incorrect passphrase");
        setLoading(false);
        return;
      }

      // Store passphrase in session for this session
      sessionStorage.setItem("passphrase", passphrase);

      router.push("/notes");
    } catch (error) {
      console.error("Unlock failed:", error);
      setError("Failed to unlock. Please try again.");
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUnlock();
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
          <h1 className="text-3xl font-bold mb-3">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your passphrase to unlock your notes
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your passphrase"
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleUnlock}
            disabled={loading || !passphrase}
            className="w-full px-6 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full text-lg font-medium disabled:opacity-50 active:scale-95 transition-transform touch-manipulation"
          >
            {loading ? "Unlocking..." : "Unlock"}
          </button>
        </div>
      </div>
    </div>
  );
}