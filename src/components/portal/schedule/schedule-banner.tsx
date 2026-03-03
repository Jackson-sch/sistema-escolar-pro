"use client";

import { Badge } from "@/components/ui/badge";
import { IconClock, IconCalendarStats } from "@tabler/icons-react";

export function ScheduleBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-warning/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-warning/10 text-warning hover:bg-warning/20 transition-colors">
          Horarios Académicos
        </Badge>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
          Organización y{" "}
          <span className="bg-linear-to-r from-warning to-warning/60 bg-clip-text text-transparent">
            Planificación
          </span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground font-medium">
          Consulta el horario semanal de clases, profesores y aulas asignadas
          para tus hijos. Ayúdalos a prepararse para su jornada académica.
        </p>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-warning/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-warning/5 blur-[100px]" />
      <IconClock className="absolute -bottom-10 -right-10 size-64 -rotate-12 text-warning/5 select-none" />
      <IconCalendarStats className="absolute top-1/2 right-1/4 size-32 opacity-[0.03] -translate-y-1/2 select-none" />
    </div>
  );
}
