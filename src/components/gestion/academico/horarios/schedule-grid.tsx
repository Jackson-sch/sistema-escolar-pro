"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconTrash, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { DIAS, BLOQUES_HORARIO } from "@/lib/constants";

interface ScheduleGridProps {
  horarios: any[];
  onDelete: (id: string) => void;
}

export function ScheduleGrid({ horarios, onDelete }: ScheduleGridProps) {
  // Función para obtener cursos en un slot específico
  const getCourseInSlot = (dia: number, horaInicioBloque: string) => {
    return horarios.filter((h) => {
      if (h.diaSemana !== dia) return false;

      // Comprobar si el bloque actual está dentro del rango [horaInicio, horaFin)
      const hInicio = h.horaInicio;
      const hFin = h.horaFin;

      // Si el inicio coincide exactamente, es el bloque principal
      if (hInicio === horaInicioBloque) return true;

      // Si no coincide exactamente, comprobamos si el bloque actual está contenido
      // Ej: Clase 07:00 -> 08:30. Bloque actual 07:45.
      // 07:45 está entre 07:00 y 08:30? Sí.

      // Convertimos a minutos para comparar fácilmente
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
    <div className="overflow-x-auto rounded-2xl border border-primary/10 shadow-xl backdrop-blur-md">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-primary/10 ">
            <th className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 border-r border-primary/10  w-28">
              HORARIO
            </th>
            {DIAS.map((dia) => (
              <th
                key={dia.id}
                className="p-4 text-center text-[10px] font-bold uppercase tracking-widest text-foreground/80 border-r border-primary/10  min-w-44"
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
                "border-b border-primary/10  transition-colors",
                bloque.tipo === "receso"
                  ? "bg-violet-500/5"
                  : "hover:bg-white/2",
                timeIdx % 2 === 0 ? "bg-transparent" : "bg-white/1",
              )}
            >
              <td className="p-3 text-center border-r border-primary/10  bg-background/20">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-black text-foreground tabular-nums">
                    {bloque.inicio}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                    {bloque.fin}
                  </span>
                </div>
              </td>

              {bloque.tipo === "receso" ? (
                <td
                  colSpan={DIAS.length}
                  className="p-0 h-12 relative overflow-hidden"
                >
                  <div className="absolute inset-0 flex items-center justify-center gap-4 bg-linear-to-r from-transparent via-violet-500/10 to-transparent">
                    <div className="h-px flex-1 bg-violet-500/20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-violet-400 flex items-center gap-2">
                      ☕ RECESO ESCOLAR (30 min)
                    </span>
                    <div className="h-px flex-1 bg-violet-500/20" />
                  </div>
                </td>
              ) : (
                DIAS.map((dia) => {
                  const slots = getCourseInSlot(
                    parseInt(dia.id),
                    bloque.inicio,
                  );
                  return (
                    <td
                      key={dia.id}
                      className="p-2 border-r border-primary/10  align-top h-24 relative group"
                    >
                      <div className="flex flex-col gap-2 h-full">
                        {slots.map((slot) => {
                          const areaColor =
                            slot.curso.areaCurricular.color || "#3b82f6";
                          return (
                            <div
                              key={slot.id}
                              className="p-3 rounded-lg border border-primary/10  shadow-md relative overflow-hidden group/card transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                              style={{
                                borderLeft: `2px solid ${areaColor}`,
                                backgroundColor: `${areaColor}15`,
                              }}
                            >
                              <div className="absolute top-1 right-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-6 text-red-500 hover:bg-red-500/20 rounded-full"
                                  onClick={() => onDelete(slot.id)}
                                >
                                  <IconTrash className="size-3" />
                                </Button>
                              </div>

                              <h4 className="text-[10px] font-black leading-tight text-foreground uppercase mb-1.5 tracking-tight line-clamp-2">
                                {slot.curso.nombre}
                              </h4>

                              <div className="space-y-1">
                                <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1.5 truncate capitalize">
                                  <span
                                    className="size-1 rounded-full shrink-0"
                                    style={{ backgroundColor: areaColor }}
                                  />
                                  {slot.curso.profesor.name}{" "}
                                  {slot.curso.profesor.apellidoPaterno}
                                </p>
                                {slot.aula && (
                                  <div className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                    <IconClock className="size-2.5" />
                                    <span>{slot.aula}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
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
