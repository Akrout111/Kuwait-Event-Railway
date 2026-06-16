export function EventCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card">
      <div className="aspect-[16/10] skeleton-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-16 rounded bg-muted/40 animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-muted/40 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted/40 animate-pulse" />
        <div className="flex justify-between pt-2">
          <div className="h-5 w-20 rounded bg-muted/40 animate-pulse" />
          <div className="h-5 w-24 rounded bg-muted/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
