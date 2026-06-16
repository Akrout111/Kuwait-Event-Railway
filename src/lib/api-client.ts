/**
 * Client-side API utility with automatic CSRF token handling.
 * Fetches a CSRF token on first mutation request and includes it
 * in the X-CSRF-Token header for all state-changing requests.
 */

let csrfToken: string | null = null;

async function fetchCsrfToken(): Promise<string> {
  const res = await fetch("/api/v1/csrf-token");
  const data = await res.json();
  if (data?.success && data?.data?.token) {
    csrfToken = data.data.token;
    return csrfToken;
  }
  throw new Error("Failed to fetch CSRF token");
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T; success: boolean; message?: string; meta?: unknown; error?: { code: string; message: string; field?: string | null } }> {
  const method = (options.method || "GET").toUpperCase();

  // For state-changing requests, ensure we have a CSRF token
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    // Add CSRF token header
    const headers = new Headers(options.headers || {});
    if (csrfToken) {
      headers.set("X-CSRF-Token", csrfToken);
    }
    options.headers = headers;
  }

  const res = await fetch(url, options);
  return res.json();
}

/**
 * Reset CSRF token (call after authentication changes).
 */
export function resetCsrfToken(): void {
  csrfToken = null;
}
