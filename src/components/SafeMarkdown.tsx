"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

// Strict sanitization schema aligned to app policy (keep conservative tag/attr set)
const schema = {
  tagNames: [
    "a",
    "b",
    "i",
    "em",
    "strong",
    "p",
    "ul",
    "ol",
    "li",
    "br",
    "code",
    "pre",
    "h1",
    "h2",
    "h3",
    "blockquote",
    "img",
  ],
  attributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
  },
  protocols: {
    href: ["http", "https", "mailto"],
    src: ["http", "https", "data"],
  },
};

export default function SafeMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      // Allow raw HTML in markdown but sanitize it strictly using rehypeSanitize
      rehypePlugins={[rehypeRaw, [rehypeSanitize, schema]]}
      components={{
        // Ensure links open safely and include rel for external links
        a: ({ node, ...props }) => {
          const href = String(props.href ?? "");
          const isExternal = /^(https?:)?\/\//.test(href);
          return (
            <a
              {...props}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
            />
          );
        },
        // Keep code/pre rendering default (no dangerous HTML injection)
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
