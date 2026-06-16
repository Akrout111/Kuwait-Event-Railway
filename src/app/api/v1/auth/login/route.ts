import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { signInSchema } from "@/lib/validators/auth-schema";
import { verifyPassword, createToken } from "@/lib/auth";
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
    const parsed = signInSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message ?? "Invalid data",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const { email, password } = parsed.data;

    // Find user by email
    const user = await db.user.findUnique({
      where: { email, isActive: true, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        "email",
        401
      );
    }

    // Verify password
    if (!user.passwordHash) {
      return errorResponse(
        "SOCIAL_LOGIN_ONLY",
        "This account uses social login",
        "email",
        401
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return errorResponse(
        "INVALID_CREDENTIALS",
        "Invalid email or password",
        "password",
        401
      );
    }

    // Create JWT token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user without passwordHash
    const { passwordHash: _, ...safeUser } = user;

    return successResponse(
      { user: safeUser, token },
      "Signed in successfully"
    );
  } catch (error: unknown) {
    logger.error("auth-login", "Login error", error);
    return errorResponse("INTERNAL_ERROR", "Failed to sign in", undefined, 500);
  }
}
