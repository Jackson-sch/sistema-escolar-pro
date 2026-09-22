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
import { getStaffAction } from "@/actions/staff";
import { exportStaffRosterExcel } from "@/lib/excel";

interface DownloadStaffButtonProps {
  rows?: any[];
}

export function DownloadStaffButton({
  rows: passedRows,
}: DownloadStaffButtonProps = {}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleExport = async (format: "xlsx" | "csv") => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      let targetRows = passedRows;

      if (!targetRows || targetRows.length === 0) {
        const res = await getStaffAction();
        if ("error" in res || !res.data) {
          toast.error(res.error || "No se pudo obtener la lista de personal");
          return;
        }
        targetRows = res.data;
      }

      if (!targetRows || targetRows.length === 0) {
        toast.error("No hay registros de personal para exportar");
        return;
      }

      if (format === "xlsx") {
        await exportStaffRosterExcel(targetRows);
      } else {
        const headers = [
          "DNI",
          "Apellido Paterno",
          "Apellido Materno",
          "Nombres",
          "Cargo",
          "Area",
          "Rol",
          "Correo",
          "Telefono",
          "Tipo Contrato",
          "Fecha Ingreso",
          "Estado",
        ];
        const csvRows = targetRows.map((s) => [
          s.dni || "",
          `"${s.apellidoPaterno || ""}"`,
          `"${s.apellidoMaterno || ""}"`,
          `"${s.name || ""}"`,
          `"${s.cargo?.nombre || "Sin cargo"}"`,
          `"${s.area || "General"}"`,
          `"${s.role ? s.role.toUpperCase() : "PERSONAL"}"`,
          `"${s.email || ""}"`,
          `"${s.telefono || ""}"`,
          `"${s.tipoContrato || ""}"`,
          `"${s.fechaIngreso ? new Date(s.fechaIngreso).toLocaleDateString("es-PE") : ""}"`,
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
        link.download = `Nomina_Personal_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }

      toast.success(`Nómina exportada: ${targetRows.length} registros`);
    } catch (error) {
      console.error("Error exportando nómina de personal:", error);
      toast.error("No se pudo exportar la nómina de personal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-3.5 font-semibold text-xs border-border/60 gap-2 cursor-pointer shadow-2xs hover:bg-muted/60 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <IconLoader2 className="size-4 text-muted-foreground animate-spin" />
          ) : (
            <IconCloudDownload className="size-4 text-muted-foreground" />
          )}
          <span className="hidden sm:inline">
            {isLoading ? "Exportando…" : "Exportar Nómina"}
          </span>
          <IconChevronDown className="size-3.5 text-muted-foreground/60 hidden sm:inline" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl p-2 shadow-lg border border-border/50 bg-background"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 py-2">
          Exportar Personal
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => handleExport("xlsx")}
          disabled={isLoading}
          className="rounded-xl m-1 gap-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors py-2"
        >
          <IconFileSpreadsheet className="size-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Excel Profesional</span>
            <span className="text-[10px] text-muted-foreground">
              Formato oficial con estilos
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isLoading}
          className="rounded-xl m-1 gap-2.5 cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors py-2"
        >
          <IconFileTypeCsv className="size-4 text-sky-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold">Archivo CSV (.csv)</span>
            <span className="text-[10px] text-muted-foreground">
              Exportación plana para sistemas
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
