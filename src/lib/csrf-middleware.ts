import { verifyCsrfToken } from "./csrf";
import { errorResponse } from "./api-response";

/**
 * Verify CSRF token for state-changing requests (POST, PUT, PATCH, DELETE).
 * Call this at the start of any state-changing API route handler.
 * Returns null on success, or an error Response on failure.
 */
export function verifyCsrf(req: Request): Response | null {
  // Only verify state-changing methods
  const method = req.method.toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null;
  }

  const token = req.headers.get("X-CSRF-Token");
  if (!token || !verifyCsrfToken(token)) {
    return errorResponse("CSRF_INVALID", "Invalid or missing CSRF token", undefined, 403);
  }

  return null;
}
