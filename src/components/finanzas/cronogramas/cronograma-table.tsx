"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import { DataTable } from "@/components/ui/data-table";
import { exportFinanceCronogramaExcel } from "@/lib/excel/templates/finance-cronograma";
import {
  CronogramaTableType,
  getCronogramaColumns,
  isVencido,
} from "@/components/finanzas/cronogramas/cronograma-columns";
import { PagoDialog } from "@/components/finanzas/cronogramas/pago-dialog";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { anularPagoAction } from "@/actions/finance";
import { toast } from "sonner";
import { FormatoComprobante } from "@/lib/comprobante-constants";
import { CronogramaHeaderToolbar } from "./components/cronograma-header-toolbar";
import { CronogramaFiltersBar } from "./components/cronograma-filters-bar";

interface CronogramaTableProps {
  data: CronogramaTableType[];
  conceptos: any[];
  niveles?: any[];
  institucion?: any;
  formatoComprobante?: FormatoComprobante;
}

const DEFAULT_NIVELES: any[] = [];

export function CronogramaTable({
  data,
  conceptos,
  niveles = DEFAULT_NIVELES,
  institucion,
  formatoComprobante,
}: CronogramaTableProps) {
  const [showPagoDialog, setShowPagoDialog] = React.useState(false);
  const [selectedCronograma, setSelectedCronograma] =
    React.useState<CronogramaTableType | null>(null);
  const [montoPago, setMontoPago] = React.useState<string>("");
  const [numeroBoleta, setNumeroBoleta] = React.useState<string>("");

  const [showVoidDialog, setShowVoidDialog] = React.useState(false);
  const [selectedPago, setSelectedPago] = React.useState<any>(null);
  const [isVoiding, setIsVoiding] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  // Estados URL mediante nuqs
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
  const [mesFilter, setMesFilter] = useQueryState(
    "mes",
    parseAsString.withDefault("all"),
  );

  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );

  const handleConfirmVoid = async () => {
    if (!selectedPago) return;
    setIsVoiding(true);
    try {
      const res = await anularPagoAction({
        pagoId: selectedPago.id,
      });
      if (res.success) {
        toast.success(res.success as string);
        setShowVoidDialog(false);
        setSelectedPago(null);
      }
      if (res.error) toast.error(res.error);
    } catch {
      toast.error("Error al anular el pago.");
    } finally {
      setIsVoiding(false);
    }
  };

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

  // Secciones únicas disponibles
  const seccionesDisponibles = React.useMemo(() => {
    const map = new Map<string, string>();
    data.forEach((item) => {
      const sec =
        item.estudiante?.matriculas?.[0]?.nivelAcademico ??
        item.estudiante?.nivelAcademico;
      if (sec) {
        const itemNivelNombre = sec.nivel?.nombre || "";
        const label = `${sec.grado?.nombre || ""} - "${sec.seccion || ""}" (${itemNivelNombre})`;
        map.set(label, label);
      }
    });
    return Array.from(map.entries());
  }, [data]);

  // Filtrado de datos
  const filteredData = React.useMemo(() => {
    return data.filter((item) => {
      const studentName =
        `${item.estudiante?.apellidoPaterno || ""} ${item.estudiante?.apellidoMaterno || ""} ${item.estudiante?.name || ""}`.toLowerCase();
      const studentDni = (item.estudiante?.dni || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      const matchSearch =
        searchQuery === "" ||
        studentName.includes(query) ||
        studentDni.includes(query);

      const sec =
        item.estudiante?.matriculas?.[0]?.nivelAcademico ??
        item.estudiante?.nivelAcademico;
      const itemNivelNombre = sec?.nivel?.nombre || "";
      const matchLevel =
        levelFilter === "all" ||
        itemNivelNombre.toLowerCase().includes(levelFilter.toLowerCase());

      const seccionLabel = sec
        ? `${sec.grado?.nombre || ""} - "${sec.seccion || ""}" (${itemNivelNombre})`
        : "";
      const matchSeccion =
        seccionFilter === "all" || seccionLabel === seccionFilter;

      const vencido = isVencido(item.fechaVencimiento, item.pagado);
      let matchEstado = true;
      if (estadoFilter === "PAID") matchEstado = item.pagado;
      else if (estadoFilter === "EXPIRED") matchEstado = vencido;
      else if (estadoFilter === "PENDING")
        matchEstado = !item.pagado && !vencido;
      else if (estadoFilter === "PARTIALLY_PAID")
        matchEstado =
          !item.pagado &&
          Number(item.montoPagado) > 0 &&
          Number(item.montoPagado) < Number(item.monto);
      else if (estadoFilter === "PENDING_VERIFICATION")
        matchEstado = Boolean(
          !item.pagado &&
            item.pagos?.some((p: any) => p.estado === "PENDING_VERIFICATION"),
        );
      else if (estadoFilter === "VOIDED")
        matchEstado = Boolean(
          item.pagos?.some((p: any) => p.estado === "VOIDED"),
        );

      const matchConcepto =
        conceptoFilter === "all" ||
        item.concepto?.id === conceptoFilter ||
        item.concepto?.nombre === conceptoFilter;

      // Filtro por Mes / Periodo rápido
      let matchMes = true;
      if (mesFilter !== "all") {
        const conceptoName = (item.concepto?.nombre || "").toLowerCase();
        const isMatricula = conceptoName.includes("matric");

        if (mesFilter === "matricula") {
          matchMes = isMatricula;
        } else {
          const monthNum = parseInt(mesFilter, 10);
          const itemDate = new Date(item.fechaVencimiento);
          const itemMonth = itemDate.getUTCMonth() + 1;

          const monthKeywords: Record<number, string[]> = {
            3: ["marzo", "mar"],
            4: ["abril", "abr"],
            5: ["mayo", "may"],
            6: ["junio", "jun"],
            7: ["julio", "jul"],
            8: ["agosto", "ago"],
            9: ["setiembre", "septiembre", "set", "sep"],
            10: ["octubre", "oct"],
            11: ["noviembre", "nov"],
            12: ["diciembre", "dic"],
          };

          const matchesDate = !isMatricula && itemMonth === monthNum;
          const matchesKeyword = monthKeywords[monthNum]?.some((kw) =>
            conceptoName.includes(kw)
          );
          matchMes = matchesDate || Boolean(matchesKeyword);
        }
      }

      return (
        matchSearch &&
        matchLevel &&
        matchSeccion &&
        matchEstado &&
        matchConcepto &&
        matchMes
      );
    }).sort((a, b) => {
      // 1. Prioridad: Pendientes / No pagados primero (false antes que true)
      if (a.pagado !== b.pagado) {
        return a.pagado ? 1 : -1;
      }
      // 2. Fechas de vencimiento más recientes arriba
      const timeA = new Date(a.fechaVencimiento).getTime();
      const timeB = new Date(b.fechaVencimiento).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      // 3. Alfabético por apellido paterno
      const apA = a.estudiante?.apellidoPaterno || "";
      const apB = b.estudiante?.apellidoPaterno || "";
      return apA.localeCompare(apB);
    });
  }, [
    data,
    searchQuery,
    levelFilter,
    seccionFilter,
    estadoFilter,
    conceptoFilter,
    mesFilter,
  ]);

  const clearFilters = () => {
    setLevelFilter("all");
    setSeccionFilter("all");
    setEstadoFilter("all");
    setConceptoFilter("all");
    setMesFilter("all");
    setSearchQuery("");
    setPage(1);
  };

  const handleExportExcel = async () => {
    if (filteredData.length === 0) {
      toast.error("No hay registros para exportar con los filtros actuales.");
      return;
    }
    setIsExporting(true);
    try {
      await exportFinanceCronogramaExcel(filteredData);
      toast.success(
        `Reporte Excel generado con éxito (${filteredData.length} cuotas).`,
      );
    } catch (err) {
      console.error("Error al exportar Excel:", err);
      toast.error("Error al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. Barra de Herramientas y Acciones */}
      <CronogramaHeaderToolbar
        conceptos={conceptos}
        niveles={niveles}
        onExportExcel={handleExportExcel}
        isExporting={isExporting}
      />

      {/* 2. Barra de Filtros Externa Desacoplada */}
      <CronogramaFiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        levelFilter={levelFilter}
        seccionFilter={seccionFilter}
        estadoFilter={estadoFilter}
        conceptoFilter={conceptoFilter}
        mesFilter={mesFilter}
        seccionesDisponibles={seccionesDisponibles}
        conceptos={conceptos}
        niveles={niveles}
        totalFiltrados={filteredData.length}
        totalOriginal={data.length}
        onClearFilters={clearFilters}
        meta={{
          setLevelFilter,
          setSeccionFilter,
          setEstadoFilter,
          setConceptoFilter,
          setMesFilter,
          setPage,
        }}
      />

      {/* 3. Tabla de Datos Limpia */}
      <DataTable
        columns={columns}
        data={filteredData}
        pageIndex={page - 1}
        pageSize={limit}
        onPageIndexChange={(newPageIndex: number) => setPage(newPageIndex + 1)}
        onPageSizeChange={(newPageSize: number) => setLimit(newPageSize)}
      />

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
          onConfirm={handleConfirmVoid}
          loading={isVoiding}
          title="Anular Comprobante de Pago"
          description={`¿Estás seguro de anular el pago por ${selectedPago.monto} registrado el ${selectedPago.fechaPago}? Esta acción revertirá el saldo pendiente del estudiante.`}
        />
      )}
    </div>
  );
}
