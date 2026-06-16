/**
 * Server-side authentication helpers.
 * Renamed from clerk.ts — now uses shared auth utilities.
 */

import { resolveUserId, findUserByIdentifier } from "@/lib/auth-utils";

export async function getCurrentUser() {
  const userId = await resolveUserId();
  if (!userId) return null;

  return findUserByIdentifier(userId);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}
