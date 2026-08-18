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
import * as XLSX from "xlsx-js-style";

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
  const handleExportXLSX = () => {
    if (!data || data.length === 0) return;

    const excelData = data.map((alumno) => {
      const stats = {
        P: alumno.asistencias.filter(
          (a: any) => a.presente && !a.tardanza && !a.justificada,
        ).length,
        F: alumno.asistencias.filter((a: any) => !a.presente && !a.justificada)
          .length,
        T: alumno.asistencias.filter((a: any) => a.tardanza).length,
        J: alumno.asistencias.filter((a: any) => a.justificada).length,
      };

      const row: any = {
        ESTUDIANTE:
          `${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`.toUpperCase(),
      };

      for (let day = 1; day <= daysInMonth; day++) {
        const asistencia = alumno.asistencias.find(
          (a: any) => parseDayFromDate(a.fecha) === day,
        );
        let status = "-";
        if (asistencia) {
          if (asistencia.tardanza) status = "T";
          else if (asistencia.justificada) status = "J";
          else if (!asistencia.presente) status = "F";
          else status = "P";
        }
        row[day.toString()] = status;
      }

      row["PRES."] = stats.P;
      row["FALT."] = stats.F;
      row["TARD."] = stats.T;
      row["JUST."] = stats.J;

      return row;
    });

    const header = [
      "ESTUDIANTE",
      ...Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
      "PRES.",
      "FALT.",
      "TARD.",
      "JUST.",
    ];

    const ws = XLSX.utils.json_to_sheet(excelData, { header });

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1E293B" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const cellStyle = {
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const studentColStyle = {
      font: { bold: true },
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const range = XLSX.utils.decode_range(ws["!ref"]!);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) continue;

        if (R === 0) {
          ws[cellAddress].s = headerStyle;
        } else {
          if (C === 0) {
            ws[cellAddress].s = studentColStyle;
          } else {
            const value = ws[cellAddress].v;
            let customStyle = { ...cellStyle };

            if (value === "P") {
              customStyle = {
                ...customStyle,
                font: { color: { rgb: "059669" }, bold: true },
                fill: { fgColor: { rgb: "ECFDF5" } },
              } as any;
            } else if (value === "F") {
              customStyle = {
                ...customStyle,
                font: { color: { rgb: "DC2626" }, bold: true },
                fill: { fgColor: { rgb: "FEF2F2" } },
              } as any;
            } else if (value === "T") {
              customStyle = {
                ...customStyle,
                font: { color: { rgb: "D97706" }, bold: true },
                fill: { fgColor: { rgb: "FFFBEB" } },
              } as any;
            } else if (value === "J") {
              customStyle = {
                ...customStyle,
                font: { color: { rgb: "0284C7" }, bold: true },
                fill: { fgColor: { rgb: "F0F9FF" } },
              } as any;
            }

            ws[cellAddress].s = customStyle;
          }
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia");

    const wscols = [
      { wch: 40 },
      ...Array.from({ length: daysInMonth }, () => ({ wch: 4 })),
      { wch: 6 },
      { wch: 6 },
      { wch: 6 },
      { wch: 6 },
    ];
    ws["!cols"] = wscols;

    XLSX.writeFile(
      wb,
      `Reporte_Asistencia_${MESES_OPTIONS[mes].nombre}_${anio}.xlsx`,
    );
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md shadow-sm mb-4">
      <div className="flex items-center gap-3.5">
        <div className="size-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 shadow-xs">
          <IconCalendarMonth className="size-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-extrabold tracking-tight text-foreground uppercase">
              Consolidado {MESES_OPTIONS[mes].nombre}
            </h3>
            <Badge variant="outline" className="text-[10px] font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 rounded-full px-2 py-0">
              Año Lectivo {anio}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
            <IconUsers size={13} className="text-indigo-500" />
            <span className="font-bold text-foreground/80">{totalEstudiantes} Alumnos</span> registrados en la nómina activa
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        {/* Leyenda de Asistencia */}
        <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/80 bg-muted/40 border border-border/40 rounded-xl px-3 py-1.5 shadow-xs">
          <div className="flex items-center gap-1">
            <IconCircleFilled className="size-2 text-emerald-500" />
            <span>P: Pres.</span>
          </div>
          <div className="flex items-center gap-1">
            <IconCircleFilled className="size-2 text-rose-500" />
            <span>F: Falta</span>
          </div>
          <div className="flex items-center gap-1">
            <IconCircleFilled className="size-2 text-amber-500" />
            <span>T: Tarde</span>
          </div>
          <div className="flex items-center gap-1">
            <IconCircleFilled className="size-2 text-sky-500" />
            <span>J: Just.</span>
          </div>
        </div>

        <Button
          onClick={handleExportXLSX}
          disabled={!data || data.length === 0}
          className="rounded-xl text-xs font-bold px-4 h-9.5 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <IconDownload className="size-4" />
          Exportar Excel
        </Button>
      </div>
    </div>
  );
}
