"use client";

import {
  IconTrash,
  IconPencil,
  IconAlertTriangle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";

function getNivelColor(nombre?: string) {
  if (!nombre)
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  if (nombre.includes("Inicial"))
    return "bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800";
  if (nombre.includes("Primaria"))
    return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
  if (nombre.includes("Secundaria"))
    return "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800";
  return "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
}

function getNivelDot(nombre?: string) {
  if (!nombre) return "bg-slate-400";
  if (nombre.includes("Inicial")) return "bg-teal-400";
  if (nombre.includes("Primaria")) return "bg-blue-400";
  if (nombre.includes("Secundaria")) return "bg-violet-400";
  return "bg-slate-400";
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  return { h, m };
}

interface PoliticaCardProps {
  p: any;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
}

function PoliticaStatusBadge({ activo }: { activo: boolean }) {
  return (
    <div
      className={cn(
        "shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1",
        activo
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
          : "bg-muted text-muted-foreground border border-border",
      )}
    >
      {activo ? <IconCheck className="size-2.5" /> : <IconX className="size-2.5" />}
      {activo ? "Activo" : "Inactivo"}
    </div>
  );
}

function PoliticaToleranceSection({ tolerancia }: { tolerancia: number }) {
  const isZero = tolerancia === 0;
  const isLow = tolerancia <= 5;

  const containerClass = isZero
    ? "bg-muted/40 border border-border/50"
    : isLow
      ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
      : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800";

  const iconClass = isZero
    ? "text-muted-foreground"
    : isLow
      ? "text-amber-500"
      : "text-red-500";

  const valueClass = isLow
    ? "text-amber-600 dark:text-amber-400"
    : "text-red-600 dark:text-red-400";

  return (
    <div className="px-5 py-3 border-t border-border/50">
      <div className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5", containerClass)}>
        <IconAlertTriangle className={cn("size-4 shrink-0", iconClass)} />
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
            Tolerancia
          </p>
          <p className="text-base font-black leading-none text-foreground">
            {isZero ? (
              <span className="text-muted-foreground text-sm">Sin margen</span>
            ) : (
              <>
                <span className={valueClass}>+{tolerancia}</span>{" "}
                <span className="text-sm font-semibold text-muted-foreground">min</span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PoliticaCard({ p, onEdit, onDelete }: PoliticaCardProps) {
  const entry = formatTime(p.horaEntrada);
  const exit = p.horaSalida ? formatTime(p.horaSalida) : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-[border-color,box-shadow,opacity,filter,padding,gap] duration-300",
        "hover:border-border hover:shadow-sm",
        p.activo
          ? "border-border/60"
          : "border-border/30 opacity-55 grayscale-40",
      )}
    >
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-[13px] text-foreground leading-tight truncate">
            {p.nombre}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md px-2 py-0.5",
                getNivelColor(p.nivel?.nombre),
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  getNivelDot(p.nivel?.nombre),
                )}
              />
              {p.nivel?.nombre ?? "General"}
            </span>
            {p.turno && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5 border border-border/50">
                {p.turno}
              </span>
            )}
          </div>
        </div>

        <PoliticaStatusBadge activo={p.activo} />
      </div>

      {/* Time Display */}
      <div className="px-5 py-3 border-t border-border/50 grid grid-cols-2 gap-3">
        {/* Entry */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            Ingreso
          </span>
          <div className="flex items-baseline gap-0.5">
            <span className="text-3xl font-black tabular-nums leading-none text-foreground">
              {entry.h}
            </span>
            <span className="text-lg font-black text-muted-foreground leading-none mb-0.5">
              :{entry.m}
            </span>
          </div>
        </div>

        {/* Exit */}
        {exit && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              Salida
            </span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black tabular-nums leading-none text-foreground">
                {exit.h}
              </span>
              <span className="text-lg font-black text-muted-foreground leading-none mb-0.5">
                :{exit.m}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tolerance */}
      <PoliticaToleranceSection tolerancia={p.tolerancia} />

      {/* Footer */}
      <div className="mt-auto px-5 py-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {formatDate(p.updatedAt || p.createdAt, "dd MMM")}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDelete(p.id)}
            aria-label="Eliminar política"
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-[color,background-color,opacity] hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <IconTrash className="size-3.5" />
          </button>

          <button
            onClick={() => onEdit(p)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-[11px] font-bold uppercase tracking-wide transition-[opacity,transform] hover:opacity-80 active:scale-95 cursor-pointer"
          >
            <IconPencil className="size-3" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
