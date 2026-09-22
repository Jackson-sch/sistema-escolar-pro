"use client";

import * as React from "react";
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
import { InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type { DataTableToolbarProps } from "./data-table-types";

export function DataTableToolbar<TData>({
  table,
  stackFilters = false,
  searchKey,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  totalRows,
  showClearFilters,
  onClearFilters,
  showColumnVisibility = false,
  children,
}: DataTableToolbarProps<TData>) {
  return (
    <div
      className={cn(
        "flex items-start sm:items-center justify-between gap-3 p-3 sm:p-3.5 border-b border-border/50 bg-muted/10",
        stackFilters ? "flex-col" : "flex-col lg:flex-row lg:items-center",
      )}
    >
      {/* Search Input + Clear Button */}
      {searchKey && (
        <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
          <div className="relative w-full sm:w-72 lg:w-80 shrink-0">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60 pointer-events-none" />
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
              className="h-9 w-full pl-8.5 pr-8 text-xs font-medium bg-background border rounded-xl placeholder:text-muted-foreground/50 focus:border-primary/40"
            />
            {totalRows > 0 && (
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xxs font-mono font-bold text-muted-foreground/50 pointer-events-none">
                {totalRows}
              </span>
            )}
          </div>

          {showClearFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
                onClearFilters?.();
              }}
              className="h-9 px-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer gap-1 shrink-0"
              title="Limpiar filtros activos"
            >
              <IconFilterOff className="size-3.5" />
              <span className="hidden sm:inline">Limpiar</span>
            </Button>
          )}
        </div>
      )}

      {/* Filters + Actions */}
      <div
        className={cn(
          "flex flex-1 flex-wrap items-center gap-2 w-full",
          stackFilters
            ? "justify-between"
            : "justify-between lg:justify-end",
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
          {/* Si children es una función, le pasamos el objeto table */}
          {typeof children === "function" ? children(table) : children}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto lg:ml-0">
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-xl px-3 text-xs font-bold bg-background border-border/60 cursor-pointer shadow-2xs"
                >
                  <IconLayoutColumns className="size-3.5 text-muted-foreground" />
                  <span>Columnas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl bg-popover border-border/60 p-1.5 shadow-lg">
                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
                  Columnas Visibles
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/30" />
                <div className="py-1">
                  {table
                    .getAllColumns()
                    .flatMap((col) =>
                      typeof col.accessorFn !== "undefined" && col.getCanHide()
                        ? [
                            <DropdownMenuCheckboxItem
                              key={col.id}
                              className="capitalize text-xs font-bold rounded-lg mb-1"
                              checked={col.getIsVisible()}
                              onCheckedChange={(v) => col.toggleVisibility(!!v)}
                            >
                              {col.id}
                            </DropdownMenuCheckboxItem>,
                          ]
                        : [],
                    )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
