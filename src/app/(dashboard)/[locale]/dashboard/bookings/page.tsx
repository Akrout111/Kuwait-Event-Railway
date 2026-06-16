import { requireServerUser } from "@/lib/server-auth";
import { BookingsClientPage } from "./bookings-client-page";

export default async function DashboardBookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  return <BookingsClientPage />;
}
