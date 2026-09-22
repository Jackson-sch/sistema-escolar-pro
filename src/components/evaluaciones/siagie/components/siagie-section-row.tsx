"use client";

import {
  IconSearch,
  IconDownload,
  IconLoader2,
  IconFileSpreadsheet,
  IconClock,
  IconChevronDown,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SectionAuditSummary } from "./siagie-audit-types";

interface SiagieSectionRowProps {
  section: SectionAuditSummary;
  onOpenDetail: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  isDownloading: boolean;
  onDownloadAttendanceExcel?: (id: string) => void;
  isDownloadingAttendance?: boolean;
}

const ESTADO_CONFIG: Record<
  string,
  {
    iconBg: string;
    badgeClass: string;
    badgeLabel: string;
    btnVariant: "default" | "outline";
    btnClass: string;
  }
> = {
  LISTO: {
    iconBg: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    badgeClass: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badgeLabel: "Listo ✓",
    btnVariant: "default",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
  OBSERVADO: {
    iconBg: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badgeLabel: "Observado ⚠️",
    btnVariant: "outline",
    btnClass: "border-border/60 hover:bg-muted/40 text-foreground",
  },
};

const DEFAULT_ESTADO = {
  iconBg: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
  badgeClass: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  badgeLabel: "Incompleto ❌",
  btnVariant: "outline" as const,
  btnClass: "border-border/60 hover:bg-muted/40 text-foreground",
};

function SectionProgressMetrics({ section }: { section: SectionAuditSummary }) {
  return (
    <div className="lg:w-1/3 space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground font-medium">
          Llenado de Notas CNEB:
        </span>
        <span className="font-mono font-bold text-foreground">
          {section.porcentajeCompletitud}%
        </span>
      </div>
      <Progress value={section.porcentajeCompletitud} className="h-2 rounded-full" />
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {section.totalNotasRegistradas} de {section.totalNotasEsperadas} notas
        </span>
        {section.notasC_SinConclusion > 0 && (
          <span className="text-amber-600 font-bold">
            ⚠️ {section.notasC_SinConclusion} nota(s) sin conclusión
          </span>
        )}
      </div>
    </div>
  );
}

function SectionActionButtons({
  sectionId,
  isDownloading,
  isDownloadingAttendance = false,
  btnVariant,
  btnClass,
  onOpenDetail,
  onDownloadExcel,
  onDownloadAttendanceExcel,
}: {
  sectionId: string;
  isDownloading: boolean;
  isDownloadingAttendance?: boolean;
  btnVariant: "default" | "outline";
  btnClass: string;
  onOpenDetail: (id: string) => void;
  onDownloadExcel: (id: string) => void;
  onDownloadAttendanceExcel?: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2 shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onOpenDetail(sectionId)}
        className="h-8.5 rounded-xl text-xs font-bold gap-1 border-border/60 hover:bg-muted/40 cursor-pointer"
      >
        <IconSearch size={13} />
        <span>Auditar</span>
      </Button>

      <div className="flex items-center">
        <Button
          variant={btnVariant}
          size="sm"
          onClick={() => onDownloadExcel(sectionId)}
          disabled={isDownloading || isDownloadingAttendance}
          className={cn(
            "h-8.5 rounded-l-xl rounded-r-none text-xs font-bold gap-1.5 cursor-pointer shadow-2xs",
            btnClass,
          )}
        >
          {isDownloading ? (
            <IconLoader2 className="size-3.5 animate-spin" />
          ) : (
            <IconFileSpreadsheet className="size-3.5" />
          )}
          <span>Excel Notas</span>
        </Button>

        {onDownloadAttendanceExcel && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={btnVariant}
                size="sm"
                disabled={isDownloading || isDownloadingAttendance}
                className={cn(
                  "h-8.5 px-2 rounded-l-none rounded-r-xl border-l border-white/20 cursor-pointer",
                  btnClass,
                )}
                title="Más opciones de descarga SIAGIE"
              >
                {isDownloadingAttendance ? (
                  <IconLoader2 className="size-3.5 animate-spin" />
                ) : (
                  <IconChevronDown className="size-3.5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuItem
                onClick={() => onDownloadExcel(sectionId)}
                className="text-xs font-semibold gap-2 cursor-pointer py-1.5"
              >
                <IconFileSpreadsheet className="size-4 text-emerald-600" />
                <span>Notas & Conclusiones</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDownloadAttendanceExcel(sectionId)}
                className="text-xs font-semibold gap-2 cursor-pointer py-1.5"
              >
                <IconClock className="size-4 text-blue-600" />
                <span>Asistencia Oficial</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

export function SiagieSectionRow({
  section: s,
  onOpenDetail,
  onDownloadExcel,
  isDownloading,
  onDownloadAttendanceExcel,
  isDownloadingAttendance = false,
}: SiagieSectionRowProps) {
  const config = ESTADO_CONFIG[s.estado] || DEFAULT_ESTADO;

  return (
    <div className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/10 rounded-xl px-2 transition-colors">
      <div className="flex items-center gap-3.5 min-w-0 lg:w-1/3">
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0",
            config.iconBg,
          )}
        >
          {s.gradoNombre?.[0]}&quot;{s.seccion}&quot;
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm font-extrabold text-foreground truncate">
              {s.nivelNombre} · {s.gradoNombre} &quot;{s.seccion}&quot;
            </p>
            <Badge className={cn("text-[9px] font-bold uppercase", config.badgeClass)}>
              {config.badgeLabel}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
            Tutor: {s.tutorNombre || "No asignado"} · {s.totalEstudiantes} estudiantes
          </p>
        </div>
      </div>

      <SectionProgressMetrics section={s} />

      <SectionActionButtons
        sectionId={s.id}
        isDownloading={isDownloading}
        isDownloadingAttendance={isDownloadingAttendance}
        btnVariant={config.btnVariant}
        btnClass={config.btnClass}
        onOpenDetail={onOpenDetail}
        onDownloadExcel={onDownloadExcel}
        onDownloadAttendanceExcel={onDownloadAttendanceExcel}
      />
    </div>
  );
}
