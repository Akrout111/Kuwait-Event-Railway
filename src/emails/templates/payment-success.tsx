import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface PaymentSuccessData {
  attendeeName: string;
  bookingNumber: string;
  amount: string;
  eventTitle: string;
  transactionId: string;
  bookingId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function PaymentSuccessEmail({
  data,
}: {
  data: PaymentSuccessData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`تم الدفع بنجاح — حجز ${data.bookingNumber}`}>
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
          ✅ تم الدفع بنجاح
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، تم استلام دفعتك بنجاح!
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Transaction Details Card */}
      <Section
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#1e293b",
            margin: "0 0 16px 0",
          }}
        >
          تفاصيل العملية
        </Text>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              رقم الحجز
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.bookingNumber}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              الفعالية
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.eventTitle}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              المبلغ المدفوع
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 16, color: "#16a34a", fontWeight: 700, margin: 0 }}
            >
              {data.amount} د.ك
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              رقم العملية
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0, direction: "ltr", unicodeBidi: "embed" }}
            >
              {data.transactionId}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Success Badge */}
      <Section
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "14px 24px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#166534",
            fontWeight: 600,
            margin: 0,
          }}
        >
          🎉 تم تأكيد الدفع — تذكرتك جاهزة!
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/bookings/${data.bookingId}`}
          style={{
            backgroundColor: "#1a1a2e",
            color: "#ffffff",
            padding: "14px 36px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          عرض الإيصال
        </Button>
      </Section>
    </EmailLayout>
  );
}
