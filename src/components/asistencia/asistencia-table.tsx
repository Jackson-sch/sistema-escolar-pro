"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  IconUser,
  IconMail,
  IconCheck,
  IconClock,
  IconX,
  IconFileCheck,
  IconNotes,
} from "@tabler/icons-react";
import { SegmentedControl } from "@/components/asistencia/segmented-control";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CitacionModal } from "@/components/comunicaciones/citaciones/citacion-modal";
import { cn } from "@/lib/utils";

interface AsistenciaTableProps {
  data: any[];
  viewMode?: "pad" | "table";
  onEstadoChange: (id: string, estado: string) => void;
  onJustificacionChange: (id: string, justificacion: string) => void;
}

export function AsistenciaTable({
  data,
  viewMode = "pad",
  onEstadoChange,
  onJustificacionChange,
}: AsistenciaTableProps) {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showCitacionModal, setShowCitacionModal] = useState(false);

  const handleOpenCitacion = (alumno: any) => {
    setSelectedStudent(alumno);
    setShowCitacionModal(true);
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card/40 rounded-3xl border border-dashed border-border/60 text-center">
        <IconUser className="size-12 text-muted-foreground/40 mb-3" />
        <p className="text-xs font-bold text-muted-foreground">
          No hay estudiantes que coincidan con la búsqueda o filtro.
        </p>
      </div>
    );
  }

  // ── MODO PAD TÁCTIL (TARJETAS GRANDES DE 1-TOQUE) ──────────────────────────
  if (viewMode === "pad") {
    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {data.map((alumno, index) => {
            const isPresente = alumno.estado === "presente";
            const isTarde = alumno.estado === "tarde" || alumno.estado === "tardanza";
            const isAusente = alumno.estado === "ausente" || alumno.estado === "falta";
            const isJustificado = alumno.estado === "justificado" || alumno.estado === "justificada";

            return (
              <div
                key={alumno.id}
                className={cn(
                  "relative flex flex-col justify-between p-3.5 rounded-2xl border transition-all shadow-xs group",
                  isPresente && "bg-card/95 border-emerald-500/30 hover:border-emerald-500/50",
                  isTarde && "bg-amber-500/5 border-amber-500/40 hover:border-amber-500/60",
                  isAusente && "bg-rose-500/5 border-rose-500/40 hover:border-rose-500/60 shadow-rose-500/5",
                  isJustificado && "bg-sky-500/5 border-sky-500/40 hover:border-sky-500/60"
                )}
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start gap-3">
                  <span className="text-[10px] font-black font-mono text-muted-foreground/60 shrink-0 mt-0.5">
                    #{String(index + 1).padStart(2, "0")}
                  </span>

                  <Avatar className="size-10 border border-border/80 shadow-xs shrink-0">
                    <AvatarImage src={alumno.image || ""} alt={alumno.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                      {alumno.name?.[0]}
                      {alumno.apellidoPaterno?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                      {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {alumno.name}
                    </p>
                  </div>
                </div>

                {/* BOTONES TÁCTILES GRANDES DE 1-TOQUE */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2.5 border-t border-border/40">
                  {/* P (Presente) */}
                  <button
                    type="button"
                    onClick={() => onEstadoChange(alumno.id, "presente")}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none",
                      isPresente
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-[1.03]"
                        : "bg-muted/40 hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-300"
                    )}
                  >
                    <IconCheck size={14} className="mb-0.5" />
                    <span>P</span>
                  </button>

                  {/* T (Tarde) */}
                  <button
                    type="button"
                    onClick={() => onEstadoChange(alumno.id, "tarde")}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none",
                      isTarde
                        ? "bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-[1.03]"
                        : "bg-muted/40 hover:bg-amber-500/15 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300"
                    )}
                  >
                    <IconClock size={14} className="mb-0.5" />
                    <span>T</span>
                  </button>

                  {/* F (Falta) */}
                  <button
                    type="button"
                    onClick={() => onEstadoChange(alumno.id, "ausente")}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none",
                      isAusente
                        ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 scale-[1.03]"
                        : "bg-muted/40 hover:bg-rose-500/15 text-muted-foreground hover:text-rose-700 dark:hover:text-rose-300"
                    )}
                  >
                    <IconX size={14} className="mb-0.5" />
                    <span>F</span>
                  </button>

                  {/* J (Justificado) */}
                  <button
                    type="button"
                    onClick={() => onEstadoChange(alumno.id, "justificado")}
                    className={cn(
                      "flex flex-col items-center justify-center py-2 rounded-xl text-xs font-black transition-all cursor-pointer select-none",
                      isJustificado
                        ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 scale-[1.03]"
                        : "bg-muted/40 hover:bg-sky-500/15 text-muted-foreground hover:text-sky-700 dark:hover:text-sky-300"
                    )}
                  >
                    <IconFileCheck size={14} className="mb-0.5" />
                    <span>J</span>
                  </button>
                </div>

                {/* Observación / Citación (Visible si falta o hay observación) */}
                <div className="flex items-center gap-1.5 mt-2">
                  <Input
                    value={alumno.justificacion}
                    onChange={(e) => onJustificacionChange(alumno.id, e.target.value)}
                    placeholder={isAusente ? "Motivo de falta..." : isTarde ? "Motivo tardanza..." : "Nota rápida..."}
                    className="h-7.5 text-[11px] bg-background/60 border-border/50 rounded-lg px-2"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenCitacion(alumno)}
                        aria-label="Citar apoderado"
                        className="size-7.5 shrink-0 rounded-lg text-muted-foreground/70 hover:text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <IconMail size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">Citar apoderado</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>

        <CitacionModal
          isOpen={showCitacionModal}
          onOpenChange={setShowCitacionModal}
          estudiante={selectedStudent}
        />
      </>
    );
  }

  // ── MODO TABLA COMPACTA (LISTA DENSA PARA DESKTOP) ─────────────────────────
  return (
    <>
      <div className="w-full flex flex-col gap-1.5 rounded-2xl border border-border/60 bg-card p-2 shadow-xs">
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/40">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Estudiante</div>
          <div className="col-span-3 text-center">Estado de Asistencia</div>
          <div className="col-span-4">Observaciones & Acciones</div>
        </div>

        {data.map((alumno, index) => (
          <div
            key={alumno.id}
            className="flex flex-col md:grid md:grid-cols-12 gap-3 items-stretch md:items-center bg-card hover:bg-muted/30 border border-border/30 p-3 md:p-2 rounded-xl transition-colors"
          >
            {/* ID */}
            <div className="flex items-center justify-between md:col-span-1">
              <span className="text-xs font-mono font-bold text-muted-foreground/60">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Estudiante */}
            <div className="md:col-span-4 flex items-center gap-2.5 w-full min-w-0">
              <Avatar className="size-8 border border-border/80 shrink-0">
                <AvatarImage src={alumno.image || ""} alt={alumno.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold uppercase">
                  {alumno.name?.[0]}
                  {alumno.apellidoPaterno?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground truncate">
                  {alumno.apellidoPaterno} {alumno.apellidoMaterno}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {alumno.name}
                </span>
              </div>
            </div>

            {/* Selector de Estado */}
            <div className="md:col-span-3 flex justify-center w-full md:w-auto">
              <SegmentedControl
                value={alumno.estado}
                onChange={(v) => onEstadoChange(alumno.id, v)}
              />
            </div>

            {/* Observaciones */}
            <div className="md:col-span-4 w-full flex items-center gap-2">
              <Input
                value={alumno.justificacion}
                onChange={(e) => onJustificacionChange(alumno.id, e.target.value)}
                placeholder="Observación o motivo..."
                className="h-8 text-xs bg-background border-border/50 rounded-lg px-2.5"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenCitacion(alumno)}
                    aria-label="Citar apoderado"
                    className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <IconMail size={14} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Citar apoderado</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      <CitacionModal
        isOpen={showCitacionModal}
        onOpenChange={setShowCitacionModal}
        estudiante={selectedStudent}
      />
    </>
  );
}
