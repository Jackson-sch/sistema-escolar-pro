"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentKeyboardLegend } from "@/components/gestion/estudiantes/components/student-keyboard-legend";

interface StudentDirectoryPaginationProps {
  filteredCount: number;
  page: number;
  limit: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
}

export function StudentDirectoryPagination({
  filteredCount,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: StudentDirectoryPaginationProps) {
  if (filteredCount === 0) return null;

  const totalPages = Math.ceil(filteredCount / limit) || 1;

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card border border-border/60 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">
            Mostrando{" "}
            <strong className="text-foreground font-bold">
              {filteredCount === 0 ? 0 : (page - 1) * limit + 1}
            </strong>{" "}
            a{" "}
            <strong className="text-foreground font-bold">
              {Math.min(page * limit, filteredCount)}
            </strong>{" "}
            de{" "}
            <strong className="text-foreground font-bold">
              {filteredCount}
            </strong>{" "}
            estudiantes
          </span>

          <div className="hidden sm:flex items-center gap-1.5 ml-4 pl-4 border-l border-border/40">
            <span className="text-xs text-muted-foreground font-medium">
              Por página:
            </span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[70px] text-xs font-bold rounded-lg border-border/60 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="12" className="text-xs">
                  12
                </SelectItem>
                <SelectItem value="24" className="text-xs">
                  24
                </SelectItem>
                <SelectItem value="48" className="text-xs">
                  48
                </SelectItem>
                <SelectItem value="96" className="text-xs">
                  96
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botones de navegación de página */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground font-medium mr-2">
            Página <strong className="text-foreground font-bold">{page}</strong>{" "}
            de <strong className="text-foreground font-bold">{totalPages}</strong>
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-xl border-border/60 bg-background cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="Primera página"
          >
            <span className="text-xs font-bold">«</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-xl border-border/60 bg-background cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Página anterior"
          >
            <span className="text-xs font-bold">‹</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-xl border-border/60 bg-background cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Página siguiente"
          >
            <span className="text-xs font-bold">›</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-8 rounded-xl border-border/60 bg-background cursor-pointer disabled:opacity-40"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Última página"
          >
            <span className="text-xs font-bold">»</span>
          </Button>
        </div>
      </div>

      <StudentKeyboardLegend variant="footer" />
    </div>
  );
}
