import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface BookingConfirmationData {
  attendeeName: string;
  bookingNumber: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  ticketCount: number;
  totalAmount: string;
  bookingId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function BookingConfirmationEmail({
  data,
}: {
  data: BookingConfirmationData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`تأكيد الحجز ${data.bookingNumber} — ${data.eventTitle}`}>
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
          ✅ تأكيد الحجز
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، تم تأكيد حجزك بنجاح!
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Event Details Card */}
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
            fontSize: 18,
            fontWeight: 700,
            color: "#1e293b",
            margin: "0 0 16px 0",
          }}
        >
          {data.eventTitle}
        </Text>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              📅 التاريخ
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.eventDate}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              🕐 الوقت
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.eventTime}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              📍 المكان
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.venueName}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              🎫 عدد التذاكر
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
              💰 المبلغ الإجمالي
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 15, color: "#1a1a2e", fontWeight: 700, margin: 0 }}
            >
              {data.totalAmount} د.ك
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Booking Number */}
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
            fontSize: 12,
            color: "#6366f1",
            margin: "0 0 4px 0",
          }}
        >
          رقم الحجز
        </Text>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 700,
            color: "#1a1a2e",
            margin: 0,
            letterSpacing: "1px",
          }}
        >
          {data.bookingNumber}
        </Text>
      </Section>

      {/* QR Code Note */}
      <Section
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "12px 24px",
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            color: "#92400e",
            margin: 0,
            textAlign: "center",
          }}
        >
          ⚠️ يرجى إحضار رمز الاستجابة السريعة (QR Code) معك عند الدخول
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
          عرض التذاكر
        </Button>
      </Section>
    </EmailLayout>
  );
}
