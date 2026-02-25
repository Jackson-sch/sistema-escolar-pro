"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useQueryState, parseAsString } from "nuqs";
import { toast } from "sonner";
import {
  IconBabyCarriage,
  IconSchool,
  IconCertificate,
  IconBook,
  IconEdit,
  IconTrash,
  IconPlus,
  IconUsers,
  IconSunHigh,
  IconMoon,
  IconMapPin,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MagicCard } from "@/components/ui/magic-card";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { FormModal } from "@/components/modals/form-modal";
import { SeccionForm } from "./seccion-form";
import { deleteSeccionAction } from "@/actions/academic-structure";
import type { SeccionTableType } from "./seccion-table";
import { Button } from "@/components/ui/button";

// ── Nivel icon mapping ──
const NIVEL_ICON_MAP: Record<string, React.ElementType> = {
  INICIAL: IconBabyCarriage,
  PRIMARIA: IconSchool,
  SECUNDARIA: IconCertificate,
};

// ── Default color per nivel (when section has no custom color) ──
const NIVEL_COLOR_MAP: Record<string, string> = {
  INICIAL: "#F59E0B",
  PRIMARIA: "#3B82F6",
  SECUNDARIA: "#10B981",
};

// ── Turno styling ──
const TURNO_MAP: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  MANANA: {
    label: "Mañana",
    icon: IconSunHigh,
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  TARDE: {
    label: "Tarde",
    icon: IconMoon,
    className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
  NOCHE: {
    label: "Noche",
    icon: IconMoon,
    className: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  },
};

// ── Circular Progress Ring ──
function CircularProgress({
  percentage,
  size = 44,
  strokeWidth = 3.5,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isFull = percentage >= 100;
  const isHigh = percentage >= 80;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            "transition-all duration-700 ease-out",
            isFull
              ? "stroke-emerald-500 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]"
              : isHigh
                ? "stroke-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]"
                : "stroke-primary drop-shadow-[0_0_4px_rgba(var(--primary),0.4)]",
          )}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-[10px] font-bold",
          isFull
            ? "text-emerald-400"
            : isHigh
              ? "text-amber-400"
              : "text-foreground",
        )}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  );
}

// ── Section Card ──
interface SeccionCardProps {
  seccion: SeccionTableType;
  onEdit: (s: SeccionTableType) => void;
  onDelete: (s: SeccionTableType) => void;
  index: number;
}

