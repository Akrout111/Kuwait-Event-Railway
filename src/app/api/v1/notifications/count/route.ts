import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

/**
 * GET /api/v1/notifications/count — عدد الإشعارات غير المقروءة
 */
export async function GET() {
  try {
    // 1. Auth check
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. Count unread notifications
    const unreadCount = await db.notification.count({
      where: {
        userId: dbUser.id,
        isRead: false,
      },
    });

    return successResponse(
      { unreadCount },
      "تم جلب عدد الإشعارات غير المقروءة"
    );
  } catch (error: unknown) {
    logger.error("notifications-count", "Error fetching notification count", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب عدد الإشعارات", undefined, 500);
  }
}
