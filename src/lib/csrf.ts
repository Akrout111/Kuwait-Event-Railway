import Csrf from "csrf";
import { DEV_JWT_SECRET } from "./constants";

// JWT secret resolution — deferred to runtime so the build can succeed
// without secrets. We do NOT throw at module-eval time (Next.js evaluates
// route modules during `next build` to collect page data).
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV !== "production") {
    return DEV_JWT_SECRET;
  }
  throw new Error("JWT_SECRET environment variable is required in production");
}

const csrf = new Csrf();

/**
 * Generate a CSRF token using the server-side JWT secret.
 */
export function generateCsrfToken(): string {
  const secret = getJwtSecret();
  return csrf.create(secret);
}

/**
 * Verify a CSRF token.
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const secret = getJwtSecret();
    return csrf.verify(secret, token);
  } catch {
    return false;
  }
}
