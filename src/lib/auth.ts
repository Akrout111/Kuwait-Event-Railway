/**
 * Custom authentication utilities for Kuwait Events Platform.
 * Uses bcrypt for password hashing and JWT for session tokens.
 * Works independently of Clerk — no external auth service required.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DEV_JWT_SECRET } from "./constants";

// JWT secret resolution — deferred to runtime so the build can succeed
// without secrets. We do NOT throw at module-eval time (Next.js evaluates
// route modules during `next build` to collect page data).
function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // Allow dev fallback in non-production (e.g. local `next dev`)
  if (process.env.NODE_ENV !== "production") {
    return DEV_JWT_SECRET;
  }
  // Production runtime without secret — throw at call time, not module-eval time
  throw new Error("JWT_SECRET environment variable is required in production");
}

const SALT_ROUNDS = 10;

/** Hash a plaintext password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Verify a plaintext password against a hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Create a JWT token for a user */
export function createToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "1d" });
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}
