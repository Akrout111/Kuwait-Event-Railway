import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { z } from "zod";
import { logger } from "@/lib/logger";

const notificationQuerySchema = z.object({
  page: z.coerce.number({ message: "Page must be a number" }).int({ message: "Page must be an integer" }).min(1, { message: "Page must be at least 1" }).default(1),
  limit: z.coerce.number({ message: "Limit must be a number" }).int({ message: "Limit must be an integer" }).min(1, { message: "Limit must be at least 1" }).max(50, { message: "Limit must be at most 50" }).default(20),
  filter: z.enum(["all", "unread"], { message: "Filter must be 'all' or 'unread'" }).default("all"),
});

/**
 * GET /api/v1/notifications — قائمة إشعارات المستخدم مع صفحات
 */
export async function GET(req: Request) {
  try {
    // 1. Auth check
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. Validate query params
    const { searchParams } = new URL(req.url);
    const parsed = notificationQuerySchema.safeParse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      filter: searchParams.get("filter"),
    });
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return errorResponse("VALIDATION_ERROR", firstError.message, firstError.path[0]?.toString(), 400);
    }

    const { page, limit, filter } = parsed.data;

    // 3. Build where clause
    const where: Record<string, unknown> = {
      userId: dbUser.id,
    };
    if (filter === "unread") {
      where.isRead = false;
    }

    // 4. Fetch notifications with pagination
    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.notification.count({ where }),
    ]);

    // 5. Parse the `data` field from JSON string to object (SQLite stores it as string)
    const parsedNotifications = notifications.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    }));

    // 6. Return with pagination meta
    return successResponse(
      parsedNotifications,
      "تم جلب الإشعارات",
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (error: unknown) {
    logger.error("notifications", "Error fetching notifications", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الإشعارات", undefined, 500);
  }
}

/**
 * PATCH /api/v1/notifications — تعليم كل الإشعارات كمقروءة
 */
export async function PATCH() {
  try {
    // 1. Auth check
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);

    // 2. Update all unread notifications
    const result = await db.notification.updateMany({
      where: {
        userId: dbUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return successResponse(
      { updatedCount: result.count },
      "تم تعليم كل الإشعارات كمقروءة"
    );
  } catch (error: unknown) {
    logger.error("notifications", "Error marking all notifications as read", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في تعليم الإشعارات", undefined, 500);
  }
}
