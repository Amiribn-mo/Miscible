import createDOMPurify from "isomorphic-dompurify";

// Create a DOMPurify instance for the current environment (browser or server).
// For server-side, isomorphic-dompurify will use a JSDOM-backed window.
const DOMPurify = createDOMPurify(
  typeof window !== "undefined" ? (window as any) : (globalThis as any)
);

export function sanitizeHtml(html: string) {
  // Be conservative about allowed tags/attrs to reduce XSS surface.
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
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
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
    FORCE_BODY: true,
  });
}

export default sanitizeHtml;
