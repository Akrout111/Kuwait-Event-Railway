import { requireServerUser } from "@/lib/server-auth";
import { NewEventClientPage } from "./new-event-client-page";

export default async function CreateEventPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  return <NewEventClientPage />;
}
