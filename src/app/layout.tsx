import OfflineBadge from "@/components/OfflineBadge";
import "./globals.css";
<meta name="viewport" content="width=device-width, initial-scale=1" />

export const metadata = {
  title: "Miscible",
  description: "Offline RSA-encrypted notes",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-white">
        <OfflineBadge/>
        {children}
      </body>
    </html>
  );
}
