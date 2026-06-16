import { requireServerUser } from "@/lib/server-auth";
import { StatsCards } from "@/components/features/dashboard/stats-cards";
import { RevenueChart } from "@/components/features/dashboard/revenue-chart";
import { RecentBookingsTable } from "@/components/features/dashboard/recent-bookings-table";
import { UpcomingEventsList } from "@/components/features/dashboard/upcoming-events-list";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t("overview.title")}</h1>
        <p className="text-gray-500 mt-1">{t("overview.subtitle")}</p>
      </div>

      <StatsCards />

      <div className="grid gap-8 lg:grid-cols-2">
        <RevenueChart />
        <UpcomingEventsList />
      </div>

      <RecentBookingsTable />
    </div>
  );
}
