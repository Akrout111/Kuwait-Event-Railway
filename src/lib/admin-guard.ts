/**
 * Admin authorization guard.
 * Verifies that the current user has ADMIN role.
 * Supports both Clerk and custom JWT authentication.
 */

import { resolveUserId, findUserByIdentifier } from "@/lib/auth-utils";
import { errorResponse } from "@/lib/api-response";

/**
 * Verifies that the current user has ADMIN role.
 * Call this at the top of every admin API route handler.
 * Returns the user record on success, or an error Response on failure.
 */
export async function requireAdmin(): Promise<
  | { success: true; user: { id: string; clerkId: string; role: string; email: string } }
  | { success: false; response: Response }
> {
  const userId = await resolveUserId();

  if (!userId) {
    return {
      success: false,
      response: errorResponse("UNAUTHORIZED", "Authentication required", undefined, 401),
    };
  }

  const user = await findUserByIdentifier(userId, {
    id: true,
    clerkId: true,
    role: true,
    email: true,
  });

  if (!user || user.role !== "ADMIN") {
    return {
      success: false,
      response: errorResponse("FORBIDDEN", "Admin access required", undefined, 403),
    };
  }

  return { success: true, user };
}
