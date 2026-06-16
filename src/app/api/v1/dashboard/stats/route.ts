import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

/**
 * GET /api/v1/dashboard/stats — User dashboard statistics
 * Uses findMany + JS reduce instead of _sum because SQLite stores
 * totalAmount as String and Prisma _sum only works on numeric fields.
 */
export async function GET() {
  try {
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    if (dbUser.role !== "ORGANIZER" && dbUser.role !== "ADMIN") return errorResponse("FORBIDDEN", "الوصول مرفوض", undefined, 403);

    const [
      upcomingBookings,
      confirmedBookings,
      totalSpentRows,
    ] = await Promise.all([
      db.booking.count({
        where: {
          userId: dbUser.id,
          status: "CONFIRMED",
          deletedAt: null,
          event: { startDate: { gte: new Date() } },
        },
      }),
      db.booking.count({
        where: {
          userId: dbUser.id,
          status: "CONFIRMED",
          deletedAt: null,
        },
      }),
      db.booking.findMany({
        where: {
          userId: dbUser.id,
          status: "CONFIRMED",
          deletedAt: null,
        },
        select: { totalAmount: true },
      }),
    ]);

    // Calculate total spent in JS since _sum doesn't work on String fields in SQLite
    const totalSpent = totalSpentRows.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount),
      0
    );

    return successResponse(
      {
        upcomingBookings,
        confirmedBookings,
        totalSpent,
      },
      "تم جلب إحصائيات لوحة التحكم بنجاح"
    );
  } catch (error: unknown) {
    logger.error("dashboard-stats", "Error fetching dashboard stats", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الإحصائيات", undefined, 500);
  }
}