function SeccionCard({ seccion, onEdit, onDelete, index }: SeccionCardProps) {
  const NivelIcon =
    NIVEL_ICON_MAP[seccion.nivel.nombre.toUpperCase()] || IconBook;
  const turno = TURNO_MAP[seccion.turno] || TURNO_MAP.MANANA;
  const TurnoIcon = turno.icon;
  const accentColor = (seccion as any).color || null;
  const nivelColor =
    NIVEL_COLOR_MAP[seccion.nivel.nombre.toUpperCase()] || "#3B82F6";
  const resolvedColor = accentColor || nivelColor;

  const enrolled = seccion._count?.matriculas || 0;
  const capacity = seccion.capacidad || 1;
  const percentage = Math.min((enrolled / capacity) * 100, 100);

  const tutorName = seccion.tutor
    ? `${seccion.tutor.name} ${seccion.tutor.apellidoPaterno}`
    : null;
  const tutorInitials = seccion.tutor
    ? `${seccion.tutor.name[0]}${(seccion.tutor.apellidoPaterno || "")[0]}`
    : "";

  // Use the section's color (or nivel default) for the animated border gradient
  const gradientFrom = resolvedColor;
  const gradientTo = `${resolvedColor}`;

  return (
    <MagicCard
      className={cn(
        "rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-3",
      )}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      gradientColor={resolvedColor}
      gradientOpacity={0.1}
      gradientSize={200}
      style={{
        animationDelay: `${index * 60}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="group relative p-5">
        {/* Top row: nivel icon + turno badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="size-10 rounded-xl flex items-center justify-center"
            style={{
              backgroundColor: `${resolvedColor}20`,
            }}
          >
            <NivelIcon className="size-5" style={{ color: resolvedColor }} />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full border flex items-center gap-1",
              turno.className,
            )}
          >
            <TurnoIcon className="size-3" />
            {turno.label}
          </Badge>
        </div>

        {/* Grade name + section */}
        <div className="mb-4">
          <h3 className="text-base font-bold text-foreground leading-tight">
            {seccion.grado.nombre}{" "}
            <span className="text-primary">&quot;{seccion.seccion}&quot;</span>
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5 uppercase tracking-wide">
            {seccion.nivel.nombre} · {seccion.anioAcademico}
          </p>
          {seccion.sede && (
            <div className="flex items-center gap-1 mt-1.5">
              <IconMapPin className="size-3 text-muted-foreground/50" />
              <span className="text-[10px] text-muted-foreground/70 font-medium">
                {seccion.sede.nombre}
              </span>
            </div>
          )}
        </div>

        {/* Tutor row */}
        <div className="flex items-center gap-2.5 mb-5 min-h-[36px]">
          {tutorName ? (
            <>
              <Avatar className="size-7 border border-border/50">
                <AvatarFallback className="bg-muted text-foreground text-[9px] font-semibold uppercase">
                  {tutorInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
                  Tutor de Aula
                </span>
                <span className="text-xs font-medium text-foreground capitalize leading-tight">
                  {tutorName}
                </span>
              </div>
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/50 italic">
              Sin tutor asignado
            </span>
          )}
        </div>

        {/* Bottom: Enrolled count + Circular progress */}
        <div className="flex items-end justify-between pt-3 border-t border-border/20">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black text-foreground">
                {enrolled}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                /{capacity}
              </span>
            </div>
            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-semibold">
              Alumnos Matriculados
            </span>
          </div>
          <CircularProgress percentage={percentage} />
        </div>

        {/* Hover actions */}
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(seccion)}
            className="rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
          >
            <IconEdit className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onDelete(seccion)}
            className="rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      </div>
    </MagicCard>
  );
}

// ── Create New Section Card ──
function CreateSectionCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl border-2 border-dashed border-border/30 hover:border-primary/40 p-5 transition-all duration-300 hover:scale-[1.02] hover:bg-primary/5 flex flex-col items-center justify-center min-h-[240px] cursor-pointer"
    >
      <div className="size-12 rounded-full bg-muted/30 group-hover:bg-primary/10 flex items-center justify-center transition-colors duration-300 mb-3">
        <IconPlus className="size-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
      </div>
      <span className="text-sm font-bold text-primary">
        Crear Nueva Sección
      </span>
      <span className="text-[11px] text-muted-foreground/60 mt-0.5">
        Agregar grados, niveles o turnos
      </span>
    </button>
  );
}

// ── Main Grid Component ──
interface SeccionGridProps {
  data: SeccionTableType[];
  meta: {
    grados: any[];
    tutores: any[];
    sedes: any[];
    institucionId: string;
  };
  currentAnio?: number;
}

export function SeccionGrid({ data, meta, currentAnio }: SeccionGridProps) {
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSeccion, setSelectedSeccion] =
    useState<SeccionTableType | null>(null);
  const [isDeleting, startTransition] = useTransition();

  // Filters via nuqs (shared with table)
  const [nivelFilter, setNivelFilter] = useQueryState(
    "nivel",
    parseAsString.withDefault("ALL"),
  );
  const [turnoFilter, setTurnoFilter] = useQueryState(
    "turno",
    parseAsString.withDefault("ALL"),
  );

  // Derive unique niveles from data
  const niveles = useMemo(
    () => Array.from(new Set(data.map((s) => s.nivel.nombre))),
    [data],
  );

  // Filter data
  const filteredData = useMemo(() => {
    return data.filter((s) => {
      if (nivelFilter !== "ALL" && s.nivel.nombre !== nivelFilter) return false;
      if (turnoFilter !== "ALL" && s.turno !== turnoFilter) return false;
      return true;
    });
  }, [data, nivelFilter, turnoFilter]);

  // Handlers
  const onEdit = useCallback((s: SeccionTableType) => {
    setSelectedSeccion(s);
    setShowEditDialog(true);
  }, []);

  const onDelete = useCallback((s: SeccionTableType) => {
    setSelectedSeccion(s);
    setShowDeleteModal(true);
  }, []);

  const onConfirmDelete = () => {
    if (!selectedSeccion) return;
    startTransition(async () => {
      const res = await deleteSeccionAction(selectedSeccion.id);
      if (res.success) {
        toast.success(res.success);
        setShowDeleteModal(false);
        setSelectedSeccion(null);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <>
      {/* ── Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Level tabs */}
        <div className="flex items-center gap-1 p-1 bg-muted/20 rounded-full border border-border/30">
          <button
            onClick={() => setNivelFilter("ALL")}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
              nivelFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            Todos
          </button>
          {niveles.map((nivel) => {
            const Icon = NIVEL_ICON_MAP[nivel.toUpperCase()] || IconBook;
            return (
              <button
                key={nivel}
                onClick={() => setNivelFilter(nivel)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5",
                  nivelFilter === nivel
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                <Icon className="size-3.5" />
                {nivel}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          {/* Turno checkboxes */}
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <span className="uppercase tracking-wider text-[10px] mr-1">
              Turno:
            </span>
            {(["MANANA", "TARDE"] as const).map((t) => {
              const info = TURNO_MAP[t];
              const TIcon = info.icon;
              const isActive = turnoFilter === t;
              return (
                <button
                  key={t}
                  onClick={() => setTurnoFilter(isActive ? "ALL" : t)}
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all duration-200",
                    isActive
                      ? info.className
                      : "border-border/30 text-muted-foreground/60 hover:text-foreground hover:border-border/60",
                  )}
                >
                  <TIcon className="size-3" />
                  {info.label}
                </button>
              );
            })}
          </div>

          {/* Active count */}
          <span className="text-xs text-muted-foreground">
            Mostrando{" "}
            <span className="text-primary font-bold">
              {filteredData.length}
            </span>{" "}
            Secciones Activas
          </span>
        </div>
      </div>

      {/* ── Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {filteredData.map((seccion, i) => (
          <SeccionCard
            key={seccion.id}
            seccion={seccion}
            onEdit={onEdit}
            onDelete={onDelete}
            index={i}
          />
        ))}
        <CreateSectionCard onClick={() => setShowAddDialog(true)} />
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <IconUsers className="size-12 text-muted-foreground/20 mb-3" />
          <p className="text-sm text-muted-foreground">
            No se encontraron secciones
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Prueba cambiando los filtros o crea una nueva sección
          </p>
        </div>
      )}

      {/* ── Modals ── */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirmDelete}
        loading={isDeleting}
        title="¿Eliminar Sección?"
        description={`¿Estás seguro de eliminar la sección "${selectedSeccion?.grado.nombre} ${selectedSeccion?.seccion}"? Esta acción no se puede deshacer.`}
        variant="danger"
      />

      <FormModal
        title="Editar Sección"
        description="Modifica los datos de la sección seleccionada."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-xl"
      >
        <SeccionForm
          initialData={selectedSeccion}
          grados={meta.grados}
          tutores={meta.tutores}
          sedes={meta.sedes}
          institucionId={meta.institucionId}
          onSuccess={() => {
            setShowEditDialog(false);
            setSelectedSeccion(null);
          }}
        />
      </FormModal>

      <FormModal
        title="Nueva Sección"
        description="Crea una sección (A, B, C...) para un grado específico."
        isOpen={showAddDialog}
        onOpenChange={setShowAddDialog}
        className="sm:max-w-xl"
      >
        <SeccionForm
          grados={meta.grados}
          tutores={meta.tutores}
          sedes={meta.sedes}
          institucionId={meta.institucionId}
          currentAnio={currentAnio}
          onSuccess={() => setShowAddDialog(false)}
        />
      </FormModal>
    </>
  );
}
