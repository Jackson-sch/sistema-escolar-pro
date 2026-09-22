"use client";

import * as React from "react";
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
import { exportStudentRosterExcel } from "@/lib/excel";

interface DownloadPadronButtonProps {
  /** Filas de estudiantes opcionales. Si no se especifican, se obtienen automáticamente de la BD. */
  rows?: any[];
}

export function DownloadPadronButton({
  rows: passedRows,
}: DownloadPadronButtonProps = {}) {
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

      if (format === "xlsx") {
        await exportStudentRosterExcel(targetRows);
      } else {
        const headers = [
          "DNI",
          "Apellido Paterno",
          "Apellido Materno",
          "Nombres",
          "Nivel",
          "Grado",
          "Seccion",
          "Sede",
          "Estado",
        ];
        const csvRows = targetRows.map((s) => [
          s.dni || "",
          `"${s.apellidoPaterno || ""}"`,
          `"${s.apellidoMaterno || ""}"`,
          `"${s.name || ""}"`,
          `"${s.nivelAcademico?.nivel?.nombre || ""}"`,
          `"${s.nivelAcademico?.grado?.nombre || ""}"`,
          `"${s.nivelAcademico?.seccion || ""}"`,
          `"${s.nivelAcademico?.sede?.nombre || "Principal"}"`,
          `"${s.estado?.nombre || "Activo"}"`,
        ]);
        const csvContent =
          "\uFEFF" +
          [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Padron_Estudiantes_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }

      toast.success(`Padrón exportado: ${targetRows.length} estudiantes`);
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
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Excel Profesional</span>
            <span className="text-[10px] text-muted-foreground">
              Formato corporativo con estilos
            </span>
          </div>
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
