"use client";

import { useState, useMemo, useTransition } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  IconSearch,
  IconBuilding,
  IconPlus,
  IconMinus,
  IconArrowsSort,
  IconArrowUp,
  IconArrowDown,
  IconPackage,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconCheck,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registrarMovimientoInventarioAction } from "@/actions/uniformes";
import { toast } from "sonner";
import { FormModal } from "@/components/modals/form-modal";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

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

  // Filtrado de datos por sede y búsqueda global
  const filteredData = useMemo(() => {
    return variantes.filter((v) => {
      const matchesSede = selectedSede === "all" || v.sedeId === selectedSede;
      return matchesSede;
    });
  }, [variantes, selectedSede]);

  // Definición de Columnas de TanStack Table
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "uniforme.nombre",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="p-0 text-xs font-semibold hover:bg-transparent"
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
            className="p-0 text-xs font-semibold hover:bg-transparent"
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
              className="p-0 text-xs font-semibold hover:bg-transparent"
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
                  stock === 0 && "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  stock > 0 && stock <= 5 && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  stock > 5 && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
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
              className="p-0 text-xs font-semibold hover:bg-transparent"
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
              onClick={() =>
                setAdjustmentModal({ open: true, variante: row.original })
              }
              className="h-8 rounded-xl px-3 border-border/40 text-xs font-semibold gap-1 hover:bg-indigo-500/10 hover:text-indigo-600 cursor-pointer"
            >
              <IconArrowsSort className="size-3.5" />
              <span>Ajustar</span>
            </Button>
          </div>
        ),
      },
    ],
    []
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
      {/* Barra de Filtros e Insumos */}
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
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/20">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-10 text-xs font-semibold px-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground/60">
                    <IconAlertTriangle className="size-8 text-muted-foreground/40" />
                    <p className="text-xs font-semibold">No hay registros de inventario coincidentes</p>
                    <p className="text-[11px]">Ajusta el filtro de sede o la búsqueda.</p>
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
                        cell.getContext()
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
          onOpenChange={(open) => setAdjustmentModal({ open, variante: null })}
          variante={adjustmentModal.variante}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function RenderSortIcon({ isSorted }: { isSorted: boolean | string }) {
  if (isSorted === "asc") return <IconArrowUp className="size-3.5 ml-1 text-indigo-500" />;
  if (isSorted === "desc") return <IconArrowDown className="size-3.5 ml-1 text-indigo-500" />;
  return <IconArrowsSort className="size-3.5 ml-1 opacity-40" />;
}

/* Barra de filtros: búsqueda global + selector de sede */
function InventoryToolbar({
  globalFilter,
  onGlobalFilterChange,
  selectedSede,
  onSelectedSedeChange,
  sedes,
}: {
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  selectedSede: string;
  onSelectedSedeChange: (value: string) => void;
  sedes: any[];
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl bg-background/50 border border-border/40 shadow-xs">
      <div className="relative flex-1 max-w-sm w-full">
        <IconSearch className="absolute left-3 top-2.5 text-muted-foreground/60 size-4" />
        <Input
          placeholder="Buscar por prenda, talla o categoría..."
          value={globalFilter ?? ""}
          onChange={(e) => onGlobalFilterChange(e.target.value)}
          className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
        />
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Select value={selectedSede} onValueChange={onSelectedSedeChange}>
          <SelectTrigger className="w-full sm:w-52 bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
            <IconBuilding className="size-3.5 mr-1.5 text-muted-foreground/60" />
            <SelectValue placeholder="Filtrar por Sede" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40">
            <SelectItem value="all" className="text-xs">
              Todas las sedes
            </SelectItem>
            {sedes.map((s) => (
              <SelectItem key={s.id} value={s.id} className="text-xs">
                {s.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/* Paginación integrada de TanStack */
function InventoryPagination({ table }: { table: any }) {
  return (
    <div className="p-3 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 bg-background/50 text-xs">
      <div className="flex items-center gap-2 text-muted-foreground font-medium">
        <span>
          Mostrando {table.getRowModel().rows.length} de {table.getFilteredRowModel().rows.length} registros
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
                <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
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
          Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
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

function StockAdjustmentModal({
  open,
  onOpenChange,
  variante,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variante: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");

  const handleAdjust = () => {
    if (cantidad <= 0 && tipo !== "AJUSTE") {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    startTransition(async () => {
      const res = await registrarMovimientoInventarioAction({
        varianteId: variante.id,
        tipo,
        cantidad,
        motivo:
          motivo ||
          (tipo === "ENTRADA"
            ? "Ingreso de stock"
            : tipo === "SALIDA"
              ? "Salida de mercadería"
              : "Ajuste manual"),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Inventario actualizado correctamente");
        onOpenChange(false);
      }
    });
  };

  return (
    <FormModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Ajuste de Stock e Inventario"
      description={`${variante?.uniforme?.nombre} — Talla ${variante?.talla} (${variante?.sede?.nombre})`}
      className="sm:max-w-[450px]"
    >
      <div className="space-y-4 px-1 py-1">
        {/* Selector de Tipo de Movimiento */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-background/50 rounded-xl border border-border/40">
          <Button
            type="button"
            variant={tipo === "ENTRADA" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("ENTRADA")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "ENTRADA" ? "bg-emerald-600 text-white shadow-md" : "text-muted-foreground"
            )}
          >
            <IconPlus className="size-3.5 mr-1" /> Entrada
          </Button>
          <Button
            type="button"
            variant={tipo === "SALIDA" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("SALIDA")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "SALIDA" ? "bg-rose-600 text-white shadow-md" : "text-muted-foreground"
            )}
          >
            <IconMinus className="size-3.5 mr-1" /> Salida
          </Button>
          <Button
            type="button"
            variant={tipo === "AJUSTE" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("AJUSTE")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "AJUSTE" ? "bg-sky-600 text-white shadow-md" : "text-muted-foreground"
            )}
          >
            <IconArrowsSort className="size-3.5 mr-1" /> Ajuste
          </Button>
        </div>

        {/* Input de Cantidad con Botones + / - */}
        <div className="space-y-1.5">
          <label htmlFor="inventario-cantidad" className="text-xs font-medium text-foreground/80">
            {tipo === "AJUSTE" ? "Stock Final Reemplazante" : "Unidades del Movimiento"}
          </label>
          <div className="flex items-center gap-3 bg-background/50 p-2 rounded-xl border border-border/40">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCantidad(Math.max(0, cantidad - 1))}
              className="rounded-lg size-8 border-border/40 bg-background"
            >
              <IconMinus className="size-3.5" />
            </Button>
            <Input
              id="inventario-cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="text-center font-mono font-bold text-lg h-9 bg-transparent border-none focus-visible:ring-0 shadow-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setCantidad(cantidad + 1)}
              className="rounded-lg size-8 border-border/40 bg-background"
            >
              <IconPlus className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Motivo o Guía */}
        <div className="space-y-1.5">
          <label htmlFor="inventario-motivo" className="text-xs font-medium text-foreground/80">Motivo / Documento de Referencia</label>
          <Input
            id="inventario-motivo"
            placeholder="Ej. Ingreso por Guía de remisión #4582"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="bg-background border-border/40 h-9 rounded-xl text-xs"
          />
        </div>

        {/* Banner de Aviso */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <IconAlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Este movimiento actualizará el stock inmediatamente en la sede de <strong>{variante?.sede?.nombre}</strong>.
          </p>
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAdjust}
            disabled={isPending}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[160px]"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Confirmar Ajuste</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
