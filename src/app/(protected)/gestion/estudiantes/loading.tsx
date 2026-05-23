import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export default function EstudiantesLoading() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <div className="h-8 w-48 bg-primary/5 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-primary/5 rounded-md mt-2 animate-pulse" />
        </div>
      </div>
      <div className="px-4 sm:px-2">
        <DataTableSkeleton columnCount={5} rowCount={10} />
      </div>
    </div>
  );
}
