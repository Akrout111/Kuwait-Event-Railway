import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number({ message: "التقييم مطلوب" })
    .int({ message: "التقييم يجب أن يكون رقم صحيح" })
    .min(1, { message: "الحد الأدنى للتقييم هو 1" })
    .max(5, { message: "الحد الأقصى للتقييم هو 5" }),
  comment: z
    .string({ message: "التعليق مطلوب" })
    .max(1000, { message: "التعليق يجب أن يكون أقل من 1000 حرف" })
    .optional()
    .or(z.literal("")),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
