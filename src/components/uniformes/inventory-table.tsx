"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { InventoryToolbar } from "./components/inventory-toolbar";
import { InventoryPagination } from "./components/inventory-pagination";
import { StockAdjustmentModal } from "./components/stock-adjustment-modal";
import { getInventoryColumns } from "./components/inventory-columns";

interface InventoryTableProps {
  variantes: any[];
  sedes: any[];
}

export function InventoryTable({ variantes, sedes }: InventoryTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [selectedSede, setSelectedSede] = useState("all");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [adjustmentModal, setAdjustmentModal] = useState<{
    open: boolean;
    variante: any | null;
  }>({
    open: false,
    variante: null,
  });

  // Filtrado de datos por sede
  const filteredData = useMemo(() => {
    return variantes.filter((v) => {
      const matchesSede = selectedSede === "all" || v.sedeId === selectedSede;
      return matchesSede;
    });
  }, [variantes, selectedSede]);

  // Definición de Columnas
  const columns = useMemo(
    () =>
      getInventoryColumns((variante) =>
        setAdjustmentModal({ open: true, variante }),
      ),
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <InventoryToolbar
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
        selectedSede={selectedSede}
        onSelectedSedeChange={setSelectedSede}
        sedes={sedes}
      />

      {/* Tabla TanStack con Paginación Integrada */}
      <Card className="border-border/40 overflow-hidden rounded-2xl bg-card/80 shadow-xl">
        <Table>
          <TableHeader className="bg-muted/30 sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-border/20"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-10 text-xs font-semibold px-4"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-44 text-center"
                >
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground/60">
                    <IconAlertTriangle className="size-8 text-muted-foreground/40" />
                    <p className="text-xs font-semibold">
                      No hay registros de inventario coincidentes
                    </p>
                    <p className="text-[11px]">
                      Ajusta el filtro de sede o la búsqueda.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-indigo-500/5 transition-colors border-border/20"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-2.5">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginación TanStack */}
        <InventoryPagination table={table} />
      </Card>

      {/* Modal de Ajuste de Stock Estilizado */}
      {adjustmentModal.open && (
        <StockAdjustmentModal
          open={adjustmentModal.open}
          onOpenChange={(open) =>
            setAdjustmentModal({ open, variante: null })
          }
          variante={adjustmentModal.variante}
        />
      )}
    </div>
  );
}

export type { InventoryTableProps };
