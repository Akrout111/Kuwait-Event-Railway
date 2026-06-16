import { requireServerUser } from "@/lib/server-auth";
import { MyBookingsClient } from "@/components/features/bookings/my-bookings-client";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === "ar" ? "حجوزاتي — منصة فعاليات الكويت" : "My Bookings — Kuwait Events Platform",
  };
}

export default async function MyBookingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // This ensures the user is authenticated before rendering the page
  await requireServerUser(locale);

  return <MyBookingsClient />;
}
