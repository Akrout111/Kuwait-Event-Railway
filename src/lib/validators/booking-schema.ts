import { z } from "zod";

export const createBookingSchema = z.object({
  eventId: z.string({ message: "يجب اختيار الفعالية" }).min(1, { message: "يجب اختيار الفعالية" }),
  attendeeName: z.string({ message: "الاسم مطلوب" }).min(3, { message: "الاسم يجب أن يكون 3 أحرف على الأقل" }).max(100, { message: "الاسم يجب أن يكون أقل من 100 حرف" }),
  attendeePhone: z.string({ message: "رقم الهاتف مطلوب" }).regex(/^965\d{8}$/, { message: "رقم الهاتف يجب أن يبدأ بـ 965 ويتكون من 11 رقم" }),
  attendeeEmail: z.string({ message: "البريد الإلكتروني مطلوب" }).email({ message: "البريد الإلكتروني غير صالح" }),
  tickets: z.array(
    z.object({
      ticketTierId: z.string({ message: "فئة التذكرة مطلوبة" }).min(1, { message: "فئة التذكرة مطلوبة" }),
      quantity: z.number({ message: "الكمية مطلوبة" }).int({ message: "الكمية يجب أن تكون عدداً صحيحاً" }).min(1, { message: "يجب اختيار تذكرة واحدة على الأقل" }).max(50, { message: "الحد الأقصى 50 تذكرة للحجز الواحد" }),
    })
  ).min(1, { message: "يجب اختيار تذكرة واحدة على الأقل" }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
