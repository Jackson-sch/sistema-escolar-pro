"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTrash, IconClock, IconCopy, IconUserCheck, IconMapPin, IconCoffee } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { DIAS, BLOQUES_HORARIO } from "@/lib/constants";
import { useDroppable, useDraggable } from "@dnd-kit/core";

interface ScheduleGridProps {
  horarios: any[];
  onDelete: (id: string) => void;
  onDuplicate: (slot: any) => void;
}

export function ScheduleGrid({ horarios, onDelete, onDuplicate }: ScheduleGridProps) {
  // Función para obtener cursos en un slot específico
  const getCourseInSlot = (dia: number, horaInicioBloque: string) => {
    return horarios.filter((h) => {
      if (h.diaSemana !== dia) return false;

      const hInicio = h.horaInicio;
      const hFin = h.horaFin;

      if (hInicio === horaInicioBloque) return true;

      const toMin = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
      };

      const bStart = toMin(horaInicioBloque);
      const cStart = toMin(hInicio);
      const cEnd = toMin(hFin);

      return bStart >= cStart && bStart < cEnd;
    });
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/70 backdrop-blur-md shadow-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/40 border-b border-border/40">
            <th className="p-3.5 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-r border-border/40 w-28">
              HORARIO
            </th>
            {DIAS.map((dia) => (
              <th
                key={dia.id}
                className="p-3.5 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/90 border-r border-border/40 min-w-44"
              >
                {dia.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BLOQUES_HORARIO.map((bloque: any, timeIdx: number) => (
            <tr
              key={`${bloque.inicio}-${bloque.tipo}`}
              className={cn(
                "border-b border-border/30 transition-colors",
                bloque.tipo === "receso"
                  ? "bg-violet-500/10 dark:bg-violet-500/15"
                  : "hover:bg-muted/20",
                timeIdx % 2 === 0 ? "bg-transparent" : "bg-muted/10",
              )}
            >
              <td className="p-3 text-center border-r border-border/40 bg-muted/20 font-mono">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {bloque.inicio}
                  </span>
                  <span className="text-[9px] font-semibold text-muted-foreground/60 tabular-nums">
                    {bloque.fin}
                  </span>
                </div>
              </td>

              {bloque.tipo === "receso" ? (
                <td
                  colSpan={DIAS.length}
                  className="p-0 h-12 relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-gradient-to-r from-transparent via-violet-500/15 to-transparent">
                    <div className="h-px flex-1 bg-violet-500/30" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-600 dark:text-violet-300 flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 shadow-xs">
                      <IconCoffee className="size-3.5" /> RECESO ESCOLAR (30 MIN)
                    </span>
                    <div className="h-px flex-1 bg-violet-500/30" />
                  </div>
                </td>
              ) : (
                DIAS.map((dia) => {
                  const slots = getCourseInSlot(
                    parseInt(dia.id),
                    bloque.inicio,
                  );
                  const droppableId = `${dia.id}-${bloque.inicio}`;
                  return (
                    <DroppableCell key={dia.id} id={droppableId}>
                      {slots.map((slot) => (
                        <DraggableCard
                          key={slot.id}
                          slot={slot}
                          onDelete={onDelete}
                          onDuplicate={onDuplicate}
                        />
                      ))}
                    </DroppableCell>
                  );
                })
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DroppableCell({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <td
      ref={setNodeRef}
      className={cn(
        "p-2 border-r border-border/40 align-top h-24 relative group transition-colors",
        isOver ? "bg-indigo-500/10 border-indigo-500/40 shadow-inner" : ""
      )}
    >
      <div className="flex flex-col gap-2 h-full min-h-[5rem]">
        {children}
      </div>
    </td>
  );
}

function DraggableCard({
  slot,
  onDelete,
  onDuplicate,
}: {
  slot: any;
  onDelete: (id: string) => void;
  onDuplicate: (slot: any) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: slot.id,
    data: slot,
  });

  const areaColor = slot.curso?.areaCurricular?.color || "#4f46e5";

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "p-2.5 rounded-xl border border-border/50 shadow-xs relative overflow-hidden group/card transition-all duration-200",
        isDragging
          ? "opacity-30 scale-95"
          : "hover:scale-[1.02] hover:shadow-md hover:border-indigo-500/40 cursor-grab active:cursor-grabbing bg-card/90"
      )}
      style={{
        borderLeft: `3px solid ${areaColor}`,
        backgroundColor: `${areaColor}12`,
      }}
    >
      <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10 flex items-center gap-0.5 print:hidden no-print bg-background/90 p-0.5 rounded-md border border-border/40 shadow-xs">
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 rounded-md transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(slot);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Duplicar horario"
        >
          <IconCopy className="size-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(slot.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          title="Eliminar de la grilla"
        >
          <IconTrash className="size-3" />
        </Button>
      </div>

      <h4 className="text-xs font-bold leading-snug text-foreground uppercase mb-1 truncate pr-10">
        {slot.curso?.nombre || "Asignatura"}
      </h4>

      <div className="space-y-0.5">
        <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5 truncate capitalize">
          <span
            className="size-1.5 rounded-full shrink-0"
            style={{ backgroundColor: areaColor }}
          />
          <span className="truncate">
            {slot.curso?.profesor?.name
              ? `${slot.curso.profesor.name} ${slot.curso.profesor.apellidoPaterno || ""}`
              : "Sin docente"}
          </span>
        </p>
        {slot.aula && (
          <div className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground/70 uppercase">
            <IconMapPin className="size-2.5 text-indigo-500 shrink-0" />
            <span className="truncate">{slot.aula}</span>
          </div>
        )}
      </div>
    </div>
  );
}
