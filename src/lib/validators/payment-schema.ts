import { z } from "zod";

export const initiatePaymentSchema = z.object({
  bookingId: z.string({ message: "يجب تحديد الحجز" }).min(1, { message: "يجب تحديد الحجز" }),
  method: z.enum(["KNET"], { message: "طريقة الدفع غير صالحة" }).default("KNET"),
});

export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>;

export const refundPaymentSchema = z.object({
  reason: z.string({ message: "سبب الاسترداد مطلوب" }).min(3, { message: "يجب ذكر سبب الاسترداد" }).max(500, { message: "سبب الاسترداد يجب أن يكون أقل من 500 حرف" }),
});

export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
