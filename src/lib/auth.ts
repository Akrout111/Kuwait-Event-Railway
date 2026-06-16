/**
 * Custom authentication utilities for Kuwait Events Platform.
 * Uses bcrypt for password hashing and JWT for session tokens.
 * Works independently of Clerk — no external auth service required.
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DEV_JWT_SECRET } from "./constants";

// Ensure JWT_SECRET is available — provide a dev default if missing
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  process.env.JWT_SECRET = DEV_JWT_SECRET;
}

const JWT_SECRET = process.env.JWT_SECRET;
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
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

/** Verify and decode a JWT token */
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}
