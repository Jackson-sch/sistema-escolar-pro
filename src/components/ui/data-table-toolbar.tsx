"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import {
  IconSearch,
  IconFilterOff,
  IconLayoutColumns,
} from "@tabler/icons-react";

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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
  children?: React.ReactNode | ((table: any) => React.ReactNode);
  stackFilters?: boolean;
  showColumnVisibility?: boolean;
  ignoredFilterColumns?: string[];
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  children,
  stackFilters = false,
  showColumnVisibility = true,
  ignoredFilterColumns,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.some((f) => {
    if (ignoredFilterColumns?.includes(f.id)) return false;
    const v = f.value;
    return Array.isArray(v) ? v.length > 0 : v !== "" && v != null;
  });

  const showClearFilters = isFiltered || (onClearFilters && hasActiveFilters);
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
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
            className="text-xxs uppercase font-bold opacity-30 hidden sm:flex border-l border-primary/5 pl-3 ml-2 shrink-0"
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
                "h-10 gap-1.5 rounded-xl px-4 text-xs font-bold uppercase tracking-widest",
                "text-muted-foreground border-muted-foreground/30",
                "hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive",
                "transition-all duration-150 shadow-sm",
              )}
            >
              <IconFilterOff className="size-4" />
            </Button>
          )}

          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex h-10 gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-widest bg-background/40"
                >
                  <IconLayoutColumns className="size-4" />
                  Columnas
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-2xl bg-background/95 backdrop-blur-xl border-border/40 p-2 shadow-2xl"
              >
                <DropdownMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground/60 font-bold px-2 py-3">
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
  );
}
