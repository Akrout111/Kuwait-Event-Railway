import {
  Section,
  Row,
  Column,
  Text,
  Hr,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface RefundProcessedData {
  attendeeName: string;
  bookingNumber: string;
  refundAmount: string;
  reason?: string;
  refundTimeline?: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function RefundProcessedEmail({
  data,
}: {
  data: RefundProcessedData;
}) {
  const appUrl = data.appUrl ?? APP_URL;
  const hasReason = Boolean(data.reason);

  return (
    <EmailLayout previewText={`تم معالجة الاسترداد — حجز ${data.bookingNumber}`}>
      {/* Title */}
      <Section style={{ textAlign: "center", marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#16a34a",
            margin: 0,
          }}
        >
          💰 تم معالجة الاسترداد
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، تمت معالجة طلب استرداد أموالك.
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Refund Details Card */}
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
            margin: "0 0 16px 0",
          }}
        >
          تفاصيل الاسترداد
        </Text>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#15803d", margin: 0 }}
            >
              رقم الحجز
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#14532d", fontWeight: 600, margin: 0, letterSpacing: "0.5px" }}
            >
              {data.bookingNumber}
            </Text>
          </Column>
        </Row>

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
              style={{ fontSize: 18, color: "#166534", fontWeight: 700, margin: 0 }}
            >
              {data.refundAmount} د.ك
            </Text>
          </Column>
        </Row>

        {hasReason && (
          <Row style={{ marginBottom: 10 }}>
            <Column style={{ width: "40%" }}>
              <Text
                style={{ fontSize: 13, color: "#15803d", margin: 0 }}
              >
                السبب
              </Text>
            </Column>
            <Column style={{ width: "60%" }}>
              <Text
                style={{ fontSize: 13, color: "#14532d", fontWeight: 600, margin: 0 }}
              >
                {data.reason}
              </Text>
            </Column>
          </Row>
        )}

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
              style={{ fontSize: 13, color: "#14532d", fontWeight: 600, margin: 0 }}
            >
              {data.refundTimeline ?? "خلال 5-10 أيام عمل"}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Timeline Info */}
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
          ⏳ سيتم استرداد المبلغ إلى طريقة الدفع الأصلية خلال الفترة المحددة
          أعلاه. قد يختلف وقت الاسترداد الفعلي حسب جهة الدفع.
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
