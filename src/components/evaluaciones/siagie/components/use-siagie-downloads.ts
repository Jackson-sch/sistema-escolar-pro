import * as React from "react";
import { toast } from "sonner";
import {
  getSiagieExportDataAction,
  getSiagieBulkExportDataAction,
} from "@/actions/siagie";
import {
  getSiagieAttendanceExportDataAction,
  getSiagieBulkAttendanceExportDataAction,
} from "@/actions/siagie-attendance";
import { downloadBase64Excel } from "@/lib/excel";

export function useSiagieDownloads(
  selectedPeriodoId: string,
  selectedNivel: string,
  selectedSeccion?: string,
) {
  const [downloadingSectionId, setDownloadingSectionId] = React.useState<string | null>(null);
  const [downloadingAttendanceId, setDownloadingAttendanceId] = React.useState<string | null>(null);
  const [isBulkDownloading, setIsBulkDownloading] = React.useState(false);

  // Descarga directa del Excel Notas SIAGIE
  const handleDownloadExcel = React.useCallback(async (seccionId: string) => {
    setDownloadingSectionId(seccionId);
    try {
      const res = await getSiagieExportDataAction({
        periodoId: selectedPeriodoId,
        nivelAcademicoId: seccionId,
      });

      if (res.error || !res.base64) {
        toast.error(res.error || "No se pudo generar la exportación");
        return;
      }

      downloadBase64Excel(res.base64, res.fileName || "SIAGIE_Oficial.xlsx");
      toast.success("Plantilla SIAGIE descargada correctamente", {
        description: res.fileName,
      });
    } catch {
      toast.error("Error al descargar el archivo Excel.");
    } finally {
      setDownloadingSectionId(null);
    }
  }, [selectedPeriodoId]);

  // Descarga directa de Asistencia Oficial SIAGIE
  const handleDownloadAttendanceExcel = React.useCallback(async (seccionId: string) => {
    setDownloadingAttendanceId(seccionId);
    try {
      const res = await getSiagieAttendanceExportDataAction({
        periodoId: selectedPeriodoId,
        nivelAcademicoId: seccionId,
      });

      if (res.error || !res.base64) {
        toast.error(res.error || "No se pudo generar la exportación de asistencia");
        return;
      }

      downloadBase64Excel(res.base64, res.fileName || "SIAGIE_Asistencia.xlsx");
      toast.success("Plantilla de Asistencia SIAGIE descargada", {
        description: res.fileName,
      });
    } catch {
      toast.error("Error al descargar la plantilla de asistencia.");
    } finally {
      setDownloadingAttendanceId(null);
    }
  }, [selectedPeriodoId]);

  // Descarga Masiva Multi-Aula: Calificaciones
  const handleBulkDownloadNotas = React.useCallback(async () => {
    setIsBulkDownloading(true);
    try {
      toast.info("Generando libro consolidado de calificaciones multi-aula...");
      const res = await getSiagieBulkExportDataAction({
        periodoId: selectedPeriodoId,
        nivelNombre: selectedNivel,
        seccionNombre: selectedSeccion,
      });

      if (res.error || !res.base64) {
        toast.error(res.error || "No se pudo generar el consolidado");
        return;
      }

      downloadBase64Excel(res.base64, res.fileName || "SIAGIE_Consolidado.xlsx");
      toast.success("Consolidado SIAGIE generado con éxito", {
        description: `${res.totalSecciones || 0} aulas compiladas en pestañas`,
      });
    } catch {
      toast.error("Error al procesar la exportación masiva.");
    } finally {
      setIsBulkDownloading(false);
    }
  }, [selectedPeriodoId, selectedNivel, selectedSeccion]);

  // Descarga Masiva Multi-Aula: Asistencia
  const handleBulkDownloadAsistencia = React.useCallback(async () => {
    setIsBulkDownloading(true);
    try {
      toast.info("Generando consolidado oficial de asistencia multi-aula...");
      const res = await getSiagieBulkAttendanceExportDataAction({
        periodoId: selectedPeriodoId,
        nivelNombre: selectedNivel,
        seccionNombre: selectedSeccion,
      });

      if (res.error || !res.base64) {
        toast.error(res.error || "No se pudo generar el consolidado de asistencia");
        return;
      }

      downloadBase64Excel(res.base64, res.fileName || "SIAGIE_Asistencia_Consolidado.xlsx");
      toast.success("Consolidado de Asistencia SIAGIE generado", {
        description: `${res.totalSecciones || 0} aulas compiladas en pestañas`,
      });
    } catch {
      toast.error("Error al procesar la asistencia masiva.");
    } finally {
      setIsBulkDownloading(false);
    }
  }, [selectedPeriodoId, selectedNivel, selectedSeccion]);

  return {
    downloadingSectionId,
    downloadingAttendanceId,
    isBulkDownloading,
    handleDownloadExcel,
    handleDownloadAttendanceExcel,
    handleBulkDownloadNotas,
    handleBulkDownloadAsistencia,
  };
}
