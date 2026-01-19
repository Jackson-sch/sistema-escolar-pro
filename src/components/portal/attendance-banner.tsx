"use client";

import { Badge } from "@/components/ui/badge";
import { IconCalendarCheck, IconShieldCheck } from "@tabler/icons-react";

export function AttendanceBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors">
          Control de Asistencia
        </Badge>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
          Seguridad y{" "}
          <span className="bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
            Puntualidad
          </span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground font-medium">
          Monitorea la asistencia diaria de tus hijos en tiempo real. La
          puntualidad es un valor fundamental para el éxito académico.
        </p>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-emerald-600/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-teal-500/10 blur-[100px]" />
      <IconCalendarCheck className="absolute -bottom-10 -right-10 size-64 -rotate-12 text-emerald-500/5 select-none" />
      <IconShieldCheck className="absolute top-1/2 right-1/4 size-32 opacity-[0.03] -translate-y-1/2 select-none" />
    </div>
  );
}
