import { z } from "zod";

export const validateTicketSchema = z.object({
  ticketNumber: z
    .string({ message: "رقم التذكرة مطلوب" })
    .regex(/^TCK-[A-Z0-9]{4}-[A-Z0-9]{4}$/, { message: "صيغة رقم التذكرة غير صالحة (TCK-XXXX-XXXX)" }),
  eventId: z.string({ message: "معرف الفعالية مطلوب" }).cuid({ message: "معرف الفعالية غير صالح" }),
});

export type ValidateTicketInput = z.infer<typeof validateTicketSchema>;

export const validateTicketResponseSchema = z.object({
  valid: z.boolean(),
  ticket: z
    .object({
      id: z.string(),
      ticketNumber: z.string(),
      isUsed: z.boolean(),
      usedAt: z.string().nullable(),
      ticketTier: z.object({
        nameAr: z.string(),
        nameEn: z.string().nullable(),
        type: z.string(),
        price: z.string(),
      }),
      booking: z.object({
        attendeeName: z.string(),
        attendeeEmail: z.string(),
        attendeePhone: z.string(),
        status: z.string(),
        bookingNumber: z.string(),
        quantity: z.number(),
      }),
      event: z
        .object({
          id: z.string(),
          titleAr: z.string(),
          titleEn: z.string().nullable(),
          startDate: z.string(),
          startTime: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  reason: z.string().nullable(),
});

export type ValidateTicketResponse = z.infer<
  typeof validateTicketResponseSchema
>;
