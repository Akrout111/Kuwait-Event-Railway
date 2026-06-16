import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { signUpSchema } from "@/lib/validators/auth-schema";
import { hashPassword, createToken } from "@/lib/auth";
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
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message ?? "Invalid data",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const { name, email, password, phone } = parsed.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(
        "CONFLICT",
        "An account with this email already exists",
        "email",
        409
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with a generated clerkId for custom auth
    const customClerkId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const user = await db.user.create({
      data: {
        clerkId: customClerkId,
        email,
        name,
        phone: phone || null,
        passwordHash,
        role: "ATTENDEE",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    // Create JWT token
    const token = createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      { user, token },
      "Account created successfully"
    );
  } catch (error: unknown) {
    logger.error("auth-register", "Registration error", error);
    return errorResponse("INTERNAL_ERROR", "Failed to create account", undefined, 500);
  }
}
