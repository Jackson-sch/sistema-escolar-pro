"use client";

import * as React from "react";
import { useQueryState, parseAsString, parseAsBoolean } from "nuqs";
import { toast } from "sonner";
import {
  getSiagieInstitutionalOverviewAction,
  auditSectionDetailSiagieAction,
} from "@/actions/siagie-audit";
import { useSiagieDownloads } from "./components/use-siagie-downloads";

import {
  SiagieAuditConsoleProps,
  SectionAuditDetail,
} from "./components/siagie-audit-types";
import { SiagieHeaderControls } from "./components/siagie-header-controls";
import { SiagieKpiCards } from "./components/siagie-kpi-cards";
import { SiagieMatrixCard } from "./components/siagie-matrix-card";
import { SiagieDetailModal } from "./components/siagie-detail-modal";
import { SiagieGuideSheet } from "./components/siagie-guide-sheet";

export function SiagieAuditConsole({ initialData }: SiagieAuditConsoleProps) {
  const [data, setData] = React.useState(initialData);

  // URL States sincronizados con nuqs
  const [selectedPeriodoId, setSelectedPeriodoId] = useQueryState(
    "periodo",
    parseAsString.withDefault(initialData.periodoActualId),
  );
  const [selectedNivel, setSelectedNivel] = useQueryState(
    "nivel",
    parseAsString.withDefault("TODOS"),
  );
  const [selectedSeccion, setSelectedSeccion] = useQueryState(
    "seccion",
    parseAsString.withDefault("TODAS"),
  );
  const [selectedEstado, setSelectedEstado] = useQueryState(
    "estado",
    parseAsString.withDefault("TODOS"),
  );
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault(""),
  );
  const [showGuideSheet, setShowGuideSheet] = useQueryState(
    "guia",
    parseAsBoolean.withDefault(false),
  );
  const [activeSectionId, setActiveSectionId] = useQueryState(
    "aula",
    parseAsString.withDefault(""),
  );

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Modal de Detalle de Sección
  const [sectionDetail, setSectionDetail] =
    React.useState<SectionAuditDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [showDetailDialog, setShowDetailDialog] = React.useState(false);

  // Recargar datos al cambiar de periodo
  const reloadData = React.useCallback(async (periodoId: string) => {
    setIsRefreshing(true);
    try {
      const res = await getSiagieInstitutionalOverviewAction(periodoId);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res.error || "No se pudo actualizar la auditoría");
      }
    } catch {
      toast.error("Error al cargar la información");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handlePeriodoChange = (newPeriodoId: string) => {
    setSelectedPeriodoId(newPeriodoId);
    reloadData(newPeriodoId);
  };

  // Abrir detalle de auditoría de un aula
  const handleOpenDetail = React.useCallback(async (seccionId: string) => {
    setActiveSectionId(seccionId);
    setShowDetailDialog(true);
    setIsLoadingDetail(true);
    try {
      const res = await auditSectionDetailSiagieAction(
        seccionId,
        selectedPeriodoId,
      );
      if (res.success && res.data) {
        setSectionDetail(res.data);
      } else {
        toast.error(res.error || "Error al obtener el detalle del aula");
        setShowDetailDialog(false);
        setActiveSectionId(null);
      }
    } catch {
      toast.error("Error al procesar la auditoría");
      setShowDetailDialog(false);
      setActiveSectionId(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, [selectedPeriodoId, setActiveSectionId]);

  // Si se comparte o accede directamente por URL con ?aula=id
  React.useEffect(() => {
    if (activeSectionId && !showDetailDialog) {
      handleOpenDetail(activeSectionId);
    }
  }, [activeSectionId, handleOpenDetail, showDetailDialog]);

  const handleDetailDialogChange = (open: boolean) => {
    setShowDetailDialog(open);
    if (!open) {
      setActiveSectionId(null);
    }
  };

  // Hook modularizado de descargas y exportación masiva
  const {
    downloadingSectionId,
    downloadingAttendanceId,
    isBulkDownloading,
    handleDownloadExcel,
    handleDownloadAttendanceExcel,
    handleBulkDownloadNotas,
    handleBulkDownloadAsistencia,
  } = useSiagieDownloads(selectedPeriodoId, selectedNivel, selectedSeccion);

  // Niveles y secciones únicos para los filtros
  const nivelesUnicos = React.useMemo(() => {
    const set = new Set<string>();
    data.secciones.forEach((s) => {
      if (s.nivelNombre) set.add(s.nivelNombre);
    });
    return Array.from(set);
  }, [data.secciones]);

  const seccionesUnicas = React.useMemo(() => {
    const set = new Set<string>();
    data.secciones.forEach((s) => {
      if (s.seccion) set.add(s.seccion);
    });
    return Array.from(set).sort();
  }, [data.secciones]);

  // Filtrado de secciones
  const filteredSecciones = React.useMemo(() => {
    return data.secciones.filter((s) => {
      if (selectedNivel !== "TODOS" && s.nivelNombre !== selectedNivel) {
        return false;
      }
      if (selectedSeccion !== "TODAS" && s.seccion !== selectedSeccion) {
        return false;
      }
      if (selectedEstado !== "TODOS" && s.estado !== selectedEstado) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchGrado = (s.gradoNombre || "").toLowerCase().includes(q);
        const matchNivel = (s.nivelNombre || "").toLowerCase().includes(q);
        const matchSeccion = (s.seccion || "").toLowerCase().includes(q);
        const matchTutor = (s.tutorNombre || "").toLowerCase().includes(q);
        if (!matchGrado && !matchNivel && !matchSeccion && !matchTutor) {
          return false;
        }
      }
      return true;
    });
  }, [data.secciones, selectedNivel, selectedSeccion, selectedEstado, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. BARRA DE CONTROL Y SELECTOR DE PERIODO */}
      <SiagieHeaderControls
        periodos={data.periodos}
        selectedPeriodoId={selectedPeriodoId}
        onPeriodoChange={handlePeriodoChange}
        nivelesUnicos={nivelesUnicos}
        selectedNivel={selectedNivel}
        onNivelChange={(n) => setSelectedNivel(n === "TODOS" ? null : n)}
        seccionesUnicas={seccionesUnicas}
        selectedSeccion={selectedSeccion}
        onSeccionChange={(sec) => setSelectedSeccion(sec === "TODAS" ? null : sec)}
        isRefreshing={isRefreshing}
        onRefresh={() => reloadData(selectedPeriodoId)}
        onBulkDownloadNotas={handleBulkDownloadNotas}
        onBulkDownloadAsistencia={handleBulkDownloadAsistencia}
        isBulkDownloading={isBulkDownloading}
        onOpenGuide={() => setShowGuideSheet(true)}
      />

      {/* 2. TARJETAS KPI DE CONSISTENCIA INSTITUCIONAL */}
      <SiagieKpiCards kpis={data.kpis} />

      {/* 3. TABLA DE AUDITORÍA POR AULA */}
      <SiagieMatrixCard
        filteredSecciones={filteredSecciones}
        totalSeccionesCount={data.secciones.length}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q || null)}
        selectedEstado={selectedEstado}
        onEstadoChange={(est) => setSelectedEstado(est === "TODOS" ? null : est)}
        onOpenDetail={handleOpenDetail}
        onDownloadExcel={handleDownloadExcel}
        downloadingSectionId={downloadingSectionId}
        onDownloadAttendanceExcel={handleDownloadAttendanceExcel}
        downloadingAttendanceId={downloadingAttendanceId}
      />

      {/* 4. MODAL DETALLE DE AUDITORÍA & CURSOS */}
      <SiagieDetailModal
        open={showDetailDialog}
        onOpenChange={handleDetailDialogChange}
        isLoading={isLoadingDetail}
        sectionDetail={sectionDetail}
        activeSectionId={activeSectionId}
        onDownloadExcel={handleDownloadExcel}
        isDownloading={downloadingSectionId === activeSectionId}
      />

      {/* 5. SHEET GUÍA DE FUNCIONAMIENTO DEL MÓDULO */}
      <SiagieGuideSheet
        open={showGuideSheet}
        onOpenChange={(open) => setShowGuideSheet(open ? true : null)}
      />
    </div>
  );
}

export type { SiagieAuditConsoleProps };
