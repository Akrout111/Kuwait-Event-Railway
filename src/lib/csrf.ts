import Csrf from "csrf";
import { DEV_JWT_SECRET } from "./constants";

const csrf = new Csrf();

// Ensure JWT_SECRET is available — provide a dev default if missing
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  process.env.JWT_SECRET = DEV_JWT_SECRET;
}

/**
 * Generate a CSRF token using the server-side JWT secret.
 */
export function generateCsrfToken(): string {
  const secret = process.env.JWT_SECRET!;
  return csrf.create(secret);
}

/**
 * Verify a CSRF token.
 */
export function verifyCsrfToken(token: string): boolean {
  try {
    const secret = process.env.JWT_SECRET!;
    return csrf.verify(secret, token);
  } catch {
    return false;
  }
}
