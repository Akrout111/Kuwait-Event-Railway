import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

/**
 * PATCH /api/v1/notifications/:id/read — تعليم إشعار كمقروء
 */
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. Await params (Next.js 16 async params)
    const { id } = await params;

    // 3. Find notification and verify ownership
    const notification = await db.notification.findUnique({
      where: { id },
    });
    if (!notification || notification.userId !== dbUser.id) {
      return errorResponse("NOTIFICATION_NOT_FOUND", "الإشعار غير موجود", undefined, 404);
    }

    // 4. Update isRead and readAt
    const updated = await db.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    // 5. Parse data field from JSON string
    const parsedNotification = {
      ...updated,
      data: updated.data ? JSON.parse(updated.data) : null,
    };

    return successResponse(
      { notification: parsedNotification },
      "تم تعليم الإشعار كمقروء"
    );
  } catch (error: unknown) {
    logger.error("notification-read", "Error marking notification as read", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في تعليم الإشعار", undefined, 500);
  }
}
