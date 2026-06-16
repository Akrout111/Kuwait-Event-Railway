/**
 * Input sanitization utilities for user-provided data.
 * React Email templates auto-escape JSX, but these utilities
 * provide defense-in-depth for any raw HTML contexts.
 */

/**
 * Sanitize text by escaping HTML special characters.
 * Use this for any user-provided data that might be inserted
 * into raw HTML contexts (not needed for React Email JSX).
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Strip all HTML tags from a string, leaving only text content.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a URL to prevent javascript: protocol attacks.
 * Returns empty string if the URL is not safe.
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("data:")) {
    return "";
  }
  return url.trim();
}
