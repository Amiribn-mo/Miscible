"use client";

import { useEffect, useState } from "react";

export default function OfflineBadge() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-3 py-1 rounded-full">
      Offline mode
    </div>
  );
}
