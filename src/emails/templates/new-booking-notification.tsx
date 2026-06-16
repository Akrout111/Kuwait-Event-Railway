import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface NewBookingNotificationData {
  organizerName: string;
  bookingNumber: string;
  attendeeName: string;
  eventTitle: string;
  ticketCount: number;
  amount: string;
  bookingId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function NewBookingNotificationEmail({
  data,
}: {
  data: NewBookingNotificationData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`حجز جديد — ${data.eventTitle}`}>
      {/* Title */}
      <Section style={{ textAlign: "center", marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#1a1a2e",
            margin: 0,
          }}
        >
          🛒 حجز جديد
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.organizerName}، تم استلام حجز جديد على فعاليتك!
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Booking Details Card */}
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
          تفاصيل الحجز
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
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0, letterSpacing: "0.5px" }}
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
              اسم الحاضر
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.attendeeName}
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
              عدد التذاكر
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.ticketCount}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              المبلغ
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 15, color: "#1a1a2e", fontWeight: 700, margin: 0 }}
            >
              {data.amount} د.ك
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Highlight Badge */}
      <Section
        style={{
          backgroundColor: "#eef2ff",
          border: "1px solid #c7d2fe",
          borderRadius: 8,
          padding: "12px 24px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#4338ca",
            fontWeight: 600,
            margin: 0,
          }}
        >
          🎫 حجز جديد تم استلامه — تأكد من مراجعة التفاصيل
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/dashboard/bookings`}
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
          إدارة الحجوزات
        </Button>
      </Section>
    </EmailLayout>
  );
}
