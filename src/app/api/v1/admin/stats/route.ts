import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-guard";
import { logger } from "@/lib/logger";

/**
 * GET /api/v1/admin/stats — Admin dashboard statistics
 * Uses findMany + JS reduce instead of _sum because SQLite stores
 * totalAmount as String and Prisma _sum only works on numeric fields.
 */
export async function GET() {
  try {
    const guard = await requireAdmin();
    if (!guard.success) return guard.response;

    const [
      totalUsers,
      totalEvents,
      totalBookings,
      confirmedBookings,
      totalRevenueRows,
    ] = await Promise.all([
      db.user.count({ where: { isActive: true, deletedAt: null } }),
      db.event.count({ where: { deletedAt: null } }),
      db.booking.count({ where: { deletedAt: null } }),
      db.booking.count({ where: { status: "CONFIRMED", deletedAt: null } }),
      db.booking.findMany({
        where: { status: "CONFIRMED", deletedAt: null },
        select: { totalAmount: true },
      }),
    ]);

    // Calculate total revenue in JS since _sum doesn't work on String fields in SQLite
    const totalRevenue = totalRevenueRows.reduce(
      (sum, b) => sum + parseFloat(b.totalAmount),
      0
    );

    return successResponse(
      {
        totalUsers,
        totalEvents,
        totalBookings,
        confirmedBookings,
        totalRevenue,
      },
      "تم جلب الإحصائيات بنجاح"
    );
  } catch (error: unknown) {
    logger.error("admin-stats", "Error fetching admin stats", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في جلب الإحصائيات", undefined, 500);
  }
}
