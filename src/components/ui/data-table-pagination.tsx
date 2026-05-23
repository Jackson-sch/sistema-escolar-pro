"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DataTablePaginationProps {
  table: Table<any>;
  enableRowSelection?: boolean;
  totalCount?: number;
}

function getPageNumbers(pageCount: number, currentPage: number) {
  const pages: (number | "…")[] = [];
  if (pageCount <= 7) {
    for (let i = 0; i < pageCount; i++) pages.push(i);
  } else {
    pages.push(0);
    if (currentPage > 2) pages.push("…");
    const start = Math.max(1, currentPage - 1);
    const end = Math.min(pageCount - 2, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < pageCount - 3) pages.push("…");
    pages.push(pageCount - 1);
  }
  return pages;
}

function PaginationButton({
  children,
  onClick,
  disabled,
  className,
  "aria-label": ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg border text-muted-foreground",
        "transition-all duration-100",
        "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
        "disabled:pointer-events-none disabled:opacity-30",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DataTablePagination({
  table,
  enableRowSelection = true,
  totalCount,
}: DataTablePaginationProps) {
  const totalRows = totalCount ?? table.getFilteredRowModel().rows.length;
  const { pageIndex: pi } = table.getState().pagination;
  const pageCount = table.getPageCount();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 bg-muted/10 border-t border-border/20">
      {/* Selection count */}
      {enableRowSelection ? (
        <p className="text-xs text-muted-foreground shrink-0">
          <span className="font-semibold text-foreground">
            {table.getFilteredSelectedRowModel().rows.length}
          </span>{" "}
          de{" "}
          <span className="font-semibold text-foreground">{totalRows}</span>{" "}
          fila(s) seleccionadas
        </p>
      ) : (
        <p className="text-xs text-muted-foreground shrink-0">
          Total de{" "}
          <span className="font-semibold text-foreground">{totalRows}</span>{" "}
          registros
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        {/* Rows per page */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-medium">
            Filas por página
          </span>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="h-8 w-16 rounded-lg text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((n) => (
                <SelectItem key={n} value={`${n}`} className="text-xs">
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {/* First */}
          <PaginationButton
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hidden lg:flex"
            aria-label="Primera página"
          >
            <IconChevronsLeft className="size-3.5" />
          </PaginationButton>

          {/* Prev */}
          <PaginationButton
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Página anterior"
          >
            <IconChevronLeft className="size-3.5" />
          </PaginationButton>

          {/* Numbered pages */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers(pageCount, pi).map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="w-8 text-center text-xs text-muted-foreground select-none"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => table.setPageIndex(p as number)}
                  className={cn(
                    "h-8 min-w-8 rounded-lg px-2 text-xs font-medium transition-all duration-100",
                    (p as number) === pi
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {(p as number) + 1}
                </button>
              ),
            )}
          </div>

          {/* Mobile: current/total */}
          <span className="sm:hidden text-xs font-medium text-muted-foreground px-2 select-none">
            {pi + 1} / {pageCount}
          </span>

          {/* Next */}
          <PaginationButton
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Siguiente página"
          >
            <IconChevronRight className="size-3.5" />
          </PaginationButton>

          {/* Last */}
          <PaginationButton
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
            className="hidden lg:flex"
            aria-label="Última página"
          >
            <IconChevronsRight className="size-3.5" />
          </PaginationButton>
        </div>
      </div>
    </div>
  );
}
