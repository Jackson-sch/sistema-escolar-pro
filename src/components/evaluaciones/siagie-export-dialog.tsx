"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconFileSpreadsheet,
  IconDownload,
  IconLoader2,
  IconSchool,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getSiagieExportDataAction } from "@/actions/siagie";
import { getSiagieAttendanceExportDataAction } from "@/actions/siagie-attendance";
import { downloadBase64Excel } from "@/lib/excel";
import { cn } from "@/lib/utils";

interface SiagieExportDialogProps {
  periodos: Array<{ id: string; nombre: string; anioEscolar: number }>;
  secciones?: Array<{
    id: string;
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
  }>;
}

export function SiagieExportDialog({
  periodos,
  secciones = [],
}: SiagieExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("");
  const [selectedSeccion, setSelectedSeccion] = useState<string>("");
  const [tipoPlantilla, setTipoPlantilla] = useState<"notas" | "asistencia">("notas");

  const handleExport = async () => {
    if (!selectedPeriodo || !selectedSeccion) {
      toast.error("Por favor selecciona el periodo y la sección");
      return;
    }

    setLoading(true);
    try {
      const res =
        tipoPlantilla === "notas"
          ? await getSiagieExportDataAction({
              periodoId: selectedPeriodo,
              nivelAcademicoId: selectedSeccion,
            })
          : await getSiagieAttendanceExportDataAction({
              periodoId: selectedPeriodo,
              nivelAcademicoId: selectedSeccion,
            });

      if (res.error || !res.base64) {
        toast.error(res.error || "No se pudo generar la exportación");
        return;
      }

      downloadBase64Excel(
        res.base64,
        res.fileName || (tipoPlantilla === "notas" ? "SIAGIE_Notas.xlsx" : "SIAGIE_Asistencia.xlsx"),
      );

      toast.success(
        tipoPlantilla === "notas"
          ? "Plantilla SIAGIE de notas descargada correctamente"
          : "Plantilla SIAGIE de asistencia descargada correctamente",
        { description: res.fileName },
      );
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al procesar la descarga");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2 rounded-xl text-xs font-semibold border-border/80 hover:bg-emerald-500/10 hover:text-emerald-700 hover:border-emerald-500/30 transition-[background-color,border-color,color]"
        >
          <IconFileSpreadsheet className="size-4 text-emerald-600" />
          <span>Exportar SIAGIE</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <IconSchool className="size-4" />
            Normativa MINEDU / CNEB
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Exportar Registro SIAGIE
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Genera el archivo Excel oficial con las columnas y formato exacto
            para la carga masiva en la plataforma SIAGIE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          {/* Selector de Tipo de Plantilla */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Tipo de Plantilla Oficial</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTipoPlantilla("notas")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all text-center gap-1.5 cursor-pointer",
                  tipoPlantilla === "notas"
                    ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20"
                    : "border-border/60 hover:bg-muted/30 text-muted-foreground",
                )}
              >
                <IconFileSpreadsheet className="size-5" />
                <span>Notas & Conclusiones</span>
              </button>

              <button
                type="button"
                onClick={() => setTipoPlantilla("asistencia")}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all text-center gap-1.5 cursor-pointer",
                  tipoPlantilla === "asistencia"
                    ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 ring-2 ring-blue-500/20"
                    : "border-border/60 hover:bg-muted/30 text-muted-foreground",
                )}
              >
                <IconClock className="size-5" />
                <span>Asistencia Consolidada</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Periodo Académico</Label>
            <Select
              value={selectedPeriodo}
              onValueChange={setSelectedPeriodo}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Selecciona un periodo..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.nombre} ({p.anioEscolar})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Grado y Sección</Label>
            <Select
              value={selectedSeccion}
              onValueChange={setSelectedSeccion}
            >
              <SelectTrigger className="h-9 rounded-xl text-xs">
                <SelectValue placeholder="Selecciona una sección..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-56">
                {secciones.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.nivel.nombre} - {s.grado.nombre} &ldquo;{s.seccion}&rdquo;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Enlace a Consola de Auditoría Institucional */}
          <div className="pt-2 border-t border-border/40 text-center">
            <Link
              href="/gestion/academico/siagie"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>Abrir Consola de Auditoría y Descarga Masiva Multi-Aula</span>
              <IconExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            disabled={loading || !selectedPeriodo || !selectedSeccion}
            className="rounded-xl text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {loading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconDownload className="size-4" />
            )}
            Descargar Excel SIAGIE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
