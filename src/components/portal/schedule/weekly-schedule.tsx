"use client";

import { useMemo } from "react";
import { IconClock, IconUser, IconMapPin, IconCoffee } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string; // ej. "08:00"
  horaFin: string; // ej. "09:30"
  aula?: string;
  curso: {
    nombre: string;
    areaCurricular: { nombre: string; color?: string };
    profesor?: { name: string; apellidoPaterno: string };
  };
}

interface WeeklyScheduleProps {
  horarios: Horario[];
}

export function WeeklySchedule({ horarios }: WeeklyScheduleProps) {
  const dias = [
    { id: 1, label: "Lunes" },
    { id: 2, label: "Martes" },
    { id: 3, label: "Miércoles" },
    { id: 4, label: "Jueves" },
    { id: 5, label: "Viernes" },
  ];

  // Definición de bloques base de horario
  const baseBlocks = [
    { start: "07:00", end: "07:45", label: "07:00" },
    { start: "07:45", end: "08:30", label: "07:45" },
    { start: "08:30", end: "09:15", label: "08:30" },
    { start: "09:15", end: "10:00", label: "09:15" },
    {
      start: "10:00",
      end: "10:30",
      type: "break",
      label: "10:00",
      fullEnd: "10:30",
    },
    { start: "10:30", end: "11:15", label: "10:30" },
    { start: "11:15", end: "12:00", label: "11:15" },
    { start: "12:00", end: "12:45", label: "12:00" },
    { start: "12:45", end: "13:00", label: "12:45" },
    {
      start: "13:00",
      end: "14:00",
      type: "lunch",
      label: "13:00",
      fullEnd: "14:00",
    },
  ];

  const getRowRange = (start: string, end: string) => {
    const startIndex = baseBlocks.findIndex((b) => b.start === start);
    const endIndex = baseBlocks.findIndex((b) => b.end === end);
    if (startIndex === -1) return null;
    return {
      start: startIndex + 2,
      end: (endIndex !== -1 ? endIndex : startIndex) + 3,
    };
  };

  const getAreaColor = (areaName: string) => {
    const name = areaName.toLowerCase();
    if (name.includes("cienc") || name.includes("mate"))
      return "bg-teal-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400";
    if (name.includes("letra") || name.includes("human") || name.includes("comunic"))
      return "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400";
    if (name.includes("arte") || name.includes("física") || name.includes("tall"))
      return "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400";
    return "bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 p-4 md:p-6 shadow-xl overflow-x-auto">
      <div className="min-w-[850px]">
        <div
          className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] gap-3"
          style={{
            gridTemplateRows: `auto repeat(${baseBlocks.length}, minmax(44px, auto))`,
          }}
        >
          {/* Header Row */}
          <div className="col-start-1 h-6" />
          {dias.map((dia, idx) => (
            <div
              key={dia.id}
              className="text-center py-2 px-3 rounded-xl bg-muted/40 border border-border/30 mb-2"
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {dia.label}
              </span>
            </div>
          ))}

          {/* Time Labels Column */}
          {baseBlocks.map((block, idx) => (
            <div
              key={`time-${block.start}`}
              className="flex flex-col items-end justify-center pr-3 border-r border-border/20 mb-2"
              style={{ gridColumn: 1, gridRow: idx + 2 }}
            >
              <span className="text-xs font-mono font-bold text-foreground">
                {block.label}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground uppercase">
                {parseInt(block.label.split(":")[0]) >= 12 ? "PM" : "AM"}
              </span>
            </div>
          ))}

          {/* Free Slots */}
          {dias.map((dia, dIdx) =>
            baseBlocks.map((block, bIdx) => {
              if (block.type) return null;
              return (
                <div
                  key={`free-${dia.id}-${bIdx}`}
                  className="rounded-xl border border-dashed border-border/20 bg-muted/5 mb-2"
                  style={{ gridColumn: dIdx + 2, gridRow: bIdx + 2 }}
                />
              );
            }),
          )}

          {/* Classes Cards */}
          {horarios.map((item) => {
            const range = getRowRange(item.horaInicio, item.horaFin);
            if (!range) return null;

            const colorClasses = getAreaColor(item.curso.areaCurricular.nombre);

            return (
              <div
                key={item.id}
                className={cn(
                  "group relative flex flex-col justify-between rounded-xl p-3 border shadow-xs transition-[box-shadow,transform] hover:shadow-md hover:-translate-y-0.5 cursor-pointer z-10 mb-2",
                  colorClasses,
                )}
                style={{
                  gridColumn: item.diaSemana + 1,
                  gridRow: `${range.start} / ${range.end}`,
                }}
              >
                <div className="space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 block truncate">
                    {item.curso.areaCurricular.nombre}
                  </span>

                  <h4 className="font-bold text-xs leading-snug text-foreground line-clamp-2">
                    {item.curso.nombre}
                  </h4>

                  <span className="text-[10px] font-mono font-semibold text-muted-foreground flex items-center gap-1 pt-0.5">
                    <IconClock className="size-3 opacity-70 shrink-0" />
                    {item.horaInicio} - {item.horaFin}
                  </span>
                </div>

                <div className="mt-2 pt-1 border-t border-current/10 space-y-0.5">
                  {item.curso.profesor && (
                    <p className="text-[10px] font-medium text-muted-foreground truncate capitalize flex items-center gap-1">
                      <IconUser className="size-3 opacity-60 shrink-0" />
                      <span>Prof. {item.curso.profesor.apellidoPaterno.toLowerCase()}</span>
                    </p>
                  )}
                  {item.aula && (
                    <p className="text-[10px] font-medium text-muted-foreground truncate flex items-center gap-1">
                      <IconMapPin className="size-3 opacity-60 shrink-0" />
                      <span>{item.aula}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Breaks and Lunch */}
          {baseBlocks
            .flatMap((block, idx) => {
              if (!block.type) return [];
              const range = getRowRange(
                block.start,
                block.fullEnd || block.end,
              );
              if (!range) return [];

              const isLunch = block.type === "lunch";

              return [
                <div
                  key={`row-break-${block.start}`}
                  className="col-start-2 col-end-7 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-center gap-2 mb-2 p-2"
                  style={{ gridRow: `${range.start} / ${range.end}` }}
                >
                  <IconCoffee className="size-4 text-amber-500" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 dark:text-amber-400">
                    {isLunch ? "Receso / Almuerzo" : "Recreo / Break"} ({block.start} - {block.fullEnd})
                  </span>
                </div>
              ];
            })}
        </div>
      </div>
    </div>
  );
}
