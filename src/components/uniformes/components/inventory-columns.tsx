"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconBuilding, IconArrowsSort } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { RenderSortIcon } from "./inventory-toolbar";

export function getInventoryColumns(
  onAdjust: (variante: any) => void,
): ColumnDef<any>[] {
  return [
    {
      accessorKey: "uniforme.nombre",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 text-xs font-semibold hover:bg-transparent cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Prenda Escolar
          <RenderSortIcon isSorted={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-bold text-xs text-foreground">
          {row.original.uniforme?.nombre}
        </span>
      ),
    },
    {
      accessorKey: "uniforme.categoria.nombre",
      header: "Categoría",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="bg-muted/10 border-border/40 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground rounded-md px-2 py-0.5"
        >
          {row.original.uniforme?.categoria?.nombre || "General"}
        </Badge>
      ),
    },
    {
      accessorKey: "talla",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 text-xs font-semibold hover:bg-transparent cursor-pointer"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Talla
          <RenderSortIcon isSorted={column.getIsSorted()} />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border border-indigo-500/20">
          {row.original.talla}
        </span>
      ),
    },
    {
      accessorKey: "sede.nombre",
      header: "Sede / Campus",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <IconBuilding className="size-3.5 opacity-60 text-indigo-500" />
          <span>{row.original.sede?.nombre}</span>
        </div>
      ),
    },
    {
      accessorKey: "stock",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 text-xs font-semibold hover:bg-transparent cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Stock Actual
            <RenderSortIcon isSorted={column.getIsSorted()} />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const stock = row.original.stock || 0;
        return (
          <div className="text-right">
            <Badge
              variant="outline"
              className={cn(
                "rounded-md text-[10px] font-bold px-2 py-0.5 border-none font-mono",
                stock === 0 &&
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                stock > 0 &&
                  stock <= 5 &&
                  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                stock > 5 &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {stock === 0 ? "Agotado" : `${stock} unids`}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "precio",
      header: ({ column }) => (
        <div className="text-right">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 text-xs font-semibold hover:bg-transparent cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Precio (S/)
            <RenderSortIcon isSorted={column.getIsSorted()} />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-bold text-xs font-mono text-foreground">
          {formatCurrency(row.original.precio)}
        </div>
      ),
    },
    {
      id: "acciones",
      header: () => <div className="text-right">Acción</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAdjust(row.original)}
            className="h-8 rounded-xl px-3 border-border/40 text-xs font-semibold gap-1 hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer"
          >
            <IconArrowsSort className="size-3.5" />
            <span>Ajustar</span>
          </Button>
        </div>
      ),
    },
  ];
}
