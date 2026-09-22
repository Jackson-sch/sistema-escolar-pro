"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { DataTableToolbar } from "./data-table-toolbar";
import { DataTableTable } from "./data-table-table";
import { DataTablePagination } from "./data-table-pagination";
import type { DataTableProps } from "./data-table-types";

export function DataTable<TData, TValue = unknown>({
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
  showColumnVisibility = false,
  enableRowSelection = true,
  ignoredFilterColumns,
  onRowClick,
  selectedIndex,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      (initialState?.columnVisibility as VisibilityState) || {},
    );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Protección de paginación segura cuando data.length es menor a lo esperado por URL
  const effectivePageSize = pageSize ?? 10;
  const maxPageIndex =
    data.length > 0
      ? Math.max(0, Math.ceil(data.length / effectivePageSize) - 1)
      : 0;
  const safePageIndex =
    pageIndex !== undefined
      ? Math.min(Math.max(0, pageIndex), maxPageIndex)
      : undefined;

  React.useEffect(() => {
    if (
      pageIndex !== undefined &&
      pageIndex > maxPageIndex &&
      data.length > 0
    ) {
      onPageIndexChange?.(maxPageIndex);
    }
  }, [pageIndex, maxPageIndex, data.length, onPageIndexChange]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(safePageIndex !== undefined && pageSize !== undefined
        ? { pagination: { pageIndex: safePageIndex, pageSize } }
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
          pageIndex: safePageIndex ?? table.getState().pagination.pageIndex,
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
      pagination: { pageSize: pageSize ?? 10, pageIndex: safePageIndex ?? 0 },
      ...initialState,
    },
    autoResetPageIndex: false,
    meta,
  });

  const ignoredFilterSet = React.useMemo(
    () => (ignoredFilterColumns ? new Set(ignoredFilterColumns) : null),
    [ignoredFilterColumns],
  );

  const isFiltered = table.getState().columnFilters.some((f) => {
    if (ignoredFilterSet?.has(f.id)) return false;
    const v = f.value;
    return Array.isArray(v) ? v.length > 0 : v !== "" && v != null;
  });

  const showClearFilters = isFiltered || (onClearFilters && hasActiveFilters);
  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex: pi } = table.getState().pagination;
  const pageCount = table.getPageCount();

  // Generate visible page numbers
  const getPageNumbers = React.useCallback(() => {
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
  }, [pageCount, pi]);

  return (
    <div className="flex flex-col gap-4 bg-card/80 border border-border/50 rounded-2xl shadow-sm overflow-hidden p-1">
      {/* ── TOOLBAR ── */}
      <DataTableToolbar
        table={table}
        stackFilters={stackFilters}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        totalRows={totalRows}
        showClearFilters={!!showClearFilters}
        onClearFilters={onClearFilters}
        showColumnVisibility={showColumnVisibility}
      >
        {children}
      </DataTableToolbar>

      {/* ── TABLE ── */}
      <DataTableTable
        table={table}
        columnsCount={columns.length}
        emptyStateTitle={emptyStateTitle}
        emptyStateDescription={emptyStateDescription}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
        onRowClick={onRowClick}
        selectedIndex={selectedIndex}
      />

      {/* ── PAGINATION ── */}
      <DataTablePagination
        table={table}
        enableRowSelection={enableRowSelection}
        totalRows={totalRows}
        pageCount={pageCount}
        getPageNumbers={getPageNumbers}
      />
    </div>
  );
}
