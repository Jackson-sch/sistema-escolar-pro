import * as React from "react";
import { ColumnDef, Table as TanStackTable } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode | ((table: TanStackTable<TData>) => React.ReactNode);
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
  onRowClick?: (row: TData) => void;
  selectedIndex?: number;
}

export interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
  stackFilters?: boolean;
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  totalRows: number;
  showClearFilters: boolean;
  onClearFilters?: () => void;
  showColumnVisibility?: boolean;
  children?: React.ReactNode | ((table: TanStackTable<TData>) => React.ReactNode);
}

export interface DataTableTableProps<TData> {
  table: TanStackTable<TData>;
  columnsCount: number;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  onRowClick?: (row: TData) => void;
  selectedIndex?: number;
}

export interface DataTablePaginationProps<TData> {
  table: TanStackTable<TData>;
  enableRowSelection?: boolean;
  totalRows: number;
  pageCount: number;
  getPageNumbers?: () => (number | "…")[];
}

export interface PaginationButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  className?: string;
  "aria-label"?: string;
}
