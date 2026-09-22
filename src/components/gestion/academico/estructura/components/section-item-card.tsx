"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  IconUsers,
  IconUserCircle,
  IconPencil,
  IconTrash,
  IconDoor,
  IconSun,
  IconMoon,
  IconBuilding,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface SectionItemCardProps {
  seccion: {
    id: string;
    seccion: string;
    descripcion?: string | null;
    capacidad: number;
    color?: string | null;
    turno?: string | null;
    aulaAsignada?: string | null;
    sede?: { id: string; nombre: string } | null;
    _count?: { matriculas: number; students?: number };
    tutor?: {
      id: string;
      name: string;
      apellidoPaterno: string;
      apellidoMaterno?: string | null;
      image?: string | null;
    } | null;
  };
  onEdit: () => void;
  onDelete: () => void;
  onAssignTutor: () => void;
  onSelectSection?: () => void;
}

const getOccupancyColor = (rate: number, fallback: string) =>
  rate >= 95 ? "#ef4444" : rate >= 80 ? "#f59e0b" : fallback;

const getOccupancyBadgeClass = (rate: number) =>
  rate >= 90
    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    : rate >= 75
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

function TurnoBadge({ turno }: { turno: string }) {
  const isMorning = turno === "MANANA";
  return (
    <>
      <span className="opacity-40">•</span>
      <span className="flex items-center gap-0.5 text-[10px] uppercase font-semibold">
        {isMorning ? <IconSun className="size-2.5 text-amber-500" /> : <IconMoon className="size-2.5 text-indigo-400" />}
        {isMorning ? "Mañana" : "Tarde"}
      </span>
    </>
  );
}

function SectionCardHeader({
  seccion,
  sectionColor,
  onEdit,
  onDelete,
}: {
  seccion: SectionItemCardProps["seccion"];
  sectionColor: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="size-9 rounded-xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundColor: sectionColor }}
        >
          {seccion.seccion}
        </div>

        <div className="min-w-0 space-y-0.5">
          <h4 className="font-bold text-sm tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
            Sección &quot;{seccion.seccion}&quot;
          </h4>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium flex-wrap">
            {seccion.aulaAsignada ? (
              <span className="flex items-center gap-1">
                <IconDoor className="size-3 text-muted-foreground/70" />
                {seccion.aulaAsignada}
              </span>
            ) : (
              <span className="italic text-[10px]">Sin aula asignada</span>
            )}
            {seccion.turno && <TurnoBadge turno={seccion.turno} />}
            {seccion.sede && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground/80 font-medium">
                <span className="opacity-40">•</span>
                <IconBuilding className="size-2.5 text-muted-foreground/70" />
                <span className="truncate max-w-[95px]">{seccion.sede.nombre}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          title="Editar sección"
          className="size-7 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconPencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Eliminar sección"
          className="size-7 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function SectionCapacityBar({
  enrollment,
  capacity,
  occupancyRate,
  vacantes,
  sectionColor,
}: {
  enrollment: number;
  capacity: number;
  occupancyRate: number;
  vacantes: number;
  sectionColor: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-[11px] text-muted-foreground">
          <strong className="text-foreground font-bold">{enrollment}</strong> / {capacity} alumnos
        </span>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-md", getOccupancyBadgeClass(occupancyRate))}>
          {vacantes === 0 ? "Completo" : `${vacantes} vac.`}
        </span>
      </div>

      <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(occupancyRate, 100)}%`, backgroundColor: getOccupancyColor(occupancyRate, sectionColor) }}
        />
      </div>
    </div>
  );
}

function SectionTutorFooter({
  tutor,
  onAssignTutor,
}: {
  tutor: SectionItemCardProps["seccion"]["tutor"];
  onAssignTutor: () => void;
}) {
  const tutorName = tutor
    ? `${tutor.name} ${tutor.apellidoPaterno || ""} ${tutor.apellidoMaterno || ""}`.trim()
    : "Asignar tutor...";

  return (
    <div className="pt-2.5 border-t border-border/40 flex items-center justify-between gap-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAssignTutor();
        }}
        className="flex items-center gap-2 rounded-lg px-1.5 py-1 -mx-1 -my-0.5 hover:bg-muted/60 transition-colors duration-200 group/tutor text-left min-w-0 flex-1 cursor-pointer"
      >
        <Avatar className="size-6 border border-border/50 shrink-0">
          <AvatarImage src={tutor?.image ?? undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-bold">
            {tutor ? tutor.name[0] : <IconUserCircle className="size-3.5 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">Tutor(a)</span>
          <span className={cn("text-xs font-semibold truncate capitalize transition-colors", tutor ? "text-foreground group-hover/tutor:text-primary" : "text-amber-500 group-hover/tutor:text-amber-600 font-medium italic")}>
            {tutorName}
          </span>
        </div>
      </button>
    </div>
  );
}

export function SectionItemCard({
  seccion,
  onEdit,
  onDelete,
  onAssignTutor,
  onSelectSection,
}: SectionItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const enrollment = seccion._count?.matriculas ?? seccion._count?.students ?? 0;
  const capacity = seccion.capacidad || 30;
  const occupancyRate = capacity > 0 ? (enrollment / capacity) * 100 : 0;
  const vacantes = Math.max(0, capacity - enrollment);
  const sectionColor = seccion.color || "#3b82f6";

  return (
    <Card
      onClick={onSelectSection}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? `${sectionColor}90` : undefined,
        boxShadow: isHovered ? `0 8px 24px -4px ${sectionColor}25` : undefined,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5"
    >
      <SectionCardHeader seccion={seccion} sectionColor={sectionColor} onEdit={onEdit} onDelete={onDelete} />
      <SectionCapacityBar enrollment={enrollment} capacity={capacity} occupancyRate={occupancyRate} vacantes={vacantes} sectionColor={sectionColor} />
      <SectionTutorFooter tutor={seccion.tutor} onAssignTutor={onAssignTutor} />
    </Card>
  );
}
