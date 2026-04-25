"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { DataTable } from "@/components/ui/data-table";
import {
  IconCircleDashed,
  IconFilter,
  IconReceipt2,
  IconTable,
} from "@tabler/icons-react";
import { exportToExcel, formatCronogramaForExcel } from "@/lib/export-utils";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CronogramaTableType,
  getCronogramaColumns,
  isVencido,
} from "@/components/finanzas/cronogramas/cronograma-columns";
import { PagoDialog } from "@/components/finanzas/cronogramas/pago-dialog";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { anularPagoAction } from "@/actions/finance";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/formats";
import type { FormatoComprobante } from "@/lib/comprobante-constants";
import { Badge } from "@/components/ui/badge";

interface CronogramaTableProps {
  data: CronogramaTableType[];
  conceptos: any[];
  institucion?: any;
  formatoComprobante?: FormatoComprobante;
}

interface CronogramaFiltersProps {
  seccionFilter: string;
  estadoFilter: string;
  conceptoFilter: string;
  seccionesDisponibles: any[];
  conceptos: any[];
  filteredData: any[];
  meta: any;
}

function CronogramaFilters({
  seccionFilter,
  estadoFilter,
  conceptoFilter,
  seccionesDisponibles,
  conceptos,
  filteredData,
  meta,
}: CronogramaFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 flex-1">
        <Select value={seccionFilter} onValueChange={meta.setSeccionFilter}>
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-full text-xs font-black uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 hover:bg-background/80">
            <div className="flex items-center gap-2 truncate">
              <IconFilter className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Sección" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl rounded-2xl">
            <SelectItem value="all" className="text-xs font-bold">
              TODAS LAS SECCIONES
            </SelectItem>
            {seccionesDisponibles.map(([id, label]) => (
              <SelectItem
                key={id}
                value={id}
                className="text-xs"
              >
                {label.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-full text-xs font-black uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 hover:bg-background/80">
            <div className="flex items-center gap-2 truncate">
              <IconCircleDashed className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl rounded-2xl">
            <SelectItem value="all" className="text-xs font-bold">
              TODOS LOS ESTADOS
            </SelectItem>
            <SelectItem value="PAID" className="text-xs">PAGADO</SelectItem>
            <SelectItem value="PENDING" className="text-xs">PENDIENTE</SelectItem>
            <SelectItem value="EXPIRED" className="text-xs text-red-500 font-bold">VENCIDO</SelectItem>
            <SelectItem value="PARTIALLY_PAID" className="text-xs">PARCIAL</SelectItem>
            <SelectItem value="VOIDED" className="text-xs opacity-50">ANULADO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={conceptoFilter} onValueChange={meta.setConceptoFilter}>
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-full text-xs font-black uppercase tracking-wider transition-all focus:ring-2 focus:ring-primary/20 hover:bg-background/80 xs:col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 truncate">
              <IconReceipt2 className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Concepto" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl rounded-2xl">
            <SelectItem value="all" className="text-xs font-bold">
              TODOS LOS CONCEPTOS
            </SelectItem>
            {conceptos.map((c) => (
              <SelectItem
                key={c.id}
                value={c.id}
                className="text-xs"
              >
                {c.nombre.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function CronogramaTable({
  data,
  conceptos,
  institucion,
  formatoComprobante,
}: CronogramaTableProps) {
  const [showPagoDialog, setShowPagoDialog] = React.useState(false);
  const [selectedCronograma, setSelectedCronograma] =
    React.useState<CronogramaTableType | null>(null);
  const [montoPago, setMontoPago] = React.useState("");
  const [numeroBoleta, setNumeroBoleta] = React.useState("");

  // Estados para anulación de pago
  const [showVoidDialog, setShowVoidDialog] = React.useState(false);
  const [selectedPago, setSelectedPago] = React.useState<any | null>(null);
  const [isPendingVoid, startTransitionVoid] = React.useTransition();

  const onAnularPago = () => {
    if (!selectedPago) return;
    startTransitionVoid(async () => {
      const res = await anularPagoAction({ pagoId: selectedPago.id });
      if (res.success) {
        toast.success(res.success);
        setShowVoidDialog(false);
        setSelectedPago(null);
      } else {
        toast.error(res.error || "No se pudo anular el pago");
      }
    });
  };

  // Estados para filtros con nuqs (persistidos en URL)
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [seccionFilter, setSeccionFilter] = useQueryState(
    "seccion",
    parseAsString.withDefault("all"),
  );
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("all"),
  );
  const [conceptoFilter, setConceptoFilter] = useQueryState(
    "concepto",
    parseAsString.withDefault("all"),
  );

  // Pagination states with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const columns = React.useMemo(
    () =>
      getCronogramaColumns({
        institucion,
        setSelectedCronograma,
        setMontoPago,
        setNumeroBoleta,
        setShowPagoDialog,
        setSelectedPago,
        setShowVoidDialog,
      }),
    [institucion],
  );

  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Filtro por sección
    if (seccionFilter !== "all") {
      result = result.filter(
        (item) => item.estudiante.nivelAcademicoId === seccionFilter,
      );
    }

    // Filtro por estado
    if (estadoFilter !== "all") {
      if (estadoFilter === "PAID")
        result = result.filter((item) => item.pagado);
      if (estadoFilter === "PENDING")
        result = result.filter(
          (item) =>
            !item.pagado &&
            item.montoPagado === 0 &&
            !isVencido(item.fechaVencimiento),
        );
      if (estadoFilter === "PARTIALLY_PAID")
        result = result.filter((item) => !item.pagado && item.montoPagado > 0);
      if (estadoFilter === "EXPIRED")
        result = result.filter(
          (item) => !item.pagado && isVencido(item.fechaVencimiento),
        );
      if (estadoFilter === "VOIDED")
        result = result.filter((item) =>
          item.pagos?.some((p: any) => p.estado === "anulado"),
        );
    }

    // Filtro por concepto
    if (conceptoFilter !== "all") {
      result = result.filter((item) => item.concepto.id === conceptoFilter);
    }

    return result;
  }, [data, seccionFilter, estadoFilter, conceptoFilter]);

  const seccionesDisponibles = React.useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const s = item.estudiante.nivelAcademico;
      if (s) {
        const id = item.estudiante.nivelAcademicoId;
        map.set(id, `${s.nivel.nombre} - ${s.grado.nombre} "${s.seccion}"`);
      }
    });
    return Array.from(map.entries());
  }, [data]);

  const hasActiveFilters =
    searchQuery !== "" ||
    seccionFilter !== "all" ||
    estadoFilter !== "all" ||
    conceptoFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSeccionFilter("all");
    setEstadoFilter("all");
    setConceptoFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Acciones de la tabla */}
      <div className="flex justify-end items-center px-2">
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-6 w-full sm:w-auto border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm"
          title="Exportar a Excel"
          onClick={() =>
            exportToExcel(
              formatCronogramaForExcel(filteredData),
              "Reporte_Cobranza",
              "Pagos",
            )
          }
        >
          <IconTable className="size-4" />
          <span>Exportar Data</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="estudiante"
        searchPlaceholder="Buscar estudiante..."
        searchValue={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setPage(1);
        }}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={{ institucion }}
        showColumnVisibility={false}
        // Controlled pagination
        pageIndex={page - 1}
        pageSize={limit}
        onPageIndexChange={(index) => setPage(index + 1)}
        onPageSizeChange={setLimit}
      >
        {() => (
          <CronogramaFilters
            seccionFilter={seccionFilter}
            estadoFilter={estadoFilter}
            conceptoFilter={conceptoFilter}
            seccionesDisponibles={seccionesDisponibles}
            conceptos={conceptos}
            filteredData={filteredData}
            meta={{ setSeccionFilter, setEstadoFilter, setConceptoFilter }}
          />
        )}
      </DataTable>

      {/* Dialog de Pago */}
      <PagoDialog
        open={showPagoDialog}
        onOpenChange={(open) => {
          setShowPagoDialog(open);
          if (!open) {
            setSelectedCronograma(null);
            setMontoPago("");
            setNumeroBoleta("");
          }
        }}
        cronograma={selectedCronograma}
        institucion={institucion}
        initialMonto={montoPago}
        initialNumeroBoleta={numeroBoleta}
        formatoComprobante={formatoComprobante}
      />

      {/* Dialog de Anulación */}
      <ConfirmModal
        isOpen={showVoidDialog}
        onClose={() => {
          setShowVoidDialog(false);
          setSelectedPago(null);
        }}
        onConfirm={onAnularPago}
        loading={isPendingVoid}
        title="¿Anular este pago?"
        description={
          selectedPago
            ? `Estás a punto de anular el pago ${selectedPago.numeroBoleta || "S/N"} por un monto de ${formatCurrency(selectedPago.monto)} correspondiente a ${selectedPago.concepto}. Esta acción revertirá el saldo del estudiante y marcará el comprobante como anulado.`
            : ""
        }
      />
    </div>
  );
}
