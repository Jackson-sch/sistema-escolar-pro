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
import { getEnrollmentsAction } from "@/actions/enrollments";
import { exportMatriculasConsolidadoExcel } from "@/lib/excel";

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

      if (format === "xlsx") {
        await exportMatriculasConsolidadoExcel(res.data);
        toast.success(`Consolidado Excel exportado: ${res.data.length} registros`);
      } else {
        const headers = [
          "DNI",
          "Estudiante",
          "Nivel",
          "Grado",
          "Seccion",
          "Sede",
          "Estado",
        ];
        const csvRows = res.data.map((item: any) => [
          item.estudiante?.dni || "",
          `"${item.estudiante?.apellidoPaterno || ""} ${item.estudiante?.name || ""}"`,
          `"${item.nivelAcademico?.nivel?.nombre || ""}"`,
          `"${item.nivelAcademico?.grado?.nombre || ""}"`,
          `"${item.nivelAcademico?.seccion || ""}"`,
          `"${item.nivelAcademico?.sede?.nombre || ""}"`,
          `"${item.estado || "Activo"}"`,
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
        link.download = `Consolidado_Matriculas_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        toast.success(`Consolidado CSV exportado: ${res.data.length} registros`);
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
