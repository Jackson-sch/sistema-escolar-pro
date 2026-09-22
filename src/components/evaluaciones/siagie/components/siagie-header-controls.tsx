"use client";

import {
  IconRefresh,
  IconFileSpreadsheet,
  IconClock,
  IconChevronDown,
  IconLoader2,
  IconHelpCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface SiagieHeaderControlsProps {
  periodos: Array<{ id: string; nombre: string; activo: boolean; anioEscolar?: number }>;
  selectedPeriodoId: string;
  onPeriodoChange: (id: string) => void;
  nivelesUnicos: string[];
  selectedNivel: string;
  onNivelChange: (nivel: string) => void;
  seccionesUnicas: string[];
  selectedSeccion: string;
  onSeccionChange: (seccion: string) => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  onBulkDownloadNotas?: () => void;
  onBulkDownloadAsistencia?: () => void;
  isBulkDownloading?: boolean;
  onOpenGuide?: () => void;
}

export function SiagieHeaderControls({
  periodos,
  selectedPeriodoId,
  onPeriodoChange,
  nivelesUnicos,
  selectedNivel,
  onNivelChange,
  seccionesUnicas,
  selectedSeccion,
  onSeccionChange,
  isRefreshing,
  onRefresh,
  onBulkDownloadNotas,
  onBulkDownloadAsistencia,
  isBulkDownloading = false,
  onOpenGuide,
}: SiagieHeaderControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60 shadow-xs">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Periodo de Evaluación:
          </span>
          <Select
            value={selectedPeriodoId}
            onValueChange={onPeriodoChange}
          >
            <SelectTrigger className="w-56 h-9 rounded-xl font-bold text-xs bg-background border-border/60">
              <SelectValue placeholder="Seleccionar Periodo" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {periodos.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="text-xs font-semibold"
                >
                  {p.nombre} {p.anioEscolar ? `(${p.anioEscolar})` : ""} {p.activo && "• Activo"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pastillas de Niveles */}
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Nivel Educativo:
          </span>
          <div className="flex items-center gap-1 p-0.5 bg-muted/40 rounded-xl border border-border/50 h-9">
            <button
              type="button"
              onClick={() => onNivelChange("TODOS")}
              className={cn(
                "px-3 h-8 text-xs font-bold rounded-lg transition-all cursor-pointer",
                selectedNivel === "TODOS"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Todos
            </button>
            {nivelesUnicos.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onNivelChange(n)}
                className={cn(
                  "px-3 h-8 text-xs font-bold rounded-lg transition-all cursor-pointer",
                  selectedNivel === n
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Selector de Sección */}
        {seccionesUnicas.length > 0 && (
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Sección:
            </span>
            <Select value={selectedSeccion} onValueChange={onSeccionChange}>
              <SelectTrigger className="w-32 h-9 rounded-xl font-bold text-xs bg-background border-border/60">
                <SelectValue placeholder="Sección" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="TODAS" className="text-xs font-semibold">
                  Todas
                </SelectItem>
                {seccionesUnicas.map((sec) => (
                  <SelectItem key={sec} value={sec} className="text-xs font-semibold">
                    Sección "{sec}"
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="default"
              size="sm"
              disabled={isBulkDownloading}
              className="rounded-xl h-9 text-xs font-bold gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              {isBulkDownloading ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconFileSpreadsheet className="size-4" />
              )}
              <span>Descarga Masiva SIAGIE</span>
              <IconChevronDown className="size-3.5 opacity-80 ml-0.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 rounded-xl">
            <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Formatos Multi-Aula (Excel)
            </DropdownMenuLabel>
            <DropdownMenuItem
              onClick={onBulkDownloadNotas}
              className="text-xs font-semibold gap-2 cursor-pointer py-2"
            >
              <IconFileSpreadsheet className="size-4 text-emerald-600" />
              <div className="flex flex-col">
                <span>Libro Oficial de Calificaciones</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Todas las aulas en pestañas + Conclusiones CNEB
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onBulkDownloadAsistencia}
              className="text-xs font-semibold gap-2 cursor-pointer py-2"
            >
              <IconClock className="size-4 text-blue-600" />
              <div className="flex flex-col">
                <span>Consolidado Oficial de Asistencia</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Días asistidos, tardanzas y faltas justificadas
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-xl h-9 text-xs font-bold gap-1.5 border-border/60 cursor-pointer"
        >
          <IconRefresh
            className={cn("size-3.5", isRefreshing && "animate-spin text-primary")}
          />
          <span>Actualizar</span>
        </Button>

        {onOpenGuide && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenGuide}
            className="rounded-xl h-9 text-xs font-bold gap-1.5 border-border/60 cursor-pointer bg-card hover:bg-accent text-foreground shadow-2xs"
          >
            <IconHelpCircle className="size-4 text-primary" />
            <span className="hidden sm:inline">¿Cómo funciona?</span>
            <span className="sm:hidden">Guía</span>
          </Button>
        )}
      </div>
    </div>
  );
}
