import { z } from "zod";

export const createEventSchema = z.object({
  titleAr: z.string({ message: "عنوان الفعالية بالعربية مطلوب" }).min(3, { message: "عنوان الفعالية يجب أن يكون 3 أحرف على الأقل" }).max(200, { message: "عنوان الفعالية يجب أن يكون أقل من 200 حرف" }),
  titleEn: z.string({ message: "عنوان الفعالية بالإنجليزية مطلوب" }).min(3, { message: "Event title must be at least 3 characters" }).max(200, { message: "Event title must be less than 200 characters" }).optional(),
  descriptionAr: z.string({ message: "وصف الفعالية بالعربية مطلوب" }).min(10, { message: "الوصف يجب أن يكون 10 أحرف على الأقل" }),
  descriptionEn: z.string({ message: "وصف الفعالية بالإنجليزية مطلوب" }).optional(),
  coverImageUrl: z.string({ message: "صورة الغلاف مطلوبة" }).url({ message: "رابط الصورة غير صالح" }),
  galleryUrls: z.string({ message: "روابط المعرض مطلوبة" }).default("[]"), // JSON array stored as string
  startDate: z.string({ message: "تاريخ البداية مطلوب" }).regex(/^\d{4}-\d{2}-\d{2}$/, { message: "صيغة التاريخ غير صحيحة" }),
  startTime: z.string({ message: "وقت البداية مطلوب" }).regex(/^\d{2}:\d{2}$/, { message: "صيغة الوقت غير صحيحة" }),
  endTime: z.string({ message: "وقت الانتهاء مطلوب" }).regex(/^\d{2}:\d{2}$/, { message: "صيغة وقت الانتهاء غير صحيحة" }).optional(),
  endDate: z.string({ message: "تاريخ الانتهاء مطلوب" }).regex(/^\d{4}-\d{2}-\d{2}$/, { message: "صيغة تاريخ الانتهاء غير صحيحة" }).optional(),
  categoryId: z.string({ message: "التصنيف مطلوب" }).min(1, { message: "يجب اختيار التصنيف" }),
  venueId: z.string({ message: "معرف الموقع مطلوب" }).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "SOLD_OUT", "COMPLETED"], { message: "حالة الفعالية غير صالحة" }).default("DRAFT"),
  metadata: z.record(z.string(), z.unknown()).optional(),
  ticketTiers: z.array(
    z.object({
      nameAr: z.string({ message: "اسم التذكرة بالعربية مطلوب" }).min(1, { message: "اسم التذكرة مطلوب" }),
      nameEn: z.string({ message: "اسم التذكرة بالإنجليزية مطلوب" }).optional(),
      type: z.enum(["STANDARD", "VIP", "EARLY_BIRD", "GROUP"], { message: "نوع التذكرة غير صالح" }),
      price: z.string({ message: "السعر مطلوب" }).regex(/^\d+\.\d{3}$/, { message: "صيغة السعر غير صحيحة (مثال: 15.000)" }),
      quantityTotal: z.number({ message: "الكمية مطلوبة" }).int({ message: "الكمية يجب أن تكون عدداً صحيحاً" }).positive({ message: "الكمية يجب أن تكون أكبر من 0" }),
      maxPerBooking: z.number({ message: "الحد الأقصى للحجز مطلوب" }).int({ message: "يجب أن يكون عدداً صحيحاً" }).min(1, { message: "الحد الأدنى 1 تذكرة للحجز" }).max(50, { message: "الحد الأقصى 50 تذكرة للحجز" }).default(10),
      description: z.string({ message: "وصف التذكرة مطلوب" }).optional(),
    })
  ).min(1, { message: "يجب إضافة فئة تذكرة واحدة على الأقل" }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial();
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
