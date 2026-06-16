import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface TicketUsedData {
  ticketNumber: string;
  eventTitleAr: string;
  eventTitleEn: string;
  attendeeName?: string;
  usedAt: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function TicketUsedEmail({
  data,
}: {
  data: TicketUsedData;
}) {
  const appUrl = data.appUrl ?? APP_URL;

  return (
    <EmailLayout previewText={`تم استخدام التذكرة ${data.ticketNumber}`}>
      {/* Title */}
      <Section style={{ textAlign: "center", marginBottom: 24 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#7c3aed",
            margin: 0,
          }}
        >
          🎫 تم استخدام التذكرة
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          تم تسجيل حضور التذكرة بنجاح
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Ticket Details Card */}
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
          {data.eventTitleAr}
        </Text>

        <Row style={{ marginBottom: 8 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              رقم التذكرة
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.ticketNumber}
            </Text>
          </Column>
        </Row>

        {data.attendeeName && (
          <Row style={{ marginBottom: 8 }}>
            <Column style={{ width: "40%" }}>
              <Text
                style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
              >
                الحاضر
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
        )}

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              وقت الاستخدام
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.usedAt}
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
          padding: "12px 24px",
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: "#16a34a",
            fontWeight: 600,
            margin: 0,
          }}
        >
          ✓ تم تسجيل الحضور بنجاح
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/dashboard/tickets`}
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
          إدارة التذاكر
        </Button>
      </Section>
    </EmailLayout>
  );
}
