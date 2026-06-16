/**
 * Server-side authentication helper.
 * Supports both Clerk and custom JWT auth (from cookie).
 * Use this in server components and API routes to get the current user.
 */

import { resolveUserId, findUserByIdentifier } from "@/lib/auth-utils";

/**
 * Get the current user ID from either Clerk or custom JWT auth.
 * Returns null if not authenticated.
 */
export async function getServerUserId(): Promise<string | null> {
  return resolveUserId();
}

/**
 * Get the current authenticated user from either Clerk or custom JWT auth.
 * Returns the full user record or null if not authenticated / not found.
 */
export async function getServerUser() {
  const userId = await resolveUserId();
  if (!userId) return null;

  return findUserByIdentifier(userId, {
    id: true,
    clerkId: true,
    name: true,
    email: true,
    role: true,
    avatarUrl: true,
    phone: true,
  });
}

/**
 * Require authentication — redirects to login if not authenticated.
 * Use in server components that require a logged-in user.
 */
export async function requireServerUser(locale: string) {
  const user = await getServerUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect(`/${locale}/login`);
  }
  return user;
}
