"use client";

import { Badge } from "@/components/ui/badge";
import { IconCertificate, IconChartBar } from "@tabler/icons-react";

export function NotasBanner() {
  return (
    <div className="group relative overflow-hidden rounded-[2.5rem] border border-academic/20 bg-card/30 p-8 sm:p-10 backdrop-blur-xl transition-all duration-500 hover:border-academic/40 hover:shadow-2xl hover:shadow-academic/10 @container/banner">
      <div className="relative z-10 flex flex-col gap-4 md:max-w-[75%]">
        <div className="flex items-center gap-2">
          <Badge className="w-fit border-none bg-academic/10 text-academic font-bold px-3 py-1 rounded-lg">
            SISTEMA ÉLITE
          </Badge>
          <div className="h-px w-12 bg-academic/20" />
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            Seguimiento Académico Pro
          </span>
        </div>

        <h1 className="flex flex-col gap-1 text-4xl font-black tracking-tight sm:text-6xl text-foreground">
          <span className="opacity-90">Calificaciones</span>
          <span className="bg-linear-to-r from-academic via-academic/80 to-academic/40 bg-clip-text text-transparent">
            y Rendimiento
          </span>
        </h1>

        <p className="max-w-xl text-balance text-lg sm:text-xl text-muted-foreground/80 font-medium leading-relaxed">
          Panel de control ejecutivo para la gestión y monitoreo del progreso
          académico en tiempo real.
          <span className="hidden sm:inline">
            {" "}
            Analiza tendencias, resultados y áreas de oportunidad.
          </span>
        </p>
      </div>

      {/* Luxury Background Elements */}
      <div className="absolute -right-32 -top-32 size-96 rounded-full bg-academic/20 blur-[140px] animate-pulse duration-8000" />
      <div className="absolute -bottom-32 -left-32 size-80 rounded-full bg-academic/10 blur-[120px] animate-pulse duration-10000" />

      <div className="absolute top-1/2 right-12 -translate-y-1/2 flex items-center justify-center pointer-events-none opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
        <IconCertificate className="size-64 text-academic" />
      </div>

      <div className="absolute bottom-12 right-24 pointer-events-none opacity-[0.03] rotate-12 transition-all duration-700 group-hover:-translate-x-4">
        <IconChartBar className="size-48 text-academic" />
      </div>

      {/* Premium Border Glow */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 pointer-events-none shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]" />
    </div>
  );
}
