import { Skeleton } from "@/components/ui/skeleton";

export function RouteLoading() {
  return <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6" aria-busy="true" aria-label="Cargando contenido"><div className="space-y-2"><Skeleton className="h-7 w-56" /><Skeleton className="h-4 w-80 max-w-full" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}</div><Skeleton className="h-72 rounded-2xl" /></div>;
}
