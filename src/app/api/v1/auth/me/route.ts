import { successResponse, errorResponse } from "@/lib/api-response";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest } from "next/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    // Extract token from Authorization header
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return errorResponse("UNAUTHORIZED", "Authentication required", undefined, 401);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse("UNAUTHORIZED", "Invalid or expired token", undefined, 401);
    }

    const user = await db.user.findUnique({
      where: { id: payload.userId, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        phone: true,
      },
    });

    if (!user) {
      return errorResponse("NOT_FOUND", "User not found", undefined, 404);
    }

    return successResponse(user, "User data retrieved");
  } catch (error: unknown) {
    logger.error("auth-me", "Auth me error", error);
    return errorResponse("INTERNAL_ERROR", "Failed to fetch user data", undefined, 500);
  }
}
