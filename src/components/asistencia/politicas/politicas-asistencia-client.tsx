"use client";

import { useState, useEffect, useReducer } from "react";
import {
  IconPlus,
  IconTrash,
  IconClock,
  IconPencil,
  IconAlertTriangle,
  IconSettings,
  IconSchool,
  IconCheck,
  IconX,
  IconChevronRight,
} from "@tabler/icons-react";
import { toast } from "sonner";
import {
  getPoliticasAsistenciaAction,
  savePoliticaAsistenciaAction,
  deletePoliticaAsistenciaAction,
} from "@/actions/attendance-policy";
import { getNivelesAction } from "@/actions/academic-structure";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormModal } from "@/components/modals/form-modal";
import { PoliticaFormFields } from "./politica-form-fields";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { formatDate } from "@/lib/formats";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getNivelColor(nombre?: string) {
  if (!nombre) return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
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

// ─── Stat Pill ───────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-5 py-2.5 rounded-xl bg-muted/40 border border-border/50 min-w-[80px]">
      <span className={cn("text-xl font-black tabular-nums leading-none", accent ?? "text-foreground")}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
        {label}
      </span>
    </div>
  );
}

// ─── Policy Card ─────────────────────────────────────────────────────────────

function PoliticaCard({
  p,
  onEdit,
  onDelete,
}: {
  p: any;
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
}) {
  const entry = formatTime(p.horaEntrada);
  const exit = p.horaSalida ? formatTime(p.horaSalida) : null;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-[border-color,box-shadow,opacity,filter,padding,gap] duration-300",
        "hover:border-border hover:shadow-sm",
        p.activo
          ? "border-border/60"
          : "border-border/30 opacity-55 grayscale-40"
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
                getNivelColor(p.nivel?.nombre)
              )}
            >
              <span className={cn("size-1.5 rounded-full", getNivelDot(p.nivel?.nombre))} />
              {p.nivel?.nombre ?? "General"}
            </span>
            {p.turno && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5 border border-border/50">
                {p.turno}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <div
          className={cn(
            "shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1",
            p.activo
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
              : "bg-muted text-muted-foreground border border-border"
          )}
        >
          {p.activo ? (
            <IconCheck className="size-2.5" />
          ) : (
            <IconX className="size-2.5" />
          )}
          {p.activo ? "Activo" : "Inactivo"}
        </div>
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
      <div className="px-5 py-3 border-t border-border/50">
        <div
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5",
            p.tolerancia === 0
              ? "bg-muted/40 border border-border/50"
              : p.tolerancia <= 5
              ? "bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800"
              : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
          )}
        >
          <IconAlertTriangle
            className={cn(
              "size-4 shrink-0",
              p.tolerancia === 0
                ? "text-muted-foreground"
                : p.tolerancia <= 5
                ? "text-amber-500"
                : "text-red-500"
            )}
          />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Tolerancia
            </p>
            <p className="text-base font-black leading-none text-foreground">
              {p.tolerancia === 0 ? (
                <span className="text-muted-foreground text-sm">Sin margen</span>
              ) : (
                <>
                  <span
                    className={cn(
                      p.tolerancia <= 5 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                    )}
                  >
                    +{p.tolerancia}
                  </span>{" "}
                  <span className="text-sm font-semibold text-muted-foreground">min</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-3 border-t border-border/50 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          {formatDate(p.updatedAt || p.createdAt, "dd MMM")}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDelete(p.id)}
            aria-label="Eliminar política"
            className="size-8 rounded-lg flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-[color,background-color,opacity] hover:bg-destructive/10 hover:text-destructive"
          >
            <IconTrash className="size-3.5" />
          </button>

          <button
            onClick={() => onEdit(p)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-foreground text-background text-[11px] font-bold uppercase tracking-wide transition-[opacity,transform] hover:opacity-80 active:scale-95"
          >
            <IconPencil className="size-3" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Política Form Reducer ────────────────────────────────────────────────────
// El formulario del diálogo actualiza muchos campos juntos (al abrir en modo
// nuevo o edición), por eso se agrupan en un solo reducer.

interface PoliticaFormState {
  editingPolitica: any;
  nombre: string;
  nivelId: string;
  turno: string;
  horaEntrada: string;
  horaSalida: string;
  tolerancia: number;
  activo: boolean;
}

type PoliticaFormAction =
  | { type: "PATCH"; patch: Partial<PoliticaFormState> }
  | { type: "OPEN_NEW" }
  | { type: "OPEN_EDIT"; politica: any };

const politicaFormInitialState: PoliticaFormState = {
  editingPolitica: null,
  nombre: "",
  nivelId: "all",
  turno: "all",
  horaEntrada: "08:00",
  horaSalida: "13:00",
  tolerancia: 0,
  activo: true,
};

function politicaFormReducer(
  state: PoliticaFormState,
  action: PoliticaFormAction,
): PoliticaFormState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.patch };
    case "OPEN_NEW":
      return { ...politicaFormInitialState };
    case "OPEN_EDIT":
      return {
        editingPolitica: action.politica,
        nombre: action.politica.nombre,
        nivelId: action.politica.nivelId || "all",
        turno: action.politica.turno || "all",
        horaEntrada: action.politica.horaEntrada,
        horaSalida: action.politica.horaSalida,
        tolerancia: action.politica.tolerancia,
        activo: action.politica.activo,
      };
    default:
      return state;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PoliticasAsistenciaClient({
  anioAcademico = 2026,
}: {
  anioAcademico?: number;
}) {
  const [politicas, setPoliticas] = useState<any[]>([]);
  const [niveles, setNiveles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estado del formulario agrupado en un reducer.
  const [formState, dispatch] = useReducer(politicaFormReducer, undefined, () => ({
    ...politicaFormInitialState,
  }));

  const {
    editingPolitica,
    nombre,
    nivelId,
    turno,
    horaEntrada,
    horaSalida,
    tolerancia,
    activo,
  } = formState;

  const [ConfirmDialog, confirm] = useConfirm(
    "¿Está seguro?",
    "Esta acción no se puede deshacer.",
  );

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [politicasRes, nivelesRes] = await Promise.all([
        getPoliticasAsistenciaAction(),
        getNivelesAction(),
      ]);
      if (politicasRes.data) setPoliticas(politicasRes.data);
      if (nivelesRes.data) setNiveles(nivelesRes.data);
    } catch {
      toast.error("Error al cargar datos");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenDialog = (politica?: any) => {
    dispatch(politica ? { type: "OPEN_EDIT", politica } : { type: "OPEN_NEW" });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!nombre || !horaEntrada || !horaSalida) {
      toast.error("Por favor complete los campos obligatorios");
      return;
    }
    setIsSaving(true);
    try {
      const res = await savePoliticaAsistenciaAction({
        id: editingPolitica?.id,
        nombre,
        nivelId: nivelId === "all" ? null : nivelId,
        turno: turno === "all" ? null : (turno as any),
        horaEntrada,
        horaSalida,
        tolerancia,
        activo,
      });
      if (res.success) {
        toast.success("Política guardada con éxito");
        setIsDialogOpen(false);
        loadData();
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;
    try {
      const res = await deletePoliticaAsistenciaAction(id);
      if (res.success) {
        toast.success("Política eliminada");
        loadData();
      } else {
        toast.error(res.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error de conexión");
    }
  };

  const activasCount = politicas.filter((p) => p.activo).length;
  const toleranciaPromedio =
    politicas.length > 0
      ? Math.round(politicas.reduce((a, p) => a + p.tolerancia, 0) / politicas.length)
      : 0;

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-2">
            <IconSchool className="size-3.5" />
            <span>Ciclo Lectivo {anioAcademico}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            Reglas de Ingreso
          </h1>
          <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
            Horarios y tolerancias por nivel educativo para el ciclo {anioAcademico}.
          </p>
        </div>

        <div className="flex items-end gap-3">
          {/* Stats */}
          {!isLoading && politicas.length > 0 && (
            <div className="flex items-center gap-2">
              <StatPill label="Total" value={politicas.length} />
              <StatPill
                label="Activas"
                value={activasCount}
                accent="text-emerald-600 dark:text-emerald-400"
              />
              <StatPill
                label="Tolerancia"
                value={`${toleranciaPromedio}m`}
                accent="text-amber-600 dark:text-amber-400"
              />
            </div>
          )}

          <Button
            onClick={() => handleOpenDialog()}
            className="h-10 px-4 rounded-xl font-bold text-sm gap-2 shrink-0"
          >
            <IconPlus className="size-4" />
            Nueva Regla
          </Button>
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-muted-foreground">
          <div className="relative size-12">
            <IconClock className="size-12 opacity-10" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500/40" />
          </div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-50">
            Cargando políticas…
          </p>
        </div>
      ) : politicas.length === 0 ? (
        /* ── Empty State ── */
        <div className="flex flex-col items-center justify-center py-24 gap-6 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
          <div className="size-16 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/50">
            <IconClock className="size-7 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-bold text-foreground">Sin reglas configuradas</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primera política de ingreso para este ciclo.
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            variant="outline"
            className="gap-2 rounded-xl font-semibold"
          >
            <IconPlus className="size-4" />
            Agregar primera regla
          </Button>
        </div>
      ) : (
        /* ── Grid ── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {politicas.map((p) => (
            <PoliticaCard
              key={p.id}
              p={p}
              onEdit={handleOpenDialog}
              onDelete={handleDelete}
            />
          ))}

          {/* Add card */}
          <button
            onClick={() => handleOpenDialog()}
            className={cn(
              "group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/30 min-h-[260px]",
              "hover:border-foreground/20 hover:bg-muted/20 transition-[background-color,border-color] duration-300"
            )}
          >
            <div className="size-10 rounded-xl bg-muted/40 flex items-center justify-center border border-border/40 group-hover:bg-muted/80 group-hover:scale-110 transition-[background-color,transform]">
              <IconPlus className="size-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
              Nueva Regla
            </span>
          </button>
        </div>
      )}

      {/* ── Modal ── */}
      <FormModal
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingPolitica ? "Editar Política" : "Nueva Política"}
        description="Defina las reglas de horario para este grupo."
        className="sm:w-md"
      >
        <PoliticaFormFields
          nombre={nombre}
          setNombre={(v) => dispatch({ type: "PATCH", patch: { nombre: v } })}
          nivelId={nivelId}
          setNivelId={(v) =>
            dispatch({ type: "PATCH", patch: { nivelId: v } })
          }
          niveles={niveles}
          turno={turno}
          setTurno={(v) => dispatch({ type: "PATCH", patch: { turno: v } })}
          horaEntrada={horaEntrada}
          setHoraEntrada={(v) =>
            dispatch({ type: "PATCH", patch: { horaEntrada: v } })
          }
          horaSalida={horaSalida}
          setHoraSalida={(v) =>
            dispatch({ type: "PATCH", patch: { horaSalida: v } })
          }
          tolerancia={tolerancia}
          setTolerancia={(v) =>
            dispatch({ type: "PATCH", patch: { tolerancia: v } })
          }
          activo={activo}
          setActivo={(v) => dispatch({ type: "PATCH", patch: { activo: v } })}
        />

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => setIsDialogOpen(false)}
            disabled={isSaving}
            className="rounded-xl"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl min-w-[120px]"
          >
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      </FormModal>

      <ConfirmDialog />
    </div>
  );
}