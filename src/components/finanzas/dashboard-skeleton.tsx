import { Skeleton } from "@/components/ui/skeleton";

export function FinanzasDashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 sm:px-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-2xl border border-primary/5 bg-card p-6 shadow-sm"
        >
          <div className="flex items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24 bg-primary/5" />
            <Skeleton className="h-8 w-8 rounded-lg bg-primary/5" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32 bg-primary/10" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 bg-primary/5" />
              <Skeleton className="h-3 w-12 bg-primary/5" />
            </div>
          </div>
          {/* Subtle background glow effect simulation */}
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-3xl" />
        </div>
      ))}
    </div>
  );
}
