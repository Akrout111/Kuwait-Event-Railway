import { Suspense } from "react";
import { requireServerUser } from "@/lib/server-auth";
import { NotificationList } from "@/components/features/notifications/notification-list";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الإشعارات — فعاليات الكويت",
  description: "عرض إشعاراتك وتحديثات الفعاليات",
};

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // This ensures the user is authenticated before rendering the page
  await requireServerUser(locale);

  return (
    <div className="container mx-auto ps-4 pe-4 py-8 max-w-2xl">
      <Suspense fallback={<div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" /></div>}>
        <NotificationList />
      </Suspense>
    </div>
  );
}
