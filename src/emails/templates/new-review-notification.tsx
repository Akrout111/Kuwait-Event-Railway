import {
  Section,
  Row,
  Column,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import { EmailLayout } from "../layout";

interface NewReviewNotificationData {
  organizerName: string;
  reviewerName: string;
  eventTitle: string;
  rating: number;
  comment?: string;
  reviewId: string;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

function renderStars(rating: number): string {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return "★".repeat(fullStars) + "☆".repeat(emptyStars);
}

export function NewReviewNotificationEmail({
  data,
}: {
  data: NewReviewNotificationData;
}) {
  const appUrl = data.appUrl ?? APP_URL;
  const hasComment = Boolean(data.comment);

  return (
    <EmailLayout previewText={`تقييم جديد على ${data.eventTitle}`}>
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
          ⭐ تقييم جديد
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: "#555555",
            margin: "8px 0 0 0",
          }}
        >
          مرحباً {data.organizerName}، تلقيت تقييماً جديداً على فعاليتك!
        </Text>
      </Section>

      <Hr style={{ borderColor: "#e5e7eb", margin: "0 0 24px 0" }} />

      {/* Review Details Card */}
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
          تفاصيل التقييم
        </Text>

        <Row style={{ marginBottom: 10 }}>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              المقيّم
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{ fontSize: 13, color: "#334155", fontWeight: 600, margin: 0 }}
            >
              {data.reviewerName}
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

        <Row>
          <Column style={{ width: "40%" }}>
            <Text
              style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}
            >
              التقييم
            </Text>
          </Column>
          <Column style={{ width: "60%" }}>
            <Text
              style={{
                fontSize: 20,
                color: "#f59e0b",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "2px",
                lineHeight: "24px",
              }}
            >
              {renderStars(data.rating)}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Comment Excerpt (conditional) */}
      {hasComment && (
        <Section
          style={{
            backgroundColor: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "16px 24px",
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: "#92400e",
              fontWeight: 600,
              margin: "0 0 6px 0",
            }}
          >
            💬 مقتطف من التعليق:
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#78350f",
              margin: 0,
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            &ldquo;{data.comment}&rdquo;
          </Text>
        </Section>
      )}

      {/* Rating Highlight */}
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
          ⭐ تقييم جديد وصل — قم بالرد لإظهار اهتمامك
        </Text>
      </Section>

      {/* CTA Button */}
      <Section style={{ textAlign: "center", marginBottom: 16 }}>
        <Button
          href={`${appUrl}/ar/dashboard/reviews`}
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
          رد على التقييم
        </Button>
      </Section>
    </EmailLayout>
  );
}
