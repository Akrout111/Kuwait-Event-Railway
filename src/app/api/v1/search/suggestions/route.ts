import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

const suggestionsSchema = z.object({
  q: z.string({ message: "استعلام البحث مطلوب" }).min(2, { message: "يجب أن يكون الاستعلام حرفين على الأقل" }).max(100, { message: "يجب أن يكون الاستعلام أقل من 100 حرف" }),
  limit: z.coerce.number({ message: "الحد يجب أن يكون رقماً" }).int({ message: "الحد يجب أن يكون عدداً صحيحاً" }).min(1, { message: "الحد الأدنى هو 1" }).max(10, { message: "الحد الأقصى هو 10" }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limit check
    const rateLimitResult = checkRateLimit(getClientIdentifier(request), { limit: 30, windowSeconds: 60 });
    if (!rateLimitResult.allowed) {
      return errorResponse("RATE_LIMITED", "Too many requests. Please try again later.", undefined, 429);
    }

    const { searchParams } = request.nextUrl;
    const parsed = suggestionsSchema.safeParse({
      q: searchParams.get("q"),
      limit: searchParams.get("limit") ?? "5",
    });

    if (!parsed.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "يجب أن يكون الاستعلام حرفين على الأقل",
        undefined,
        400
      );
    }

    const { q, limit = 5 } = parsed.data;
    const searchTerm = q.trim();

    // SQLite-compatible search using Prisma contains
    const events = await db.event.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
        OR: [
          { titleAr: { contains: searchTerm } },
          { titleEn: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        titleAr: true,
        titleEn: true,
        slug: true,
      },
      take: limit,
      orderBy: { startDate: "asc" },
    });

    const data = events.map((e) => ({
      id: e.id,
      titleAr: e.titleAr,
      titleEn: e.titleEn,
      slug: e.slug,
    }));

    return successResponse(data, "تم جلب الاقتراحات");
  } catch (error: unknown) {
    logger.error("suggestions", "Error fetching suggestions", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "خطأ في جلب الاقتراحات",
      undefined,
      500
    );
  }
}
