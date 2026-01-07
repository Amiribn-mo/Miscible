"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { loadKey } from "@/lib/crypto/keyStore";

export function useRequireKeys() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [hasKeys, setHasKeys] = useState(false);

  useEffect(() => {
    // Don't check if already on onboarding page
    if (pathname === "/onboarding") {
      setChecking(false);
      return;
    }

    loadKey("public")
      .then((key) => {
        if (!key) {
          // No keys found, redirect to onboarding
          router.push("/onboarding");
        } else {
          setHasKeys(true);
        }
      })
      .finally(() => setChecking(false));
  }, [pathname, router]);

  return { checking, hasKeys };
}