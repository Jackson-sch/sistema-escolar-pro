"use client";

import { useQueryState, parseAsString } from "nuqs";
import { IconSchool, IconCertificate, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AddCompetencyButton } from "../add-competency-button";

interface CompetencyHeaderBarProps {
  niveles: { id: string; nombre: string }[];
  activeNivelId?: string;
  totalCompetencias: number;
}

export function CompetencyHeaderBar({
  niveles,
  activeNivelId,
  totalCompetencias,
}: CompetencyHeaderBarProps) {
  const [nivelId, setNivelId] = useQueryState(
    "nivelId",
    parseAsString.withOptions({ shallow: false })
  );

  const currentNivelId = nivelId || activeNivelId;

  const handleSelectNivel = (id: string) => {
    setNivelId(id);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md shadow-xs">
      {/* Title & Context */}
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400">
          <IconCertificate className="size-5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground">
              Competencias y Capacidades CNEB
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
              <IconSparkles className="size-3" />
              MINEDU 2026
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Catálogo curricular oficial estandarizado para evaluación formativa y registro de conclusiones descriptivas.
          </p>
        </div>
      </div>

      {/* Right controls: Level Switcher Tabs + Add Button */}
      <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
        {/* Segmented Level Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-muted/60 border border-border/40 gap-1 overflow-x-auto">
          {niveles.map((n) => {
            const isActive = currentNivelId === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => handleSelectNivel(n.id)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  isActive
                    ? "bg-background text-foreground shadow-xs font-extrabold border border-border/40"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <IconSchool className={cn("size-3.5", isActive ? "text-indigo-600 dark:text-indigo-400" : "opacity-60")} />
                <span>{n.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Add Competency Button */}
        <AddCompetencyButton nivelId={currentNivelId} />
      </div>
    </div>
  );
}
