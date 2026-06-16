export function CategoryCardSkeleton() {
  return (
    <div className="flex-none w-[160px] sm:w-[180px] lg:w-[200px]">
      <div className="rounded-xl border border-border/40 bg-card p-5 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-muted/40 animate-pulse" />
        <div className="h-4 w-20 rounded bg-muted/40 animate-pulse" />
        <div className="h-3 w-14 rounded bg-muted/40 animate-pulse" />
      </div>
    </div>
  );
}
