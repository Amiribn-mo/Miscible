"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useSwipeBack() {
  const router = useRouter();

  useEffect(() => {
    let startX = 0;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      if (startX < 40 && endX - startX > 80) {
        router.back();
      }
    };

    window.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [router]);
}
