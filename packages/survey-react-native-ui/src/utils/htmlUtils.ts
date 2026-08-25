/**
 * htmlUtils.ts
 * Minimal HTML sanitization utility for the React Native survey renderer.
 *
 * Security: This module intentionally strips HTML rather than parsing it.
 * No external HTML parser, no WebView, no script execution.
 */

/**
 * Strips all HTML tags from an HTML string and returns plain text.
 * Preserves text content inside tags.
 *
 * Supported transformations:
 * - <br>, <br /> -> newline
 * - <p>, </p>, <div>, </div>, <li> -> newline prefix
 * - All other tags -> removed, text content preserved
 * - HTML entities: &amp; &lt; &gt; &nbsp; &quot; decoded
 *
 * NOT supported (intentionally):
 * - Bold/italic/underline formatting
 * - Links (href ignored)
 * - Images inside HTML
 * - Tables
 */
export function stripHtml(html: string): string {
  if (!html) return "";

  let result = html;

  // Convert block-level breaks to newlines before stripping
  result = result.replace(/<br\s*\/?>/gi, "\n");
  result = result.replace(/<\/p\s*>/gi, "\n");
  result = result.replace(/<p\s*[^>]*>/gi, "");
  result = result.replace(/<\/div\s*>/gi, "\n");
  result = result.replace(/<div\s*[^>]*>/gi, "");
  result = result.replace(/<li\s*[^>]*>/gi, "\n\u2022 ");

  // Strip remaining tags
  result = result.replace(/<[^>]*>/g, "");

  // Decode common HTML entities
  result = result
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");

  // Collapse multiple consecutive blank lines to at most two
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim();
}
