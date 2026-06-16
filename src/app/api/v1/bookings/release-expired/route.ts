import { releaseExpiredBookings } from "@/lib/booking-expiry";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getCurrentUser } from "@/lib/auth-server";
import { logger } from "@/lib/logger";

/**
 * POST /api/v1/bookings/release-expired
 * يُحرّر التذاكر للحجوزات المنتهية
 * يتطلب صلاحيات المسؤول
 */
export async function POST() {
  try {
    // Verify admin/organizer access
    const dbUser = await getCurrentUser();
    if (!dbUser) return errorResponse("UNAUTHORIZED", "يجب تسجيل الدخول", undefined, 401);
    if (dbUser.role !== "ADMIN" && dbUser.role !== "ORGANIZER") {
      return errorResponse("FORBIDDEN", "صلاحيات غير كافية", undefined, 403);
    }

    const result = await releaseExpiredBookings();
    return successResponse(result, `تم تحرير ${result.released} حجز منتهي`);
  } catch (error: unknown) {
    logger.error("release-expired", "Error releasing expired bookings", error);
    return errorResponse("INTERNAL_ERROR", "حدث خطأ في تحرير الحجوزات", undefined, 500);
  }
}
