"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasKeys, loadPublicKey, loadPrivateKey } from "@/lib/crypto/keyStore";

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

        // Keys exist, check if we have passphrase in session
        const passphrase = sessionStorage.getItem("passphrase");

        if (!passphrase) {
          // Need to unlock
          router.push("/unlock");
          return;
        }

        // Verify passphrase works
        const privateKey = await loadPrivateKey(passphrase);

        if (!privateKey) {
          // Invalid session passphrase, need to unlock
          sessionStorage.removeItem("passphrase");
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