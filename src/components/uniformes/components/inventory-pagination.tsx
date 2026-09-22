"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InventoryPagination({ table }: { table: any }) {
  return (
    <div className="p-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-background/50 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground font-medium">
        <span>
          Mostrando {table.getRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} registros
        </span>
        <span className="text-border">|</span>
        <span className="flex items-center gap-1">
          Filas por página:
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-7 w-[65px] rounded-lg border-border/40 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40">
              {[10, 25, 50, 100].map((pageSize) => (
                <SelectItem
                  key={pageSize}
                  value={`${pageSize}`}
                  className="text-xs"
                >
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 px-2.5 border-border/40 text-xs"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <IconChevronLeft className="size-3.5 mr-1" /> Anterior
        </Button>
        <span className="text-muted-foreground font-medium px-2">
          Página {table.getState().pagination.pageIndex + 1} de{" "}
          {table.getPageCount() || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl h-8 px-2.5 border-border/40 text-xs"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente <IconChevronRight className="size-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
