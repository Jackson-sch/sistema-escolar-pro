"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconBook,
  IconUser,
  IconMapPin,
  IconCircleFilled,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface Horario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
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
    { label: "Lunes", value: 1 },
    { label: "Martes", value: 2 },
    { label: "Miércoles", value: 3 },
    { label: "Jueves", value: 4 },
    { label: "Viernes", value: 5 },
  ];

  const getHorariosPorDia = (dia: number) => {
    return horarios
      .filter((h) => h.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5 animate-in fade-in zoom-in duration-500">
      {dias.map((dia) => (
        <div key={dia.value} className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <IconCircleFilled className="size-2 text-primary/40" />
            <h3 className="font-black text-sm uppercase tracking-[0.2em] text-muted-foreground/80">
              {dia.label}
            </h3>
          </div>

          <div className="space-y-3">
            {getHorariosPorDia(dia.value).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/50 p-6 text-center">
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                  Sin actividades
                </p>
              </div>
            ) : (
              getHorariosPorDia(dia.value).map((item) => (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] cursor-default border-border/50 bg-card/40 hover:bg-card/80"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/70">
                      <span className="flex items-center gap-1">
                        <IconClock className="size-3" />
                        {item.horaInicio} - {item.horaFin}
                      </span>
                    </div>

                    <h4 className="font-black text-sm leading-tight line-clamp-2">
                      {item.curso.nombre}
                    </h4>

                    <div className="space-y-1.5 border-t border-border/20 pt-2">
                      {item.curso.profesor && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                          <IconUser className="size-3 text-primary/50" />
                          <span className="truncate leading-none">
                            {item.curso.profesor.name}{" "}
                            {item.curso.profesor.apellidoPaterno}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                        <IconMapPin className="size-3 text-primary/50" />
                        <span>Aula asignada</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
