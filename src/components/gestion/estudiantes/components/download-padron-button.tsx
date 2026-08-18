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
import { getStudentsAction } from "@/actions/students";
import { formatDate } from "@/lib/formats";

const HEADERS = [
  "N°",
  "CÓDIGO ESTUDIANTE",
  "CÓDIGO SIAGIE",
  "APELLIDO PATERNO",
  "APELLIDO MATERNO",
  "NOMBRES",
  "DNI",
  "SEXO",
  "FECHA NACIMIENTO",
  "GRADO",
  "SECCIÓN",
  "NIVEL",
  "SEDE",
  "ESTADO",
  "TELÉFONO",
  "EMAIL",
  "DIRECCIÓN",
  "APODERADO",
  "DNI APODERADO",
  "TEL. APODERADO",
  "FECHA INGRESO",
];

const COL_WIDTHS = [
  { wch: 5 },
  { wch: 16 },
  { wch: 14 },
  { wch: 20 },
  { wch: 20 },
  { wch: 24 },
  { wch: 10 },
  { wch: 11 },
  { wch: 15 },
  { wch: 12 },
  { wch: 9 },
  { wch: 14 },
  { wch: 18 },
  { wch: 12 },
  { wch: 13 },
  { wch: 26 },
  { wch: 32 },
  { wch: 32 },
  { wch: 13 },
  { wch: 14 },
  { wch: 15 },
];

function formatRows(students: any[]): any[] {
  return students.map((s, index) => {
    const apoderadoPrimario = s.padresTutores?.find(
      (rel: any) => rel.contactoPrimario,
    )?.padreTutor;
    const apoderado =
      apoderadoPrimario || s.padresTutores?.[0]?.padreTutor || null;

    const apoderadoNombre = apoderado
      ? [
          apoderado.apellidoPaterno || "",
          apoderado.apellidoMaterno || "",
          apoderado.name || "",
        ]
          .filter(Boolean)
          .join(" ")
          .trim()
      : "";

    return {
      "N°": index + 1,
      "CÓDIGO ESTUDIANTE": s.codigoEstudiante || "",
      "CÓDIGO SIAGIE": s.codigoSiagie || "",
      "APELLIDO PATERNO": s.apellidoPaterno || "",
      "APELLIDO MATERNO": s.apellidoMaterno || "",
      NOMBRES: s.name || "",
      DNI: s.dni || "",
      SEXO: s.sexo || "",
      "FECHA NACIMIENTO": s.fechaNacimiento
        ? formatDate(s.fechaNacimiento)
        : "",
      GRADO: s.nivelAcademico?.grado?.nombre || "",
      SECCIÓN: s.nivelAcademico?.seccion || "",
      NIVEL: s.nivelAcademico?.nivel?.nombre || "",
      SEDE: s.nivelAcademico?.sede?.nombre || "",
      ESTADO: s.estado?.nombre || "",
      TELÉFONO: s.telefono || "",
      EMAIL: s.email || "",
      DIRECCIÓN: s.direccion || "",
      APODERADO: apoderadoNombre,
      "DNI APODERADO": apoderado?.dni || "",
      "TEL. APODERADO": apoderado?.telefono || "",
      "FECHA INGRESO": s.fechaIngreso ? formatDate(s.fechaIngreso) : "",
    };
  });
}

function buildWorkbook(rows: any[]): XLSX.WorkBook {
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });

  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1E293B" } }, // Slate 800
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

  // Aplicar estilos: cabecera oscura + celdas con bordes
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
  XLSX.utils.book_append_sheet(wb, ws, "Padrón");
  return wb;
}

function downloadCsv(rows: any[], fileName: string) {
  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  const csv = XLSX.utils.sheet_to_csv(ws);

  // BOM UTF-8 para que Excel muestre correctamente acentos y "ñ"
  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

interface DownloadPadronButtonProps {
  /** Filas de estudiantes opcionales. Si no se especifican, se obtienen automáticamente de la BD. */
  rows?: any[];
}

export function DownloadPadronButton({ rows: passedRows }: DownloadPadronButtonProps = {}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExport = async (format: "xlsx" | "csv") => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let targetRows = passedRows;

      if (!targetRows || targetRows.length === 0) {
        const res = await getStudentsAction({ page: 1, pageSize: 100000 });
        if ("error" in res || !res.data) {
          toast.error(res.error || "No se pudieron obtener los estudiantes");
          return;
        }
        targetRows = res.data;
      }

      if (!targetRows || targetRows.length === 0) {
        toast.error("No hay estudiantes para exportar");
        return;
      }

      const formatted = formatRows(targetRows);
      const baseName = `Padron_Estudiantes_${new Date()
        .toISOString()
        .split("T")[0]}`;

      if (format === "csv") {
        downloadCsv(formatted, `${baseName}.csv`);
      } else {
        const wb = buildWorkbook(formatted);
        XLSX.writeFile(wb, `${baseName}.xlsx`);
      }

      toast.success(`Padrón exportado: ${formatted.length} estudiantes`);
    } catch (error) {
      console.error("Error exportando padrón:", error);
      toast.error("No se pudo exportar el padrón de estudiantes");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? (
            <IconLoader2 className="size-4 text-muted-foreground animate-spin" />
          ) : (
            <IconCloudDownload className="size-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">
            {isLoading ? "Descargando…" : "Descargar Padrón"}
          </span>
          <IconChevronDown className="size-3.5 text-muted-foreground/50 hidden sm:inline" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl p-2 shadow-lg border border-border/50 bg-background"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 py-2">
          Exportar Padrón
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
