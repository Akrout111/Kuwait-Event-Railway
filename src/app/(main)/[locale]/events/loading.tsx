import { EventGridSkeleton } from "@/components/features/events/event-grid-skeleton";

export default function Loading() {
  return (
    <section className="relative py-8 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="h-9 w-48 rounded bg-muted/30 animate-pulse" />
          <div className="mt-2 h-5 w-72 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="mb-6 h-24 rounded-2xl skeleton-shimmer" />
        <EventGridSkeleton count={6} />
      </div>
    </section>
  );
}
