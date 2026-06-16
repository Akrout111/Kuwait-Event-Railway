import { z } from "zod";

// ── User Management ──
export const changeUserRoleSchema = z.object({
  role: z.enum(["ATTENDEE", "ORGANIZER", "ADMIN"], {
    message: "الدور مطلوب",
  }),
});

export const toggleUserActiveSchema = z.object({
  isActive: z.boolean({
    message: "حالة التفعيل مطلوبة",
  }),
});

export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type ToggleUserActiveInput = z.infer<typeof toggleUserActiveSchema>;

// ── Category Management ──
export const createCategorySchema = z.object({
  nameAr: z
    .string({ message: "اسم التصنيف بالعربية مطلوب" })
    .min(2, { message: "اسم التصنيف بالعربية يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "اسم التصنيف يجب أن يكون أقل من 100 حرف" }),
  nameEn: z
    .string({ message: "اسم التصنيف بالإنجليزية مطلوب" })
    .min(2, { message: "Category name must be at least 2 characters" })
    .max(100, { message: "Category name must be less than 100 characters" })
    .optional(),
  slug: z
    .string({ message: "الرابط المختصر مطلوب" })
    .min(2, { message: "الرابط المختصر يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الرابط المختصر يجب أن يكون أقل من 100 حرف" })
    .regex(
      /^[a-z0-9-]+$/,
      { message: "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط" }
    ),
  iconUrl: z
    .string({ message: "رابط الأيقونة مطلوب" })
    .url({ message: "رابط الأيقونة غير صالح" })
    .optional()
    .or(z.literal("")),
  description: z.string({ message: "الوصف مطلوب" }).max(500, { message: "الوصف يجب أن يكون أقل من 500 حرف" }).optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  nameAr: z.string({ message: "اسم التصنيف بالعربية مطلوب" }).min(2, { message: "اسم التصنيف بالعربية يجب أن يكون حرفين على الأقل" }).max(100, { message: "اسم التصنيف يجب أن يكون أقل من 100 حرف" }).optional(),
  slug: z
    .string({ message: "الرابط المختصر مطلوب" })
    .min(2, { message: "الرابط المختصر يجب أن يكون حرفين على الأقل" })
    .max(100, { message: "الرابط المختصر يجب أن يكون أقل من 100 حرف" })
    .regex(/^[a-z0-9-]+$/, { message: "الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط" })
    .optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

// ── Event Moderation ──
export const featureEventSchema = z.object({
  isFeatured: z.boolean({
    message: "حالة التمييز مطلوبة",
  }),
});

export const changeEventStatusSchema = z.object({
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "SOLD_OUT", "COMPLETED"], {
    message: "حالة الفعالية مطلوبة",
  }),
});

export type FeatureEventInput = z.infer<typeof featureEventSchema>;
export type ChangeEventStatusInput = z.infer<typeof changeEventStatusSchema>;
