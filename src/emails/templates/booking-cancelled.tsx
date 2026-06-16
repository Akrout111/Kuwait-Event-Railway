import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface BookingCancelledData {
  attendeeName: string;
  bookingNumber: string;
  eventTitle: string;
  refundAmount?: string;
  refundTimeline?: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function BookingCancelledEmail({
  data,
}: {
  data: BookingCancelledData;
}) {
  const appUrl = data.appUrl ?? APP_URL;
  const hasRefund = Boolean(data.refundAmount);

  return (
    <EmailLayout previewText={`إلغاء الحجز ${data.bookingNumber}`}>
      {/* Title */}
      <Section style={{ textAlign: "center", marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#dc2626",
            margin: 0,
          }}
        >
          🚫 إلغاء الحجز
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، تم إلغاء حجزك.
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Cancellation Details Card */}
      <Section
        style={{
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#991b1b",
            margin: "0 0 16px 0",
          }}
        >
          تفاصيل الإلغاء
        </Text>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}
            >
              رقم الحجز
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#7f1d1d", fontWeight: 600, margin: 0 }}
            >
              {data.bookingNumber}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#b91c1c", margin: 0 }}
            >
              الفعالية
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#7f1d1d", fontWeight: 600, margin: 0 }}
            >
              {data.eventTitle}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Refund Info (conditional) */}
      {hasRefund && (
        <Section
          style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 8,
            padding: "20px 24px",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#166534",
              margin: "0 0 12px 0",
            }}
          >
            💰 معلومات الاسترداد
          </Text>

          <Row style={{ marginBottom: 10 }}>
            <Column style={{ width: "40%" }}>
              <Text
                style={{ fontSize: 13, color: "#15803d", margin: 0 }}
              >
                مبلغ الاسترداد
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{ fontSize: 15, color: "#166534", fontWeight: 700, margin: 0 }}
              >
                {data.refundAmount} د.ك
              </Text>
            </Column>
          </Row>

          <Row>
            <Column style={{ width: "40%" }}>
              <Text
                style={{ fontSize: 13, color: "#15803d", margin: 0 }}
              >
                الموعد المتوقع
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{ fontSize: 13, color: "#166534", fontWeight: 600, margin: 0 }}
              >
                {data.refundTimeline ?? "خلال 5-10 أيام عمل"}
              </Text>
            </Column>
          </Row>
        </Section>
      )}

      {/* Timeline Note */}
      <Section
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "14px 24px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: "#92400e",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {hasRefund
            ? "سيتم استرداد المبلغ إلى طريقة الدفع الأصلية خلال الفترة المحددة."
            : "لم يتم إجراء أي دفعة لهذا الحجز، لذلك لا يوجد مبلغ لاسترداده."}
        </Text>
      </Section>

      {/* Link to bookings */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 14,
            color: "#1a1a2e",
            margin: 0,
          }}
        >
          يمكنك الاطلاع على حجوزاتك من{" "}
          <a
            href={`${appUrl}/ar/bookings`}
            style={{ color: "#1a1a2e", fontWeight: 600, textDecoration: "underline" }}
          >
            صفحة الحجوزات
          </a>
        </Text>
      </Section>
    </EmailLayout>
  );
}
