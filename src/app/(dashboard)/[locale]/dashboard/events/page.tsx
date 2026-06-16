import { requireServerUser } from "@/lib/server-auth";
import { EventTable } from "@/components/features/dashboard/event-table";
import { CreateEventButton } from "@/components/features/dashboard/create-event-button";
import { getTranslations } from "next-intl/server";

export default async function MyEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("events.myEvents")}</h1>
          <p className="text-gray-500 mt-1">{t("events.manageSubtitle")}</p>
        </div>
        <CreateEventButton />
      </div>

      <EventTable />
    </div>
  );
}
