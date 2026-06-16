import { requireServerUser } from "@/lib/server-auth";
import { TicketScannerClientPage } from "./ticket-scanner-client-page";

export default async function TicketScannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  return <TicketScannerClientPage />;
}
