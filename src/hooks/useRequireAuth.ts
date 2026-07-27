"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasKeys, loadPublicKey, loadPrivateKeyWithDerivedKey } from "@/lib/crypto/keyStore";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Don't check if on onboarding or unlock pages
    if (pathname === "/onboarding" || pathname === "/unlock") {
      setChecking(false);
      return;
    }

    async function checkAuth() {
      try {
        // Check if keys exist at all
        const keysExist = await hasKeys();

        if (!keysExist) {
          // No keys, need onboarding
          router.push("/onboarding");
          return;
        }

        // Keys exist, check if we have an unlocked session
        const session = await import("@/lib/session");
        const unlocked = session.isUnlocked();

        if (!unlocked) {
          // Need to unlock
          router.push("/unlock");
          return;
        }

        // Verify derived key can load the private key
        const derived = session.getDerivedKey();
        const privateKey = await loadPrivateKeyWithDerivedKey(derived as CryptoKey);

        if (!privateKey) {
          // Invalid session, clear and require unlock
          session.clearDerivedKey();
          router.push("/unlock");
          return;
        }

        // All good
        setAuthenticated(true);
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/unlock");
      } finally {
        setChecking(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  return { checking, authenticated };
}