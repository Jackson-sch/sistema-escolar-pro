"use client";

import * as React from "react";
import { DataTableEmptyState } from "@/components/ui/data-table-empty-state";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconFilterOff,
  IconLayoutColumns,
} from "@tabler/icons-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode | ((table: any) => React.ReactNode);
  initialState?: any;
  meta?: any;
  stackFilters?: boolean;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  pageIndex?: number;
  pageSize?: number;
  onPageIndexChange?: (pageIndex: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showColumnVisibility?: boolean;
  enableRowSelection?: boolean;
  ignoredFilterColumns?: string[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  children,
  initialState,
  meta,
  stackFilters = false,
  emptyStateTitle,
  emptyStateDescription,
  pageIndex,
  pageSize,
  onPageIndexChange,
  onPageSizeChange,
  showColumnVisibility = true,
  enableRowSelection = true,
  ignoredFilterColumns,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialState?.columnVisibility || {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(pageIndex !== undefined && pageSize !== undefined
        ? { pagination: { pageIndex, pageSize } }
        : {}),
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const next = updater({
          pageIndex: pageIndex ?? table.getState().pagination.pageIndex,
          pageSize: pageSize ?? table.getState().pagination.pageSize,
        });
        onPageIndexChange?.(next.pageIndex);
        onPageSizeChange?.(next.pageSize);
      } else {
        onPageIndexChange?.(updater.pageIndex);
        onPageSizeChange?.(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: { pageSize: pageSize ?? 10, pageIndex: pageIndex ?? 0 },
      ...initialState,
    },
    autoResetPageIndex: false,
    meta,
  });

  const isFiltered = table.getState().columnFilters.some((f) => {
    if (ignoredFilterColumns?.includes(f.id)) return false;
    const v = f.value;
    return Array.isArray(v) ? v.length > 0 : v !== "" && v != null;
  });

  const showClearFilters = isFiltered || (onClearFilters && hasActiveFilters);
  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex: pi, pageSize: ps } = table.getState().pagination;
  const pageCount = table.getPageCount();

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | "…")[] = [];
    if (pageCount <= 7) {
      for (let i = 0; i < pageCount; i++) pages.push(i);
    } else {
      pages.push(0);
      if (pi > 2) pages.push("…");
      const start = Math.max(1, pi - 1);
      const end = Math.min(pageCount - 2, pi + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (pi < pageCount - 3) pages.push("…");
      pages.push(pageCount - 1);
    }
    return pages;
  };

  return (
    <div className="flex flex-col gap-4 liquid-glass rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-border/40 shadow-2xl overflow-hidden p-1">
      {/* ── TOOLBAR ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex items-start gap-3 p-6",
          stackFilters ? "flex-col" : "flex-col lg:flex-row lg:items-center",
        )}
      >
        {/* Search */}
        {searchKey && (
          <InputGroup
            className={cn(
              "bg-background/40 rounded-full border-border/40 focus-within:ring-2 focus-within:ring-primary/20 transition-all",
              stackFilters
                ? "w-full"
                : "w-full sm:w-72 lg:w-80 xl:w-96 shrink-0",
            )}
          >
            <InputGroupAddon>
              <IconSearch className="h-4 w-4 text-muted-foreground/60" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={searchPlaceholder}
              value={
                searchValue !== undefined
                  ? searchValue
                  : ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                    "")
              }
              onChange={(e) => {
                const v = e.target.value;
                onSearchChange?.(v);
                table.getColumn(searchKey)?.setFilterValue(v);
              }}
              className="h-10 w-full text-sm font-medium placeholder:text-muted-foreground/40"
            />
            <InputGroupAddon
              align="inline-end"
              className="text-[10px] uppercase font-black opacity-30 hidden sm:flex border-l border-primary/5 pl-3 ml-2 shrink-0"
            >
              {totalRows}
            </InputGroupAddon>
          </InputGroup>
        )}

        {/* Filters + Actions */}
        <div
          className={cn(
            "flex flex-1 flex-wrap items-center gap-2",
            stackFilters
              ? "w-full justify-between"
              : "justify-between lg:justify-end",
          )}
        >
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Si children es una función, le pasamos el objeto table */}
            {typeof children === "function" ? children(table) : children}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {showClearFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  table.resetColumnFilters();
                  onClearFilters?.();
                }}
                className={cn(
                  "h-10 gap-1.5 rounded-xl px-4 text-xs font-black uppercase tracking-widest",
                  "text-muted-foreground border border-dashed border-muted-foreground/30",
                  "hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
                  "transition-all duration-150 shadow-sm",
                )}
              >
                <IconFilterOff className="size-4" />
                Limpiar
              </Button>
            )}

            {showColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex h-10 gap-2 rounded-xl px-4 text-xs font-black uppercase tracking-widest bg-background/40"
                  >
                    <IconLayoutColumns className="size-4" />
                    Columnas
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl bg-background/95 backdrop-blur-xl border-border/40 p-2 shadow-2xl">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black px-2 py-3">
                    Configurar Columnas
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <div className="py-2">
                    {table
                      .getAllColumns()
                      .filter(
                        (col) =>
                          typeof col.accessorFn !== "undefined" &&
                          col.getCanHide(),
                      )
                      .map((col) => (
                        <DropdownMenuCheckboxItem
                          key={col.id}
                          className="capitalize text-xs font-bold rounded-lg mb-1"
                          checked={col.getIsVisible()}
                          onCheckedChange={(v) => col.toggleVisibility(!!v)}
                        >
                          {col.id}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* ── TABLE ───────────────────────────────────────────────── */}
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
                      "h-14 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60",
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
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "group border-b border-border/20 last:border-0 transition-all duration-200",
                    "hover:bg-primary/5",
                    idx % 2 === 0 ? "bg-transparent" : "bg-muted/5",
                    "data-[state=selected]:bg-primary/10",
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-8 py-5 text-sm font-bold text-foreground/80"
                      style={{ width: cell.column.getSize() }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-[400px] p-0"
                >
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

      {/* ── PAGINATION ──────────────────────────────────────────── */}
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
              {getPageNumbers().map((p, i) =>
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
    </div>
  );
}

// ── Helper ─────────────────────────────────────────────────────────────────
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
