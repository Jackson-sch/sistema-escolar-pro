import { Skeleton } from "@/components/ui/skeleton";

export default function SiagieLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <Skeleton className="h-9 w-36 rounded-xl" />
      </div>

      {/* Control Bar Skeleton */}
      <Skeleton className="h-16 w-full rounded-2xl" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>

      {/* Table Skeleton */}
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}
