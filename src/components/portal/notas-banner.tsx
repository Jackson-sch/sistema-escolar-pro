"use client";

import { Badge } from "@/components/ui/badge";
import { IconCertificate, IconChartBar } from "@tabler/icons-react";

export function NotasBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-academic/20 bg-card/50 p-8 @container/banner">
      <div className="relative z-10 flex flex-col gap-3 md:max-w-[70%]">
        <Badge className="w-fit border-none bg-academic/10 text-academic hover:bg-academic/20 transition-colors">
          Seguimiento Académico
        </Badge>
        <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl">
          Calificaciones y{" "}
          <span className="bg-linear-to-r from-academic to-academic/60 bg-clip-text text-transparent">
            Rendimiento
          </span>
        </h1>
        <p className="max-w-xl text-balance text-lg text-muted-foreground font-medium">
          Consulta las notas de tus hijos en tiempo real y realiza un
          seguimiento detallado de su progreso escolar por cada bimestre.
        </p>
      </div>

      {/* Abstract background elements */}
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-academic/10 blur-[120px]" />
      <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-academic/5 blur-[100px]" />
      <IconCertificate className="absolute -bottom-10 -right-10 size-64 -rotate-12 text-academic/5 select-none" />
      <IconChartBar className="absolute top-1/2 right-1/4 size-32 opacity-[0.03] -translate-y-1/2 select-none" />
    </div>
  );
}
