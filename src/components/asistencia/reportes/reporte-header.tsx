"use client";

import {
  IconCalendarMonth,
  IconCircleFilled,
  IconDownload,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MESES_OPTIONS } from "@/lib/constants";
import ExcelJS from "exceljs";
import { COMMON_BORDERS, downloadExcelWorkbook } from "@/lib/excel";

interface ReporteHeaderProps {
  mes: number;
  anio: number;
  totalEstudiantes: number;
  data?: any[];
  daysInMonth?: number;
}

function parseDayFromDate(dateInput: string | Date): number {
  if (!dateInput) return -1;
  if (typeof dateInput === "string") {
    const datePart = dateInput.split("T")[0];
    const parts = datePart.split("-");
    if (parts.length === 3) {
      return parseInt(parts[2], 10);
    }
  }
  const d = new Date(dateInput);
  return d.getUTCDate();
}

export function ReporteHeader({
  mes,
  anio,
  totalEstudiantes,
  data = [],
  daysInMonth = 0,
}: ReporteHeaderProps) {
  const handleExportXLSX = async () => {
    if (!data || data.length === 0) return;

    const wb = new ExcelJS.Workbook();
    wb.creator = "Sistema Escolar Pro";
    const mesNombre = MESES_OPTIONS[mes]?.nombre || "Mes";
    const ws = wb.addWorksheet(`Asistencia ${mesNombre}`.substring(0, 31), {
      views: [{ showGridLines: true, state: "frozen", xSplit: 2, ySplit: 5 }],
    });

    const totalCols = 1 + daysInMonth + 4; // Estudiante + Días + P, F, T, J

    // Fila 1: Banner Superior
    ws.addRow([]);
    ws.getRow(1).height = 28;
    for (let c = 1; c <= totalCols; c++) {
      ws.getCell(1, c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF064E3B" }, // Emerald 900
      };
    }
    const c1 = ws.getCell(1, 1);
    c1.value = `REPORTE MENSUAL DE ASISTENCIA Y PUNTUALIDAD — ${mesNombre.toUpperCase()} ${anio}`;
    c1.font = { name: "Calibri", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
    c1.alignment = { vertical: "middle", indent: 1 };
    ws.mergeCells(1, 1, 1, totalCols);

    // Fila 2: Subtítulo
    ws.addRow([]);
    ws.getRow(2).height = 18;
    for (let c = 1; c <= totalCols; c++) {
      ws.getCell(2, c).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF047857" }, // Emerald 700
      };
    }
    const c2 = ws.getCell(2, 1);
    c2.value = `Total Alumnos: ${totalEstudiantes}  |  Días del Mes: ${daysInMonth}  |  Emitido: ${new Date().toLocaleDateString("es-PE")}`;
    c2.font = { name: "Calibri", size: 9.5, italic: true, color: { argb: "FFD1FAE5" } };
    c2.alignment = { vertical: "middle", indent: 1 };
    ws.mergeCells(2, 1, 2, totalCols);

    // Fila 3: Leyenda
    ws.addRow([]);
    ws.getRow(3).height = 20;
    const c3 = ws.getCell(3, 1);
    c3.value = "LEYENDA:  (P) Presente  |  (T) Tardanza  |  (F) Falta Injustificada  |  (J) Falta Justificada";
    c3.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF065F46" } };
    c3.alignment = { vertical: "middle", indent: 1 };
    ws.mergeCells(3, 1, 3, totalCols);

    // Fila 4: Espacio
    ws.addRow([]);
    ws.getRow(4).height = 6;

    // Fila 5: Cabecera de la Tabla
    const r5 = ws.getRow(5);
    r5.height = 26;

    const headers = [
      "ESTUDIANTE",
      ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
      "PRES.",
      "FALT.",
      "TARD.",
      "JUST.",
    ];

    headers.forEach((h, idx) => {
      const cell = ws.getCell(5, idx + 1);
      cell.value = h;
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: idx === 0 ? "FF1E293B" : idx > daysInMonth ? "FF0F172A" : "FF047857" },
      };
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: idx === 0 ? "left" : "center" };
      cell.border = COMMON_BORDERS.thin;
    });

    ws.getColumn(1).width = 36;
    for (let d = 1; d <= daysInMonth; d++) {
      ws.getColumn(d + 1).width = 4.5;
    }
    ws.getColumn(daysInMonth + 2).width = 8;
    ws.getColumn(daysInMonth + 3).width = 8;
    ws.getColumn(daysInMonth + 4).width = 8;
    ws.getColumn(daysInMonth + 5).width = 8;

    // Filas de datos
    data.forEach((alumno, rIdx) => {
      const rowNum = 6 + rIdx;
      const row = ws.getRow(rowNum);
      row.height = 20;
      const isEven = rIdx % 2 === 1;
      const baseBg = isEven ? "FFF8FAFC" : "FFFFFFFF";

      const stats = {
        P: alumno.asistencias.filter((a: any) => a.presente && !a.tardanza && !a.justificada).length,
        F: alumno.asistencias.filter((a: any) => !a.presente && !a.justificada).length,
        T: alumno.asistencias.filter((a: any) => a.tardanza).length,
        J: alumno.asistencias.filter((a: any) => a.justificada).length,
      };

      const nameCell = ws.getCell(rowNum, 1);
      nameCell.value = `${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`.toUpperCase();
      nameCell.font = { name: "Calibri", size: 9.5, bold: true };
      nameCell.alignment = { vertical: "middle", indent: 1 };
      nameCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: baseBg } };
      nameCell.border = COMMON_BORDERS.thin;

      for (let day = 1; day <= daysInMonth; day++) {
        const asistencia = alumno.asistencias.find((a: any) => parseDayFromDate(a.fecha) === day);
        let status = "-";
        let cellBg = baseBg;
        let fontColor = "FF64748B";

        if (asistencia) {
          if (asistencia.tardanza) {
            status = "T";
            cellBg = "FFFEF3C7"; // Amber
            fontColor = "FF92400E";
          } else if (asistencia.justificada) {
            status = "J";
            cellBg = "FFDBEAFE"; // Blue
            fontColor = "FF1E40AF";
          } else if (!asistencia.presente) {
            status = "F";
            cellBg = "FFFEE2E2"; // Red
            fontColor = "FF991B1B";
          } else {
            status = "P";
            cellBg = "FFDCFCE7"; // Green
            fontColor = "FF166534";
          }
        }

        const dayCell = ws.getCell(rowNum, day + 1);
        dayCell.value = status;
        dayCell.alignment = { vertical: "middle", horizontal: "center" };
        dayCell.font = { name: "Calibri", size: 9, bold: status !== "-" && status !== "P", color: { argb: fontColor } };
        dayCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: cellBg } };
        dayCell.border = COMMON_BORDERS.thin;
      }

      // Totales
      const statValues = [stats.P, stats.F, stats.T, stats.J];
      statValues.forEach((val, sIdx) => {
        const statCell = ws.getCell(rowNum, daysInMonth + 2 + sIdx);
        statCell.value = val;
        statCell.alignment = { vertical: "middle", horizontal: "center" };
        statCell.font = { name: "Calibri", size: 9.5, bold: true };
        statCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        statCell.border = COMMON_BORDERS.thin;
      });
    });

    const fileName = `Reporte_Asistencia_${mesNombre}_${anio}.xlsx`;
    await downloadExcelWorkbook(wb, fileName);
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-sm">
      <div className="flex items-center gap-3.5">
        <div className="size-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 shadow-xs">
          <IconCalendarMonth className="size-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Reporte Mensual de Asistencia
            </h1>
            <Badge
              variant="secondary"
              className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 font-semibold text-xs"
            >
              {MESES_OPTIONS[mes]?.nombre} {anio}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Visualización consolidada de asistencia por aula y mes seleccionado.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3.5 py-2 rounded-xl border border-border/40">
          <IconUsers className="size-4 text-muted-foreground/70" />
          <span>
            Total:{" "}
            <strong className="text-foreground font-semibold">
              {totalEstudiantes}
            </strong>{" "}
            alumnos
          </span>
        </div>

        <Button
          onClick={handleExportXLSX}
          variant="outline"
          className="gap-2 rounded-xl text-xs font-semibold h-10 border-border/40 hover:bg-muted/80 shadow-2xs cursor-pointer"
        >
          <IconDownload className="size-4" />
          <span>Exportar Excel</span>
        </Button>
      </div>
    </div>
  );
}
