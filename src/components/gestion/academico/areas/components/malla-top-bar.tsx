"use client";

import { SeedCnebButton } from "@/components/gestion/academico/areas/seed-cneb-button";
import { AddAreaButton } from "@/components/gestion/academico/areas/add-area-button";
import { cn } from "@/lib/utils";

interface Nivel {
  id: string;
  nombre: string;
  [key: string]: any;
}

interface MallaTopBarProps {
  niveles: Nivel[];
  activeNivelId: string;
  onNivelChange: (id: string) => void;
  institucionId: string;
}

export function MallaTopBar({
  niveles,
  activeNivelId,
  onNivelChange,
  institucionId,
}: MallaTopBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 p-3.5 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
      {/* Selector de Nivel por Pestañas */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-border/40 bg-muted/30 flex-wrap">
        {niveles.map((nivel) => {
          const isActive = activeNivelId === nivel.id;
          return (
            <button
              key={nivel.id}
              onClick={() => onNivelChange(nivel.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 cursor-pointer flex items-center gap-2",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 scale-[1.01]"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/80",
              )}
            >
              <span>{nivel.nombre.toLowerCase()}</span>
              {isActive && (
                <span className="size-1.5 rounded-full bg-primary-foreground animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Botonera de Acciones (Cargar CNEB + Nueva Área) */}
      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
        <SeedCnebButton
          nivelId={activeNivelId !== "all" ? activeNivelId : undefined}
        />
        <AddAreaButton institucionId={institucionId} niveles={niveles} />
      </div>
    </div>
  );
}
