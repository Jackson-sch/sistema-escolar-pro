"use client";

import { Badge } from "@/components/ui/badge";

export function AttendanceBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-success/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-success/10 text-success hover:bg-success/20 transition-colors">
          Control de Asistencia
        </Badge>
        <h1 className="flex items-center gap-3 text-xl md:text-3xl font-black tracking-tight sm:text-4xl">
          Seguridad y{" "}
          <span className="bg-linear-to-r from-success to-success/60 bg-clip-text text-transparent">
            Puntualidad
          </span>
        </h1>
        <p className="max-w-xl text-balance text-sm text-muted-foreground font-medium">
          Monitorea la asistencia diaria de tus hijos en tiempo real. La
          puntualidad es un valor fundamental para el éxito académico.
        </p>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-success/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-success/5 blur-[100px]" />
    </div>
  );
}
