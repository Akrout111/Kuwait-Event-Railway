import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface PaymentFailedData {
  attendeeName: string;
  bookingNumber: string;
  eventTitle: string;
  bookingId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function PaymentFailedEmail({
  data,
}: {
  data: PaymentFailedData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`فشل الدفع — حجز ${data.bookingNumber}`}>
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
          ❌ فشل الدفع
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، لم تتم عملية الدفع بنجاح.
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Failure Info Card */}
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
          تفاصيل الفشل
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

      {/* Help Text */}
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
          لم تتم عملية الدفع للحجز المذكور أعلاه. يمكنك إعادة المحاولة من صفحة
          الحجوزات الخاصة بك.
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/bookings/${data.bookingId ?? ""}`}
          style={{
            backgroundColor: "#dc2626",
            color: "#ffffff",
            padding: "14px 36px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          إعادة المحاولة
        </Button>
      </Section>
    </EmailLayout>
  );
}
