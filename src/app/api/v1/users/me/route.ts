import { getCurrentUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { userUpdateSchema } from "@/lib/validators/user-schema";
import { NextRequest } from "next/server";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user)
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    return successResponse(
      { id: user.id, role: user.role, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      "تم جلب بيانات المستخدم"
    );
  } catch (error: unknown) {
    logger.error("users-me", "Error fetching user", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب بيانات المستخدم", undefined, 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    const body = await req.json();
    const parsed = userUpdateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse(
        "VALIDATION_ERROR",
        firstError?.message ?? "بيانات غير صالحة",
        firstError?.path[0]?.toString(),
        400
      );
    }

    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: parsed.data,
    });

    return successResponse(updatedUser, "تم تحديث الملف الشخصي");
  } catch (error: unknown) {
    logger.error("users-me", "Error updating user profile", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في تحديث الملف الشخصي", undefined, 500);
  }
}
