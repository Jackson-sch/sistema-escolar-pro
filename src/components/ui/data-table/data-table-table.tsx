"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";
import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTableEmptyState } from "@/components/ui/data-table-empty-state";
import { cn } from "@/lib/utils";
import type { DataTableTableProps } from "./data-table-types";

export function DataTableTable<TData>({
  table,
  columnsCount,
  emptyStateTitle,
  emptyStateDescription,
  hasActiveFilters,
  onClearFilters,
  onRowClick,
  selectedIndex,
}: DataTableTableProps<TData>) {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-max">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow
              key={hg.id}
              className="border-b border-border/40 bg-muted/20 hover:bg-muted/20"
            >
              {hg.headers.map((header) => (
                <TableHead
                  key={header.id}
                  colSpan={header.colSpan}
                  className={cn(
                    "h-10 px-6 text-xs font-black uppercase tracking-widest text-muted-foreground/60",
                    "transition-colors duration-200",
                    header.column.getCanSort() &&
                      "cursor-pointer select-none hover:text-primary hover:bg-primary/5",
                  )}
                  style={{ width: header.column.getSize() }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {!header.isPlaceholder && (
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getCanSort() && (
                        <span className="shrink-0 opacity-40">
                          {header.column.getIsSorted() === "asc" ? (
                            <IconSortAscending className="size-4 text-primary" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <IconSortDescending className="size-4 text-primary" />
                          ) : (
                            <IconArrowsSort className="size-4" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, idx) => {
              const isCursorActive =
                selectedIndex !== undefined && idx === selectedIndex;

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Evitar clicks de fila si se interactúa con botones, enlaces u otros inputs
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest("a") ||
                      target.closest("input") ||
                      target.closest("select") ||
                      target.closest("[role='menuitem']")
                    ) {
                      return;
                    }
                    onRowClick?.(row.original);
                  }}
                  className={cn(
                    "group border-b border-border/20 last:border-0 transition-all duration-150 relative",
                    onRowClick &&
                      "cursor-pointer hover:bg-primary/5! active:bg-primary/10",
                    isCursorActive
                      ? "bg-primary/10! ring-1 ring-inset ring-primary/40 font-medium"
                      : idx % 2 === 0
                        ? "bg-transparent"
                        : "bg-muted/5",
                    "data-[state=selected]:bg-primary/10",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-1 text-xs text-foreground/80"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columnsCount} className="h-[400px] p-0">
                <DataTableEmptyState
                  title={emptyStateTitle}
                  description={emptyStateDescription}
                  hasFilters={
                    table.getState().columnFilters.length > 0 ||
                    hasActiveFilters
                  }
                  onClearFilters={() => {
                    table.resetColumnFilters();
                    onClearFilters?.();
                  }}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
