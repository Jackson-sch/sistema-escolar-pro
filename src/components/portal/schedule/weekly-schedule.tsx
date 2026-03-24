"use client";

import { useMemo } from "react";
import { IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

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
    { id: 1, label: "LUN" },
    { id: 2, label: "MAR" },
    { id: 3, label: "MIE" },
    { id: 4, label: "JUE" },
    { id: 5, label: "VIE" },
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

  // Helper para encontrar el índice de inicio y fin en los bloques base
  const getRowRange = (start: string, end: string) => {
    const startIndex = baseBlocks.findIndex((b) => b.start === start);
    const endIndex = baseBlocks.findIndex((b) => b.end === end);
    if (startIndex === -1) return null;
    // +2 porque el grid empieza en 2 (después del header)
    return {
      start: startIndex + 2,
      end: (endIndex !== -1 ? endIndex : startIndex) + 3,
    };
  };

  // Assign arbitrary colors to areas for the premium look (based on area name)
  const getAreaColor = (areaName: string) => {
    const name = areaName.toLowerCase();
    if (name.includes("cienc") || name.includes("mate")) return "teal";
    if (
      name.includes("letra") ||
      name.includes("human") ||
      name.includes("comunic")
    )
      return "orange";
    if (
      name.includes("arte") ||
      name.includes("física") ||
      name.includes("tall")
    )
      return "rose";
    return "blue"; // fallback
  };

  return (
    <div className="animate-in bg-card fade-in zoom-in-95 duration-500 rounded-3xl border border-border/20 p-2 md:p-6 overflow-x-auto">
      <div className="min-w-[900px]">
        {/* Unified Grid Container */}
        <div
          className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] gap-3"
          style={{
            gridTemplateRows: `auto repeat(${baseBlocks.length}, minmax(40px, auto))`,
          }}
        >
          {/* Header Row */}
          <div className="col-start-1 h-4" />
          {dias.map((dia, idx) => (
            <div
              key={dia.id}
              className="text-center pb-3 border-b border-border/30 mb-2"
              style={{ gridColumn: idx + 2, gridRow: 1 }}
            >
              <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80 dark:text-white/70">
                {dia.label}
              </span>
            </div>
          ))}

          {/* Time Labels Column */}
          {baseBlocks.map((block, idx) => (
            <div
              key={`time-${idx}`}
              className="flex flex-col items-end justify-start pr-4 pt-1 border-r border-border/20 mb-2"
              style={{ gridColumn: 1, gridRow: idx + 2 }}
            >
              <span className="text-[11px] font-black tracking-widest text-foreground/70 dark:text-white/50">
                {block.label}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase mt-0.5">
                {parseInt(block.label.split(":")[0]) >= 12 ? "PM" : "AM"}
              </span>
            </div>
          ))}

          {/* Free Slots (Base Grid Background) */}
          {dias.map((dia, dIdx) =>
            baseBlocks.map((block, bIdx) => {
              // No renderizamos fondo libre si es break o lunch (estos ocupan toda la fila)
              if (block.type) return null;

              return (
                <div
                  key={`free-${dia.id}-${bIdx}`}
                  className="rounded-2xl border border-dashed border-border/10 bg-card/5 hover:bg-card/10 transition-colors mb-2"
                  style={{ gridColumn: dIdx + 2, gridRow: bIdx + 2 }}
                />
              );
            }),
          )}

          {/* Classes with Row Span */}
          {horarios.map((item) => {
            const range = getRowRange(item.horaInicio, item.horaFin);
            if (!range) return null;

            const colorType = getAreaColor(item.curso.areaCurricular.nombre);

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 hover:scale-[1.01] hover:-translate-y-0.5 cursor-default overflow-hidden bg-card/40 border border-border/30 shadow-sm hover:shadow-xl z-10 mb-2"
                style={{
                  gridColumn: item.diaSemana + 1,
                  gridRow: `${range.start} / ${range.end}`,
                }}
              >
                {/* Gradient background hover effect */}
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                    colorType === "teal" &&
                      "bg-linear-to-br from-teal-500 to-transparent",
                    colorType === "orange" &&
                      "bg-linear-to-br from-orange-500 to-transparent",
                    colorType === "rose" &&
                      "bg-linear-to-br from-rose-500 to-transparent",
                    colorType === "blue" &&
                      "bg-linear-to-br from-blue-500 to-transparent",
                  )}
                />

                <div className="relative z-10 space-y-1.5 pl-1.5">
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest block",
                      colorType === "teal" && "text-teal-400",
                      colorType === "orange" && "text-orange-400",
                      colorType === "rose" && "text-rose-400",
                      colorType === "blue" && "text-blue-400",
                    )}
                  >
                    {item.curso.areaCurricular.nombre}
                  </span>

                  <h4 className="font-black text-sm md:text-[15px] leading-tight text-foreground dark:text-white tracking-tight line-clamp-3">
                    {item.curso.nombre}
                  </h4>

                  {/* End time visible in the card too for clarity */}
                  <span className="text-[10px] font-bold text-muted-foreground/40 block">
                    {item.horaInicio} - {item.horaFin}
                  </span>
                </div>

                <div className="relative z-10 mt-2 pl-1.5 space-y-1">
                  {item.curso.profesor && (
                    <p className="text-[10px] font-medium text-muted-foreground/60 truncate capitalize">
                      Prof. {item.curso.profesor.apellidoPaterno.toLowerCase()}{" "}
                      • {item.aula || "Lab 2"}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Breaks and Lunch (Full width) */}
          {baseBlocks
            .filter((b) => b.type)
            .map((block, idx) => {
              const range = getRowRange(
                block.start,
                block.fullEnd || block.end,
              );
              if (!range) return null;

              return (
                <div
                  key={`row-break-${idx}`}
                  className="col-start-2 col-end-7 rounded-2xl bg-card/30 border border-border/10 flex items-center justify-center relative overflow-hidden group mb-2"
                  style={{ gridRow: `${range.start} / ${range.end}` }}
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="text-[10px] uppercase tracking-[0.4em] font-black text-muted-foreground/40 drop-shadow-sm">
                    {block.type === "break" ? "Recreo / Break" : "Almuerzo"}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
