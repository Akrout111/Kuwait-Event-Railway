import { requireServerUser } from "@/lib/server-auth";
import { OrganizerReviews } from "@/components/features/dashboard/organizer-reviews";

export default async function OrganizerReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireServerUser(locale);
  return <OrganizerReviews />;
}
