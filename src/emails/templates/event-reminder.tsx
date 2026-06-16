import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface EventReminderData {
  attendeeName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  bookingId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function EventReminderEmail({
  data,
}: {
  data: EventReminderData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`تذكير بالفعالية: ${data.eventTitle}`}>
      {/* Title */}
      <Section style={{ textAlign: "center", marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#2563eb",
            margin: 0,
          }}
        >
          ⏰ تذكير بالفعالية
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.attendeeName}، الفعالية قريبة! لا تنسَ الحضور.
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Highlighted Event Details Card */}
      <Section
        style={{
          backgroundColor: "#eff6ff",
          border: "2px solid #93c5fd",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 24,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#1e40af",
            margin: "0 0 16px 0",
          }}
        >
          🎉 {data.eventTitle}
        </Text>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#3b82f6", margin: 0 }}
            >
              📅 التاريخ
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 600, margin: 0 }}
            >
              {data.eventDate}
            </Text>
          </Column>
        </Row>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#3b82f6", margin: 0 }}
            >
              🕐 الوقت
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 600, margin: 0 }}
            >
              {data.eventTime}
            </Text>
          </Column>
        </Row>

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#3b82f6", margin: 0 }}
            >
              📍 المكان
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#1e3a5f", fontWeight: 600, margin: 0 }}
            >
              {data.venueName}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Yellow Warning Box */}
      <Section
        style={{
          backgroundColor: "#fefce8",
          border: "2px solid #facc15",
          borderRadius: 8,
          padding: "16px 24px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#854d0e",
            margin: 0,
          }}
        >
          ⚠️ لا تنسَ إحضار تذكرتك (QR Code)
        </Text>
        <Text
          style={{
            fontSize: 13,
            color: "#92400e",
            margin: "6px 0 0 0",
          }}
        >
          يرجى إحضار رمز الاستجابة السريعة على هاتفك أو مطبوعاً للدخول إلى
          الفعالية.
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/bookings/${data.bookingId}`}
          style={{
            backgroundColor: "#2563eb",
            color: "#ffffff",
            padding: "14px 36px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-block",
          }}
        >
          عرض التذكرة
        </Button>
      </Section>
    </EmailLayout>
  );
}
