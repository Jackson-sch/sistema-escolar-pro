import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableSkeleton({
  columnCount = 5,
  rowCount = 5,
  searchable = true,
  pagination = true,
}: {
  columnCount?: number;
  rowCount?: number;
  searchable?: boolean;
  pagination?: boolean;
}) {
  return (
    <div className="space-y-4 w-full">
      {searchable && (
        <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-2xl shadow-sm">
          <Skeleton className="h-9 w-64 bg-primary/5" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 bg-primary/5" />
          </div>
        </div>
      )}
      <div className="rounded-2xl border-2 border-primary/5 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            <TableRow className="hover:bg-transparent border-b-2 border-primary/5">
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i} className="h-12 py-3">
                  <Skeleton className="h-4 w-2/3 bg-primary/10" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i} className="border-b last:border-0">
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j} className="py-4">
                    <Skeleton className="h-4 w-full bg-primary/5" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {pagination && (
        <div className="flex items-center justify-between px-2 py-4">
          <Skeleton className="h-4 w-40 bg-primary/5" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-8 w-24 bg-primary/5" />
            <Skeleton className="h-8 w-32 bg-primary/5" />
          </div>
        </div>
      )}
    </div>
  );
}
