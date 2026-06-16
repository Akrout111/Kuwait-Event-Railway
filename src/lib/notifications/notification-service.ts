import React from "react";
import { db } from "@/lib/db";
import { NotificationType, type NotificationPayload, type EmailPayload, type EmailTemplateDataMap } from "./types";
import { sendTemplateEmail } from "./email-sender";
import { logger } from "@/lib/logger";

// Email template imports
import { BookingConfirmationEmail } from "@/emails/templates/booking-confirmation";
import { PaymentSuccessEmail } from "@/emails/templates/payment-success";
import { PaymentFailedEmail } from "@/emails/templates/payment-failed";
import { BookingCancelledEmail } from "@/emails/templates/booking-cancelled";
import { EventReminderEmail } from "@/emails/templates/event-reminder";
import { NewBookingNotificationEmail } from "@/emails/templates/new-booking-notification";
import { NewReviewNotificationEmail } from "@/emails/templates/new-review-notification";
import { RefundProcessedEmail } from "@/emails/templates/refund-processed";
import { TicketUsedEmail } from "@/emails/templates/ticket-used";

class NotificationService {
  /**
   * Core send method — creates a DB notification record and optionally sends email (fire-and-forget).
   */
  async send(payload: NotificationPayload): Promise<void> {
    // 1. Persist notification to database
    try {
      await db.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          titleAr: payload.titleAr,
          titleEn: payload.titleEn,
          bodyAr: payload.bodyAr,
          bodyEn: payload.bodyEn,
          link: payload.link,
          data: payload.data ? JSON.stringify(payload.data) : undefined,
        },
      });
    } catch (error: unknown) {
      logger.error(
        "NotificationService",
        `Failed to create notification for user ${payload.userId}: ${error instanceof Error ? error.message : String(error)}`
      );
      // Don't throw — notification creation failure should not break the calling flow
    }

    // 2. Send email if requested (fire-and-forget)
    if (payload.sendEmail && payload.emailData) {
      this.sendEmailNotification(payload.emailData).catch((error: unknown) => {
        logger.error(
          "NotificationService",
          `Email sending failed for ${payload.emailData!.to}: ${error instanceof Error ? error.message : String(error)}`
        );
      });
    }
  }

  /**
   * Sends an email using the appropriate template.
   */
  private async sendEmailNotification(emailData: EmailPayload): Promise<void> {
    const template = this.getEmailTemplate(emailData.template, emailData.templateData);
    if (!template) {
      logger.warn("notification-service", `No email template found for: ${emailData.template}`);
      return;
    }

    // Use English subject as the email subject (could be enhanced with locale detection)
    const subject = emailData.subjectEn || emailData.subjectAr;

    await sendTemplateEmail({
      to: emailData.to,
      subject,
      template,
    });
  }

  /**
   * Returns the appropriate React email template element for a given template name.
   * Uses typed EmailTemplateDataMap for compile-time type safety.
   */
  private getEmailTemplate<T extends keyof EmailTemplateDataMap>(
    templateName: T,
    templateData: EmailTemplateDataMap[T]
  ): React.ReactElement | null {
    switch (templateName) {
      case "booking-confirmed":
        return React.createElement(BookingConfirmationEmail, { data: templateData });
      case "payment-success":
        return React.createElement(PaymentSuccessEmail, { data: templateData });
      case "payment-failed":
        return React.createElement(PaymentFailedEmail, { data: templateData });
      case "booking-cancelled":
        return React.createElement(BookingCancelledEmail, { data: templateData });
      case "event-reminder":
        return React.createElement(EventReminderEmail, { data: templateData });
      case "new-booking":
        return React.createElement(NewBookingNotificationEmail, { data: templateData });
      case "new-review":
        return React.createElement(NewReviewNotificationEmail, { data: templateData });
      case "refund-processed":
        return React.createElement(RefundProcessedEmail, { data: templateData });
      case "ticket-used":
        return React.createElement(TicketUsedEmail, { data: templateData });
      default:
        return null;
    }
  }

  // ───────────────────────────────────────────────
  // Convenience methods for each notification type
  // ───────────────────────────────────────────────

  async notifyBookingConfirmed(params: {
    userId: string;
    bookingNumber: string;
    eventTitleAr: string;
    eventTitleEn: string;
    totalAmount: string;
    ticketCount: number;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.BOOKING_CONFIRMED,
      titleAr: "تم تأكيد الحجز",
      titleEn: "Booking Confirmed",
      bodyAr: `تم تأكيد حجزك رقم ${params.bookingNumber} للفعالية "${params.eventTitleAr}"`,
      bodyEn: `Your booking #${params.bookingNumber} for "${params.eventTitleEn}" has been confirmed`,
      data: {
        bookingNumber: params.bookingNumber,
        totalAmount: params.totalAmount,
        ticketCount: params.ticketCount,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تأكيد الحجز ${params.bookingNumber}`,
            subjectEn: `Booking Confirmed — ${params.bookingNumber}`,
            template: "booking-confirmed",
            templateData: {
              bookingNumber: params.bookingNumber,
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              totalAmount: params.totalAmount,
              ticketCount: params.ticketCount,
            },
          }
        : undefined,
    });
  }

  async notifyPaymentSuccess(params: {
    userId: string;
    bookingNumber: string;
    amount: string;
    method: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.PAYMENT_SUCCESS,
      titleAr: "تم الدفع بنجاح",
      titleEn: "Payment Successful",
      bodyAr: `تم استلام الدفع بمبلغ ${params.amount} د.ك للحجز ${params.bookingNumber}`,
      bodyEn: `Payment of ${params.amount} KWD received for booking ${params.bookingNumber}`,
      data: {
        bookingNumber: params.bookingNumber,
        amount: params.amount,
        method: params.method,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تم الدفع — الحجز ${params.bookingNumber}`,
            subjectEn: `Payment Successful — Booking ${params.bookingNumber}`,
            template: "payment-success",
            templateData: {
              bookingNumber: params.bookingNumber,
              amount: params.amount,
              method: params.method,
            },
          }
        : undefined,
    });
  }

  async notifyPaymentFailed(params: {
    userId: string;
    bookingNumber: string;
    amount: string;
    reason?: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.PAYMENT_FAILED,
      titleAr: "فشل عملية الدفع",
      titleEn: "Payment Failed",
      bodyAr: `فشل الدفع للحجز ${params.bookingNumber}${params.reason ? `: ${params.reason}` : ""}`,
      bodyEn: `Payment failed for booking ${params.bookingNumber}${params.reason ? `: ${params.reason}` : ""}`,
      data: {
        bookingNumber: params.bookingNumber,
        amount: params.amount,
        reason: params.reason,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `فشل الدفع — الحجز ${params.bookingNumber}`,
            subjectEn: `Payment Failed — Booking ${params.bookingNumber}`,
            template: "payment-failed",
            templateData: {
              bookingNumber: params.bookingNumber,
              amount: params.amount,
              reason: params.reason,
            },
          }
        : undefined,
    });
  }

  async notifyBookingCancelled(params: {
    userId: string;
    bookingNumber: string;
    eventTitleAr: string;
    eventTitleEn: string;
    reason?: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.BOOKING_CANCELLED,
      titleAr: "تم إلغاء الحجز",
      titleEn: "Booking Cancelled",
      bodyAr: `تم إلغاء حجزك رقم ${params.bookingNumber} للفعالية "${params.eventTitleAr}"`,
      bodyEn: `Your booking #${params.bookingNumber} for "${params.eventTitleEn}" has been cancelled`,
      data: {
        bookingNumber: params.bookingNumber,
        reason: params.reason,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `إلغاء الحجز ${params.bookingNumber}`,
            subjectEn: `Booking Cancelled — ${params.bookingNumber}`,
            template: "booking-cancelled",
            templateData: {
              bookingNumber: params.bookingNumber,
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              reason: params.reason,
            },
          }
        : undefined,
    });
  }

  async notifyEventReminder(params: {
    userId: string;
    eventTitleAr: string;
    eventTitleEn: string;
    eventDate: string;
    eventTime: string;
    venueNameAr: string;
    venueNameEn: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.EVENT_REMINDER,
      titleAr: "تذكير بالفعالية",
      titleEn: "Event Reminder",
      bodyAr: `الفعالية "${params.eventTitleAr}" ستبدأ يوم ${params.eventDate} الساعة ${params.eventTime}`,
      bodyEn: `"${params.eventTitleEn}" starts on ${params.eventDate} at ${params.eventTime}`,
      data: {
        eventTitleAr: params.eventTitleAr,
        eventTitleEn: params.eventTitleEn,
        eventDate: params.eventDate,
        eventTime: params.eventTime,
        venueNameAr: params.venueNameAr,
        venueNameEn: params.venueNameEn,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تذكير: ${params.eventTitleAr}`,
            subjectEn: `Reminder: ${params.eventTitleEn}`,
            template: "event-reminder",
            templateData: {
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              eventDate: params.eventDate,
              eventTime: params.eventTime,
              venueNameAr: params.venueNameAr,
              venueNameEn: params.venueNameEn,
            },
          }
        : undefined,
    });
  }

  async notifyNewBooking(params: {
    organizerId: string;
    bookingNumber: string;
    attendeeName: string;
    eventTitleAr: string;
    eventTitleEn: string;
    ticketCount: number;
    totalAmount: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.organizerId,
      type: NotificationType.NEW_BOOKING,
      titleAr: "حجز جديد",
      titleEn: "New Booking",
      bodyAr: `حجز جديد رقم ${params.bookingNumber} من ${params.attendeeName} للفعالية "${params.eventTitleAr}"`,
      bodyEn: `New booking #${params.bookingNumber} from ${params.attendeeName} for "${params.eventTitleEn}"`,
      data: {
        bookingNumber: params.bookingNumber,
        attendeeName: params.attendeeName,
        ticketCount: params.ticketCount,
        totalAmount: params.totalAmount,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `حجز جديد — ${params.bookingNumber}`,
            subjectEn: `New Booking — ${params.bookingNumber}`,
            template: "new-booking",
            templateData: {
              bookingNumber: params.bookingNumber,
              attendeeName: params.attendeeName,
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              ticketCount: params.ticketCount,
              totalAmount: params.totalAmount,
            },
          }
        : undefined,
    });
  }

  async notifyNewReview(params: {
    organizerId: string;
    eventTitleAr: string;
    eventTitleEn: string;
    reviewerName: string;
    rating: number;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.organizerId,
      type: NotificationType.NEW_REVIEW,
      titleAr: "تقييم جديد",
      titleEn: "New Review",
      bodyAr: `تقييم جديد من ${params.reviewerName} على الفعالية "${params.eventTitleAr}" — ${params.rating}/5`,
      bodyEn: `New review from ${params.reviewerName} on "${params.eventTitleEn}" — ${params.rating}/5`,
      data: {
        reviewerName: params.reviewerName,
        rating: params.rating,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تقييم جديد على ${params.eventTitleAr}`,
            subjectEn: `New Review on ${params.eventTitleEn}`,
            template: "new-review",
            templateData: {
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              reviewerName: params.reviewerName,
              rating: params.rating,
            },
          }
        : undefined,
    });
  }

  async notifyRefundProcessed(params: {
    userId: string;
    bookingNumber: string;
    amount: string;
    reason?: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.REFUND_PROCESSED,
      titleAr: "تم معالجة الاسترداد",
      titleEn: "Refund Processed",
      bodyAr: `تم استرداد مبلغ ${params.amount} د.ك للحجز ${params.bookingNumber}`,
      bodyEn: `Refund of ${params.amount} KWD processed for booking ${params.bookingNumber}`,
      data: {
        bookingNumber: params.bookingNumber,
        amount: params.amount,
        reason: params.reason,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تم الاسترداد — الحجز ${params.bookingNumber}`,
            subjectEn: `Refund Processed — Booking ${params.bookingNumber}`,
            template: "refund-processed",
            templateData: {
              bookingNumber: params.bookingNumber,
              amount: params.amount,
              reason: params.reason,
            },
          }
        : undefined,
    });
  }

  async notifyTicketUsed(params: {
    userId: string;
    ticketNumber: string;
    eventTitleAr: string;
    eventTitleEn: string;
    usedAt: string;
    email?: string;
  }): Promise<void> {
    await this.send({
      userId: params.userId,
      type: NotificationType.TICKET_USED,
      titleAr: "تم استخدام التذكرة",
      titleEn: "Ticket Used",
      bodyAr: `تم استخدام التذكرة رقم ${params.ticketNumber} للفعالية "${params.eventTitleAr}"`,
      bodyEn: `Ticket #${params.ticketNumber} for "${params.eventTitleEn}" has been used`,
      data: {
        ticketNumber: params.ticketNumber,
        usedAt: params.usedAt,
      },
      sendEmail: !!params.email,
      emailData: params.email
        ? {
            to: params.email,
            subjectAr: `تم استخدام التذكرة ${params.ticketNumber}`,
            subjectEn: `Ticket Used — ${params.ticketNumber}`,
            template: "ticket-used",
            templateData: {
              ticketNumber: params.ticketNumber,
              eventTitleAr: params.eventTitleAr,
              eventTitleEn: params.eventTitleEn,
              usedAt: params.usedAt,
            },
          }
        : undefined,
    });
  }
}

export const notificationService = new NotificationService();
