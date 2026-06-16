import type { Metadata } from "next";
import { AuthProvider } from "@/components/features/auth/auth-provider";
import { QueryProvider } from "@/components/layout/query-provider";
import { notoSansArabic } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kuwait Events Platform — منصة فعاليات الكويت",
  description: "Discover and book the best events in Kuwait — اكتشف واحجز أفضل الفعاليات في الكويت",
  keywords: ["events", "Kuwait", "tickets", "booking", "فعاليات", "الكويت", "حجز", "تذاكر"],
  authors: [{ name: "Kuwait Events Platform" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${notoSansArabic.variable} font-sans antialiased bg-background text-foreground`}>
        <AuthProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
