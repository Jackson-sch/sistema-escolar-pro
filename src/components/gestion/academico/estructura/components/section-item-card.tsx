"use client";

import { cn } from "@/lib/utils";
import { IconUsers, IconUserCircle, IconPencil, IconTrash, IconCircleFilled } from "@tabler/icons-react";
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
    _count?: { matriculas: number };
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

export function SectionItemCard({
  seccion,
  onEdit,
  onDelete,
  onAssignTutor,
  onSelectSection,
}: SectionItemCardProps) {
  const enrollment = seccion._count?.matriculas || 0;
  const capacity = seccion.capacidad;
  const occupancyRate = (enrollment / capacity) * 100;

  // Custom color or default emerald
  const sectionColor = seccion.color || "#10b981";

  return (
    <Card
      onClick={onSelectSection}
      className="group relative overflow-hidden bg-background/20 hover:bg-background/40 transition-[background-color,border-color,box-shadow] duration-500 border-border/40 hover:border-primary/40 shadow-sm hover:shadow-lg hover:shadow-primary/10 rounded-2xl cursor-pointer"
    >
      {/* Dynamic Glow Effect */}
      <div 
        className="absolute -inset-1 opacity-0 group-hover:opacity-10 transition-opacity duration-700 blur-2xl pointer-events-none"
        style={{ 
          background: `radial-gradient(circle at center, ${sectionColor}, transparent 70%)` 
        }}
      />

      <div className="p-4 pl-7 space-y-4 relative z-10">
        {/* Header: Name and Actions */}
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-lg tracking-tight flex items-center gap-2 group-hover:text-primary transition-colors">
              Sección {seccion.seccion}
              {seccion.descripcion && (
                <span className="text-xs font-normal text-muted-foreground italic">
                  &quot;{seccion.descripcion}&quot;
                </span>
              )}
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
              <IconCircleFilled className="size-2" style={{ color: sectionColor }} />
              Estado Activo
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-[opacity,transform] duration-300 translate-x-2 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="size-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <IconPencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="size-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        </div>

        {/* Enrollment Stats */}
        <div className="space-y-2">
          <div className="flex items-end justify-between text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted-foreground font-medium uppercase tracking-tighter opacity-70">
                Ocupación
              </span>
              <span className="font-bold text-sm">
                {enrollment} <span className="text-muted-foreground font-normal">/ {capacity}</span>
              </span>
            </div>
            <Badge 
              variant="secondary" 
              className={cn(
                "rounded-md border-none px-1.5 py-0.5 text-[10px] font-bold",
                occupancyRate > 90 ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
              )}
            >
              {Math.round(occupancyRate)}%
            </Badge>
          </div>
          <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
            <div 
              className="h-full transition-[width] duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]"
              style={{ 
                width: `${Math.min(occupancyRate, 100)}%`,
                backgroundColor: sectionColor 
              }}
            />
          </div>
        </div>

        {/* Footer: Tutor (clickable for quick assign) */}
        <div className="pt-3 border-t border-border/20 flex items-center justify-between">
          <button 
            onClick={onAssignTutor}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 -mx-1.5 -my-1 hover:bg-primary/5 transition-colors duration-200 group/tutor cursor-pointer"
          >
            <Avatar className="size-7 border border-border/40 ring-2 ring-background shadow-inner group-hover/tutor:ring-primary/30 transition-shadow">
              <AvatarImage src={seccion.tutor?.image ?? undefined} />
              <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-bold">
                {seccion.tutor ? seccion.tutor.name[0] : <IconUserCircle className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col -space-y-0.5 text-left">
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest opacity-60">
                Tutoría
              </span>
              <span className={cn(
                "text-xs font-bold truncate max-w-[120px] transition-colors capitalize",
                seccion.tutor 
                  ? "group-hover/tutor:text-primary" 
                  : "text-amber-500 group-hover/tutor:text-primary"
              )}>
                {seccion.tutor 
                  ? `${seccion.tutor.name} ${seccion.tutor.apellidoPaterno} ${seccion.tutor.apellidoMaterno}` 
                  : "Por asignar"}
              </span>
            </div>
          </button>
        </div>
      </div>
    </Card>
  );
}
