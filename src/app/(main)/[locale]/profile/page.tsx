import { requireServerUser } from "@/lib/server-auth";
import { ProfilePageClient } from "@/components/features/auth/profile-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الملف الشخصي — فعاليات الكويت",
  description: "إدارة الملف الشخصي وإعدادات الحساب",
};

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // This ensures the user is authenticated before rendering the page
  await requireServerUser(locale);

  return <ProfilePageClient />;
}
