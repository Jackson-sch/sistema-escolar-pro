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
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";

interface CronogramaTableProps {
  data: CronogramaTableType[];
  conceptos: any[];
  niveles?: any[];
  institucion?: any;
  formatoComprobante?: FormatoComprobante;
}

interface CronogramaFiltersProps {
  levelFilter: string;
  seccionFilter: string;
  estadoFilter: string;
  conceptoFilter: string;
  seccionesDisponibles: any[];
  conceptos: any[];
  niveles: any[];
  filteredData: any[];
  meta: any;
}

function CronogramaFilters({
  levelFilter,
  seccionFilter,
  estadoFilter,
  conceptoFilter,
  seccionesDisponibles,
  conceptos,
  niveles,
  meta,
}: CronogramaFiltersProps) {
  return (
    <div className="space-y-4 w-full">
      {/* Control Segmentado de Nivel Educativo */}
      {niveles && niveles.length > 0 && (
        <LevelSegmentedControl
          levels={[
            { id: "all", label: "TODOS" },
            ...niveles.map((n: any) => ({ id: n.id, label: n.nombre }))
          ]}
          value={levelFilter}
          onChange={(val) => {
            meta.setLevelFilter(val);
            meta.setSeccionFilter("all");
            meta.setPage(1);
          }}
          label="Nivel Educativo"
        />
      )}

      {/* Selects Secundarios: Sección, Estado y Concepto */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 flex-1">
        <Select value={seccionFilter} onValueChange={meta.setSeccionFilter}>
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-xl text-xs font-semibold uppercase tracking-wider transition-[background-color,box-shadow] focus:ring-2 focus:ring-indigo-500/20 hover:bg-background/80">
            <div className="flex items-center gap-2 truncate">
              <IconFilter className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Sección" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">
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
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-xl text-xs font-semibold uppercase tracking-wider transition-[background-color,box-shadow] focus:ring-2 focus:ring-indigo-500/20 hover:bg-background/80">
            <div className="flex items-center gap-2 truncate">
              <IconCircleDashed className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">
              TODOS LOS ESTADOS
            </SelectItem>
            <SelectItem value="PAID" className="text-xs text-emerald-600 font-semibold">PAGADO</SelectItem>
            <SelectItem value="PENDING" className="text-xs text-amber-600 font-semibold">PENDIENTE</SelectItem>
            <SelectItem value="EXPIRED" className="text-xs text-rose-500 font-semibold">VENCIDO</SelectItem>
            <SelectItem value="PARTIALLY_PAID" className="text-xs text-blue-600 font-semibold">PARCIAL</SelectItem>
            <SelectItem value="PENDING_VERIFICATION" className="text-xs text-indigo-600 font-semibold">
              POR VERIFICAR (VOUCHERS)
            </SelectItem>
            <SelectItem value="VOIDED" className="text-xs opacity-50">ANULADO</SelectItem>
          </SelectContent>
        </Select>

        <Select value={conceptoFilter} onValueChange={meta.setConceptoFilter}>
          <SelectTrigger className="w-full h-10 bg-background/50 border-border/40 rounded-xl text-xs font-semibold uppercase tracking-wider transition-[background-color,box-shadow] focus:ring-2 focus:ring-indigo-500/20 hover:bg-background/80 xs:col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 truncate">
              <IconReceipt2 className="size-4 opacity-40 shrink-0" />
              <SelectValue placeholder="Concepto" />
            </div>
          </SelectTrigger>
          <SelectContent className="border-border/40 bg-background/95 rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">
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
  niveles = [],
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
  const [levelFilter, setLevelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("all"),
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

    // Filtro por Nivel
    if (levelFilter !== "all") {
      result = result.filter(
        (item: any) =>
          item.estudiante?.nivelAcademico?.nivel?.id === levelFilter ||
          (item.estudiante?.nivelAcademico?.nivel as any)?.id === levelFilter ||
          (item.estudiante?.nivelAcademico?.nivel as any)?.nombre?.toLowerCase() === levelFilter.toLowerCase(),
      );
    }

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
      if (estadoFilter === "PENDING_VERIFICATION")
        result = result.filter(
          (item) =>
            item.pagos?.some((p: any) => p.estado === "pendiente" || p.comprobante) ||
            (item as any).estado === "PENDING_VERIFICATION",
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
  }, [data, levelFilter, seccionFilter, estadoFilter, conceptoFilter]);

  const seccionesDisponibles = React.useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const s = item.estudiante.nivelAcademico;
      if (s) {
        const nivelObj = s.nivel as any;
        if (
          levelFilter === "all" ||
          nivelObj?.id === levelFilter ||
          nivelObj?.nombre?.toLowerCase() === levelFilter.toLowerCase()
        ) {
          const id = item.estudiante.nivelAcademicoId;
          map.set(id, `${nivelObj?.nombre || ""} - ${s.grado?.nombre || ""} "${s.seccion}"`);
        }
      }
    });
    return Array.from(map.entries());
  }, [data, levelFilter]);

  const hasActiveFilters =
    searchQuery !== "" ||
    levelFilter !== "all" ||
    seccionFilter !== "all" ||
    estadoFilter !== "all" ||
    conceptoFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setLevelFilter("all");
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
          className="h-10 px-5 w-full sm:w-auto border-emerald-500/20 text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-[background-color,border-color] rounded-xl font-semibold text-xs gap-2 shadow-xs"
          title="Exportar a Excel"
          onClick={() =>
            exportToExcel(
              formatCronogramaForExcel(filteredData),
              `Cronograma_Pagos_${new Date().toISOString().split("T")[0]}`,
            )
          }
        >
          <IconTable className="size-4" />
          <span>Exportar a Excel</span>
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="estudiante"
        searchPlaceholder="Buscar por estudiante (DNI, Nombres)..."
        pageIndex={page - 1}
        pageSize={limit}
        onPageIndexChange={(newPageIndex: number) => setPage(newPageIndex + 1)}
        onPageSizeChange={(newPageSize: number) => setLimit(newPageSize)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      >
        <CronogramaFilters
          levelFilter={levelFilter}
          seccionFilter={seccionFilter}
          estadoFilter={estadoFilter}
          conceptoFilter={conceptoFilter}
          seccionesDisponibles={seccionesDisponibles}
          conceptos={conceptos}
          niveles={niveles}
          filteredData={filteredData}
          meta={{
            setLevelFilter,
            setSeccionFilter,
            setEstadoFilter,
            setConceptoFilter,
            setPage,
          }}
        />
      </DataTable>

      {/* Modal para Registrar Pago */}
      {selectedCronograma && (
        <PagoDialog
          open={showPagoDialog}
          onOpenChange={(openVal) => {
            setShowPagoDialog(openVal);
            if (!openVal) setSelectedCronograma(null);
          }}
          cronograma={selectedCronograma}
          initialMonto={montoPago}
          initialNumeroBoleta={numeroBoleta}
          institucion={institucion}
          formatoComprobante={formatoComprobante}
        />
      )}

      {/* Modal para Confirmar Anulación de Pago */}
      {selectedPago && (
        <ConfirmModal
          isOpen={showVoidDialog}
          onClose={() => {
            setShowVoidDialog(false);
            setSelectedPago(null);
          }}
          onConfirm={onAnularPago}
          title="Anular Pago Registrado"
          description={`¿Estás seguro de que deseas anular el pago de ${formatCurrency(selectedPago.monto)}? Esta acción reversará el saldo y marcará la boleta como anulada.`}
          loading={isPendingVoid}
          variant="danger"
        />
      )}
    </div>
  );
}
