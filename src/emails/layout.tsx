import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Hr,
  Link,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
  previewText: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuwaitevents.com";

export function EmailLayout({ children, previewText }: EmailLayoutProps) {
  return (
    <Html dir="rtl" lang="ar">
      <Head>
        <title>{previewText}</title>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
      </Head>
      <Body
        style={{
          backgroundColor: "#f4f5f7",
          fontFamily:
            "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          direction: "rtl",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Preview text (hidden) */}
        <Container
          style={{
            display: "none",
            overflow: "hidden",
            maxHeight: 0,
            maxWidth: 0,
            fontSize: 0,
            lineHeight: 0,
          }}
        >
          <Text style={{ color: "#f4f5f7", fontSize: 1 }}>{previewText}</Text>
        </Container>

        {/* Dark Header */}
        <Section
          style={{
            backgroundColor: "#1a1a2e",
            padding: "28px 40px",
            textAlign: "center",
          }}
        >
          <Row>
            <Column align="center">
              <Text
                style={{
                  color: "#ffffff",
                  fontSize: 26,
                  fontWeight: 700,
                  margin: 0,
                  letterSpacing: "0.5px",
                }}
              >
                فعاليات الكويت
              </Text>
              <Text
                style={{
                  color: "#8b8da3",
                  fontSize: 13,
                  margin: "4px 0 0 0",
                  letterSpacing: "0.3px",
                }}
              >
                Kuwait Events
              </Text>
            </Column>
          </Row>
        </Section>

        {/* Main Content Area */}
        <Container
          style={{
            maxWidth: 600,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "0 0 12px 12px",
            overflow: "hidden",
          }}
        >
          <Section style={{ padding: "32px 40px" }}>{children}</Section>
        </Container>

        {/* Footer */}
        <Container style={{ maxWidth: 600, margin: "0 auto" }}>
          <Section style={{ padding: "24px 40px" }}>
            <Hr
              style={{
                borderColor: "#e0e0e0",
                margin: "0 0 20px 0",
              }}
            />
            <Row>
              <Column align="center">
                <Text
                  style={{
                    color: "#999999",
                    fontSize: 12,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  © {new Date().getFullYear()} فعاليات الكويت — Kuwait Events.
                  جميع الحقوق محفوظة.
                </Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Column align="center">
                <Link
                  href={`${APP_URL}`}
                  style={{
                    color: "#666666",
                    fontSize: 12,
                    textDecoration: "underline",
                    marginLeft: 16,
                  }}
                >
                  الرئيسية
                </Link>
                <Link
                  href={`${APP_URL}/ar/events`}
                  style={{
                    color: "#666666",
                    fontSize: 12,
                    textDecoration: "underline",
                    marginLeft: 16,
                  }}
                >
                  الفعاليات
                </Link>
                <Link
                  href={`${APP_URL}/ar/bookings`}
                  style={{
                    color: "#666666",
                    fontSize: 12,
                    textDecoration: "underline",
                  }}
                >
                  حجوزاتي
                </Link>
              </Column>
            </Row>
            <Row style={{ marginTop: 10 }}>
              <Column align="center">
                <Text
                  style={{
                    color: "#bbbbbb",
                    fontSize: 11,
                    margin: 0,
                  }}
                >
                  noreply@kuwaitevents.com
                </Text>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
