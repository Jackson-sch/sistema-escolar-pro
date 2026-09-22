"use client";

import { IconBook, IconLoader2 } from "@tabler/icons-react";
import { NIVEL_ICON_MAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface NivelesSidebarProps {
  niveles: any[];
  nivelId: string;
  isLoadingSecciones: boolean;
  onSelectNivel: (nivelId: string) => void;
}

export function NivelesSidebar({
  niveles,
  nivelId,
  isLoadingSecciones,
  onSelectNivel,
}: NivelesSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r bg-card/80 rounded-l-2xl overflow-hidden">
      <div className="px-5 py-5 border-b border-border/30">
        <h2 className="text-xs font-black uppercase tracking-widest text-foreground/80">
          Reportes Escolares
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
          Análisis de asistencia
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {niveles.map((nivel: any) => {
          const Icon = NIVEL_ICON_MAP[nivel.nombre] || IconBook;
          const isActive = nivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              onClick={() => onSelectNivel(nivel.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-[color,background-color,box-shadow] duration-200 group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0 transition-transform",
                  isActive && "scale-110",
                )}
              />
              <span className="text-[11px] font-bold tracking-wider">
                {nivel.nombre}
              </span>
            </button>
          );
        })}

        {niveles.length === 0 && !isLoadingSecciones && (
          <p className="text-[10px] text-muted-foreground/50 text-center py-8 italic">
            No hay niveles disponibles
          </p>
        )}
        {isLoadingSecciones && (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="size-5 animate-spin text-muted-foreground/30" />
          </div>
        )}
      </nav>
    </aside>
  );
}

interface MobileNivelSelectorProps {
  niveles: any[];
  nivelId: string;
  onSelectNivel: (nivelId: string) => void;
}

export function MobileNivelSelector({
  niveles,
  nivelId,
  onSelectNivel,
}: MobileNivelSelectorProps) {
  return (
    <div className="lg:hidden px-4 pt-4">
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
        {niveles.map((nivel: any) => {
          const Icon =
            NIVEL_ICON_MAP[nivel.nombre?.toUpperCase()] || IconBook;
          const isActive = nivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              onClick={() => onSelectNivel(nivel.id)}
              className={cn(
                "flex-1 flex flex-col items-center py-2.5 rounded-lg transition-[color,background-color,box-shadow] gap-1",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className="text-[9px] font-bold uppercase tracking-wider">
                {nivel.nombre}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
