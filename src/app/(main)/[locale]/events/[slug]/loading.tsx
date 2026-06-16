export default function Loading() {
  return (
    <section className="relative min-h-screen">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Breadcrumb skeleton */}
        <div className="mb-6 flex items-center gap-2">
          <div className="h-4 w-12 rounded bg-muted/30 animate-pulse" />
          <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted/30 animate-pulse" />
          <div className="h-3 w-3 rounded bg-muted/30 animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="aspect-[21/9] rounded-2xl skeleton-shimmer" />
            <div className="space-y-3">
              <div className="h-6 w-24 rounded bg-muted/30 animate-pulse" />
              <div className="h-8 w-3/4 rounded bg-muted/30 animate-pulse" />
              <div className="flex gap-3">
                <div className="h-8 w-32 rounded-full bg-muted/30 animate-pulse" />
                <div className="h-8 w-28 rounded-full bg-muted/30 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-muted/30 animate-pulse" />
              <div className="h-4 w-4/6 rounded bg-muted/30 animate-pulse" />
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="space-y-4">
            <div className="h-64 rounded-2xl skeleton-shimmer" />
          </div>
        </div>
      </div>
    </section>
  );
}
