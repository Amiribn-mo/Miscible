"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { extendExpiry, isUnlocked, clearDerivedKey } from "@/lib/session";

export default function SessionManager() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    function activity() {
      // extend expiry on user activity
      extendExpiry();
    }

    // Basic activity listeners
    window.addEventListener("mousemove", activity);
    window.addEventListener("keydown", activity);
    window.addEventListener("mousedown", activity);
    window.addEventListener("touchstart", activity);

    // Poll for session expiration
    const interval = setInterval(() => {
      if (!mounted) return;
      const unlocked = isUnlocked();
      if (!unlocked) {
        // If not on onboarding or unlock already, redirect to unlock
        if (pathname !== "/unlock" && pathname !== "/onboarding") {
          clearDerivedKey();
          router.push("/unlock");
        }
      }
    }, 3000);

    return () => {
      mounted = false;
      window.removeEventListener("mousemove", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("mousedown", activity);
      window.removeEventListener("touchstart", activity);
      clearInterval(interval);
    };
  }, [router, pathname]);

  return null;
}
