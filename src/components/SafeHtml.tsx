"use client";

import sanitizeHtml from "@/lib/sanitize";

export default function SafeHtml({ html }: { html: string }) {
  const clean = sanitizeHtml(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
