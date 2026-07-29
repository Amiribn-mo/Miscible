import OfflineBadge from "@/components/OfflineBadge";
import "./globals.css";
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: "Miscible",
  description: "Offline RSA-encrypted notes",
  manifest: "/manifest.json",
};

import SessionManager from "@/components/SessionManager";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <OfflineBadge />
        <SessionManager />
        {children}
      </body>
    </html>
  );
}
