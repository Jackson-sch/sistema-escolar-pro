"use client";

import * as React from "react";
import * as XLSX from "xlsx-js-style";
import {
  IconChevronDown,
  IconCloudDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getEnrollmentsAction } from "@/actions/enrollments";
import { formatDate } from "@/lib/formats";

const HEADERS = [
  "N°",
  "AÑO ACADÉMICO",
  "FECHA MATRÍCULA",
  "DNI ESTUDIANTE",
  "APELLIDO PATERNO",
  "APELLIDO MATERNO",
  "NOMBRES",
  "NIVEL ACADÉMICO",
  "GRADO",
  "SECCIÓN",
  "SEDE",
  "TIPO INGRESO",
  "ESTADO MATRÍCULA",
];

const COL_WIDTHS = [
  { wch: 5 },
  { wch: 14 },
  { wch: 16 },
  { wch: 14 },
  { wch: 20 },
  { wch: 20 },
  { wch: 24 },
  { wch: 16 },
  { wch: 14 },
  { wch: 10 },
  { wch: 18 },
  { wch: 16 },
  { wch: 14 },
];

function formatEnrollmentRows(enrollments: any[]): any[] {
  return enrollments.map((item, index) => {
    const est = item.estudiante || {};
    const nac = item.nivelAcademico || {};

    return {
      "N°": index + 1,
      "AÑO ACADÉMICO": item.anioAcademico || "",
      "FECHA MATRÍCULA": item.fechaMatricula ? formatDate(item.fechaMatricula) : "",
      "DNI ESTUDIANTE": est.dni || "",
      "APELLIDO PATERNO": est.apellidoPaterno || "",
      "APELLIDO MATERNO": est.apellidoMaterno || "",
      NOMBRES: est.name || "",
      "NIVEL ACADÉMICO": nac.nivel?.nombre || "",
      GRADO: nac.grado?.nombre || "",
      SECCIÓN: nac.seccion || "",
      SEDE: nac.sede?.nombre || "",
      "TIPO INGRESO": (item.tipo || "Regular").toUpperCase(),
      "ESTADO MATRÍCULA": (item.estado || "Activo").toUpperCase(),
    };
  });
}

function buildEnrollmentsWorkbook(rows: any[]): XLSX.WorkBook {
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "0F172A" } }, // Slate 900
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  } as const;

  const cellStyle = {
    font: { sz: 10 },
    alignment: { vertical: "center" },
    border: {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    },
  } as const;

  const range = XLSX.utils.decode_range(ws["!ref"]!);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellAddress]) continue;
      ws[cellAddress].s = R === 0 ? headerStyle : cellStyle;
    }
  }

  ws["!cols"] = COL_WIDTHS;
  ws["!autofilter"] = { ref: ws["!ref"]! };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Consolidado Matrículas");
  return wb;
}

function downloadCsv(rows: any[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  const csv = XLSX.utils.sheet_to_csv(ws);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function DownloadEnrollmentsReportButton() {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExport = async (format: "xlsx" | "csv") => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const res = await getEnrollmentsAction();
      if (!res.data || res.data.length === 0) {
        toast.error("No hay datos de matrículas para exportar");
        return;
      }

      const rows = formatEnrollmentRows(res.data);
      const baseName = `Consolidado_Matriculas_${new Date()
        .toISOString()
        .split("T")[0]}`;

      if (format === "csv") {
        downloadCsv(rows, `${baseName}.csv`);
        toast.success(`Consolidado CSV exportado: ${rows.length} registros`);
      } else {
        const wb = buildEnrollmentsWorkbook(rows);
        XLSX.writeFile(wb, `${baseName}.xlsx`);
        toast.success(`Consolidado Excel exportado: ${rows.length} registros`);
      }
    } catch (error) {
      console.error("Error exportando consolidado de matrículas:", error);
      toast.error("No se pudo exportar el consolidado de matrículas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-xl h-10 px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <IconLoader2 className="size-4 text-muted-foreground animate-spin" />
          ) : (
            <IconCloudDownload className="size-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">
            {isLoading ? "Generando..." : "Reporte Consolidado"}
          </span>
          <IconChevronDown className="size-3.5 text-muted-foreground/50 hidden sm:inline" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl p-2 shadow-lg border border-border/50 bg-background"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 py-2">
          Reporte Consolidado
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={isLoading}
          className="rounded-lg m-1 gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
        >
          <IconFileSpreadsheet className="size-4 text-emerald-600" />
          <span className="text-xs font-medium">Excel (.xlsx)</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isLoading}
          className="rounded-lg m-1 gap-2 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors"
        >
          <IconFileTypeCsv className="size-4 text-sky-600" />
          <span className="text-xs font-medium">CSV (.csv)</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
