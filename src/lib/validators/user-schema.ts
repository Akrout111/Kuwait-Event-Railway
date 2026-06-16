import { z } from "zod";

export const userUpdateSchema = z.object({
  phone: z
    .string({ message: "رقم الهاتف مطلوب" })
    .regex(/^965\d{8}$/, { message: "رقم الهاتف يجب أن يبدأ بـ 965 ويتكون من 11 رقم" })
    .optional(),
  avatarUrl: z.string({ message: "رابط الصورة مطلوب" }).url({ message: "رابط الصورة غير صالح" }).optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
