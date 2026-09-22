"use client";

import { LazyMotion, domAnimation, m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { KanbanColumnDef } from "./kanban-types";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  column: KanbanColumnDef;
  prospectos: any[];
  grados: any[];
  isHovered: boolean;
  loadingId: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onShowEdit: (id: string) => void;
  onShowFlow: (id: string) => void;
  onMove: (id: string, newStatus: string) => void;
  onStartEvaluation: (id: string) => void;
  onEnrollStudent: (id: string) => void;
}

export function KanbanColumn({
  column: col,
  prospectos,
  grados,
  isHovered,
  loadingId,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragStart,
  onDragEnd,
  onShowEdit,
  onShowFlow,
  onMove,
  onStartEvaluation,
  onEnrollStudent,
}: KanbanColumnProps) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-3.5 gap-3.5 bg-muted/30 border border-border/50 transition-all duration-200 min-h-[520px] w-full",
        isHovered
          ? "border-primary/50 bg-muted/60 ring-2 ring-primary/20 shadow-sm"
          : "",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Encabezado Columna */}
      <div className="flex items-center justify-between pb-2.5 border-b border-border/40">
        <h3 className="font-extrabold text-xs tracking-wider text-foreground flex items-center gap-1.5 uppercase">
          <span className={`size-2 rounded-full ${col.dotColor}`} />
          {col.title}
        </h3>
        <span className="px-2 py-0.5 rounded-full bg-card text-foreground text-[11px] font-black border border-border/50 shadow-2xs font-mono">
          {prospectos.length}
        </span>
      </div>

      {/* Tarjetas */}
      <div className="flex flex-col gap-2.5 h-full overflow-y-auto max-h-[620px] pr-0.5 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {prospectos.map((p) => {
            const gradeName =
              grados.find((g) => g.id === p.gradoInteresId)?.nombre ||
              "Sin Grado";

            return (
              <LazyMotion key={p.id} features={domAnimation}>
                <m.div layout>
                  <KanbanCard
                    prospecto={p}
                    gradeName={gradeName}
                    isCardLoading={loadingId === p.id}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onShowEdit={onShowEdit}
                    onShowFlow={onShowFlow}
                    onMove={onMove}
                    onStartEvaluation={onStartEvaluation}
                    onEnrollStudent={onEnrollStudent}
                  />
                </m.div>
              </LazyMotion>
            );
          })}
        </AnimatePresence>

        {prospectos.length === 0 && (
          <div className="h-28 border border-dashed border-border/40 bg-card/10 rounded-2xl flex items-center justify-center text-center p-4 opacity-50 select-none">
            <p className="text-xxs text-muted-foreground font-bold uppercase tracking-wider">
              Arrastra aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
