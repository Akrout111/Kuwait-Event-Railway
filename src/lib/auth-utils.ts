/**
 * Shared authentication utilities for Kuwait Events Platform.
 * Consolidates duplicated auth logic from clerk.ts, server-auth.ts, and admin-guard.ts.
 */

import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

const AUTH_COOKIE_NAME = "auth_token";

/**
 * Resolves the current user ID from either Clerk or custom JWT auth.
 * Checks Clerk first, then falls back to the auth cookie.
 * Returns null if no authenticated user is found.
 */
export async function resolveUserId(): Promise<string | null> {
  // Try Clerk auth first
  try {
    const { userId } = await auth();
    if (userId) return userId;
  } catch {
    // Clerk not configured — fall through to custom auth
  }

  // Try custom JWT auth from cookie
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) return payload.userId;
    }
  } catch {
    // Cookie not available — fall through
  }

  return null;
}

/**
 * Find a user by either clerkId or id, ensuring the user is active and not soft-deleted.
 * This consolidates the duplicated OR query across clerk.ts, server-auth.ts, and admin-guard.ts.
 */
export async function findUserByIdentifier(
  userId: string,
  select?: Prisma.UserSelect
) {
  return db.user.findFirst({
    where: {
      OR: [{ clerkId: userId }, { id: userId }],
      isActive: true,
      deletedAt: null,
    },
    select: select ?? undefined,
  });
}
