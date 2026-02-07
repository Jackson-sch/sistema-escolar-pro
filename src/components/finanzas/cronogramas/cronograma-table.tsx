"use client";

import * as React from "react";
import { useQueryState, parseAsString } from "nuqs";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { IconFilter, IconReceipt, IconTable } from "@tabler/icons-react";
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
import { PAYMENT_STATUS_OPTIONS } from "@/lib/constants";

interface CronogramaTableProps {
  data: CronogramaTableType[];
  conceptos: any[];
  institucion?: any;
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
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1">
        <Select value={seccionFilter} onValueChange={meta.setSeccionFilter}>
          <SelectTrigger className="w-full rounded-full">
            <div className="flex items-center gap-2 overflow-hidden">
              <IconFilter className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Sección" className="truncate" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las secciones</SelectItem>
            {seccionesDisponibles.map(([id, label]) => (
              <SelectItem key={id} value={id}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={estadoFilter} onValueChange={meta.setEstadoFilter}>
          <SelectTrigger className="w-full rounded-full">
            <div className="flex items-center gap-2">
              <IconFilter className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Estado" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {PAYMENT_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={conceptoFilter} onValueChange={meta.setConceptoFilter}>
          <SelectTrigger className="rounded-full sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <IconReceipt className="size-4 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Concepto" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los conceptos</SelectItem>
            {conceptos?.map((c: any) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="h-10 w-10 shrink-0 border-primary/10 rounded-full"
        title="Exportar a Excel"
        onClick={() =>
          exportToExcel(
            formatCronogramaForExcel(filteredData),
            "Reporte_Cobranza",
            "Pagos",
          )
        }
      >
        <IconTable className="size-5 text-emerald-600" />
      </Button>
    </div>
  );
}

export function CronogramaTable({
  data,
  conceptos,
  institucion,
}: CronogramaTableProps) {
  const [showPagoDialog, setShowPagoDialog] = React.useState(false);
  const [selectedCronograma, setSelectedCronograma] =
    React.useState<CronogramaTableType | null>(null);
  const [montoPago, setMontoPago] = React.useState("");
  const [numeroBoleta, setNumeroBoleta] = React.useState("");

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

  const columns = React.useMemo(
    () =>
      getCronogramaColumns({
        institucion,
        setSelectedCronograma,
        setMontoPago,
        setNumeroBoleta,
        setShowPagoDialog,
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
  };

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="estudiante"
        searchPlaceholder="Buscar estudiante..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={{ institucion }}
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
      />
    </div>
  );
}
