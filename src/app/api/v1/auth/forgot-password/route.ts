import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { forgotPasswordSchema } from "@/lib/validators/auth-schema";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = checkRateLimit(getClientIdentifier(req), { limit: 5, windowSeconds: 60 });
  if (!rateLimitResult.allowed) {
    return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
  }

  try {
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message ?? "Invalid data",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const { email } = parsed.data;

    // Always return success to prevent email enumeration
    const user = await db.user.findUnique({
      where: { email, isActive: true, deletedAt: null },
    });

    if (user) {
      // In production, send a password reset email here
      // For now, we just acknowledge the request
      logger.info("forgot-password", "Password reset requested", { email });
    }

    return successResponse(
      null,
      "If an account exists with this email, you will receive a password reset link"
    );
  } catch (error: unknown) {
    logger.error("forgot-password", "Forgot password error", error);
    return errorResponse("INTERNAL_ERROR", "Failed to process request", undefined, 500);
  }
}
