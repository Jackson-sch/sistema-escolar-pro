"use client";

import { cn } from "@/lib/utils";
import { IconChevronRight, IconSchool, IconGraph, IconUsersGroup } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface LevelCardProps {
  nivel: {
    id: string;
    nombre: string;
    descripcion?: string | null;
    _count?: { grados: number };
  };
  isActive: boolean;
  onClick: () => void;
  sectionCount: number;
}

export function LevelCard({ nivel, isActive, onClick, sectionCount }: LevelCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-all duration-300 border-none relative overflow-hidden",
        isActive 
          ? "bg-linear-to-br from-primary/20 via-primary/10 to-transparent ring-2 ring-primary/50 shadow-lg shadow-primary/20" 
          : "bg-background/40 hover:bg-background/60 hover:translate-x-1"
      )}
    >
      {/* Decorative accent */}
      {isActive && (
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <IconSchool size={80} stroke={1.5} />
        </div>
      )}

      <div className="p-5 flex items-center gap-4">
        <div className={cn(
          "size-12 rounded-2xl flex items-center justify-center transition-transform duration-500",
          isActive ? "bg-primary text-primary-foreground scale-110 rotate-3" : "bg-muted text-muted-foreground group-hover:scale-105"
        )}>
          <IconSchool className="size-6" />
        </div>

        <div className="flex-1 space-y-1">
          <h3 className={cn(
            "font-bold text-lg leading-tight transition-colors",
            isActive ? "text-primary" : "text-foreground group-hover:text-primary/80"
          )}>
            {nivel.nombre}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 italic">
            {nivel.descripcion || "Educación básica regular."}
          </p>
        </div>

        {isActive && (
          <div className="bg-primary/20 p-1.5 rounded-full text-primary">
            <IconChevronRight className="size-4" />
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-0 flex gap-2">
        <Badge variant="secondary" className="bg-background/50 border-none px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm">
          <IconGraph className="size-3 text-blue-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {nivel._count?.grados || 0} Grados
          </span>
        </Badge>
        <Badge variant="secondary" className="bg-background/50 border-none px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm">
          <IconUsersGroup className="size-3 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {sectionCount} Sección{sectionCount !== 1 ? "es" : ""}
          </span>
        </Badge>
      </div>

      {/* Progress shadow bar */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 bg-primary transition-all duration-700",
        isActive ? "w-full opacity-100" : "w-0 opacity-0"
      )} />
    </Card>
  );
}
