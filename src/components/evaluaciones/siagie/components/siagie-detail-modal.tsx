"use client";

import {
  IconSchool,
  IconLoader2,
  IconAlertCircle,
  IconDownload,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SectionAuditDetail } from "./siagie-audit-types";

interface SiagieDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  sectionDetail: SectionAuditDetail | null;
  activeSectionId: string | null;
  onDownloadExcel: (id: string) => void;
  isDownloading: boolean;
}

export function SiagieDetailModal({
  open,
  onOpenChange,
  isLoading,
  sectionDetail,
  activeSectionId,
  onDownloadExcel,
  isDownloading,
}: SiagieDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] rounded-2xl p-6 bg-card border-border/60 flex flex-col">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-extrabold flex items-center gap-2 text-foreground">
            <IconSchool className="size-5 text-primary" />
            Auditoría:{" "}
            {sectionDetail
              ? `${sectionDetail.seccion.nivel} · ${sectionDetail.seccion.grado} "${sectionDetail.seccion.seccion}"`
              : "Cargando..."}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Periodo: {sectionDetail?.periodo.nombre} · Tutor:{" "}
            {sectionDetail?.seccion.tutor || "No asignado"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-12 gap-3 text-muted-foreground">
            <IconLoader2 className="size-6 animate-spin text-primary" />
            <span className="text-xs font-semibold">
              Auditando notas y competencias...
            </span>
          </div>
        ) : sectionDetail ? (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Resumen Semáforo */}
            <div className="p-3.5 rounded-xl bg-muted/20 border border-border/40 flex items-center justify-between text-xs">
              <div>
                <span className="text-muted-foreground font-medium">
                  Estado del Aula:{" "}
                </span>
                <Badge
                  className={cn(
                    "text-[10px] font-bold uppercase ml-1",
                    sectionDetail.resumen.estado === "LISTO" &&
                      "bg-emerald-500/10 text-emerald-600",
                    sectionDetail.resumen.estado === "OBSERVADO" &&
                      "bg-amber-500/10 text-amber-600",
                    sectionDetail.resumen.estado === "INCOMPLETO" &&
                      "bg-rose-500/10 text-rose-600",
                  )}
                >
                  {sectionDetail.resumen.estado}
                </Badge>
              </div>
              <div className="font-mono font-bold">
                Completitud: {sectionDetail.resumen.porcentajeCompletitud}%
              </div>
            </div>

            {/* Lista de Inconsistencias si existen */}
            {sectionDetail.inconsistencias.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <IconAlertCircle className="size-4 text-amber-500" />
                  Inconsistencias Detectadas (
                  {sectionDetail.inconsistencias.length})
                </h4>
                <div className="divide-y divide-border/30 border border-border/40 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                  {sectionDetail.inconsistencias.map((inc) => (
                    <div
                      key={inc.id}
                      className="p-2.5 text-xs flex items-start justify-between gap-3 hover:bg-muted/10"
                    >
                      <div>
                        <p className="font-bold text-foreground">
                          {inc.estudianteNombre}{" "}
                          <span className="font-normal text-muted-foreground">
                            ({inc.cursoNombre})
                          </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {inc.descripcion}
                        </p>
                        {inc.profesorNombre && (
                          <p className="text-[10px] text-primary/80 font-medium mt-0.5">
                            Docente responsable: {inc.profesorNombre}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold uppercase shrink-0",
                          inc.gravedad === "ALTA"
                            ? "border-rose-500 text-rose-600"
                            : "border-amber-500 text-amber-600",
                        )}
                      >
                        {inc.gravedad}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  ✓ Sin inconsistencias pedagógicas
                </p>
                <p className="text-[11px] text-emerald-600/80">
                  Todas las notas y conclusiones descriptivas cumplen las normas
                  del MINEDU.
                </p>
              </div>
            )}

            {/* Desglose por Cursos */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foreground">
                Avance por Área Curricular
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sectionDetail.cursos.map((c) => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl border border-border/40 bg-card text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="truncate">{c.nombre}</span>
                      <span className="font-mono">
                        {c.porcentajeLlenado}%
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Docente: {c.profesor} · {c.evaluacionesCount} evaluac.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer con Botón de Descarga */}
        <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs font-bold h-9 cursor-pointer"
          >
            Cerrar
          </Button>

          {activeSectionId && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onDownloadExcel(activeSectionId)}
              disabled={isDownloading}
              className="rounded-xl text-xs font-bold h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              {isDownloading ? (
                <IconLoader2 className="size-3.5 animate-spin" />
              ) : (
                <IconDownload className="size-3.5" />
              )}
              <span>Descargar Excel SIAGIE</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
