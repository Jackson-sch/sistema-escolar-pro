"use client";

import {
  IconDoor,
  IconSun,
  IconMoon,
  IconBuilding,
  IconCalendarEvent,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SectionDetailHeaderProps {
  seccion: {
    id: string;
    seccion: string;
    turno?: string | null;
    aulaAsignada?: string | null;
    anioAcademico?: string | number;
    color?: string | null;
    sede?: { id: string; nombre: string } | null;
  };
  grado?: { id: string; nombre: string; codigo?: string } | null;
  nivel?: { id: string; nombre: string } | null;
  onEditSection: () => void;
  onDeleteSection: () => void;
}

export function SectionDetailHeader({
  seccion,
  grado,
  nivel,
  onEditSection,
  onDeleteSection,
}: SectionDetailHeaderProps) {
  const sectionColor = seccion.color || "#3b82f6";
  const isMorning = seccion.turno === "MANANA";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Avatar Badge & Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="size-13 rounded-2xl flex items-center justify-center font-black text-xl text-white shrink-0 shadow-md"
            style={{ backgroundColor: sectionColor }}
          >
            {seccion.seccion}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                {grado?.nombre?.toUpperCase()} — SECCIÓN &quot;{seccion.seccion}&quot;
              </h2>
            </div>

            {/* Badges metadata */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {nivel && (
                <Badge
                  variant="outline"
                  className="font-bold text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border-primary/20"
                >
                  {nivel.nombre}
                </Badge>
              )}

              {seccion.turno && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                  {isMorning ? (
                    <IconSun className="size-3 text-amber-500" />
                  ) : (
                    <IconMoon className="size-3 text-indigo-400" />
                  )}
                  {isMorning ? "Turno Mañana" : "Turno Tarde"}
                </span>
              )}

              {seccion.aulaAsignada ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                  <IconDoor className="size-3 text-muted-foreground/70" />
                  Aula: {seccion.aulaAsignada}
                </span>
              ) : (
                <span className="text-[10px] italic text-muted-foreground/60 px-1">
                  Sin aula asignada
                </span>
              )}

              {seccion.sede && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                  <IconBuilding className="size-3 text-muted-foreground/70" />
                  {seccion.sede.nombre}
                </span>
              )}

              {seccion.anioAcademico && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                  <IconCalendarEvent className="size-3 text-muted-foreground/70" />
                  Año: {seccion.anioAcademico}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onEditSection}
            className="h-8.5 px-3 rounded-xl gap-1.5 text-xs font-bold border-border/60 hover:bg-muted cursor-pointer shadow-2xs"
          >
            <IconPencil className="size-3.5" />
            <span>Editar Sección</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDeleteSection}
            title="Eliminar aula"
            className="size-8.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
