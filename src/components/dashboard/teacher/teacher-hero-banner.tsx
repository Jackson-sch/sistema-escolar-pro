"use client";

import { IconSparkles, IconUserCheck, IconClipboardCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TeacherHeroBannerProps {
  fechaHoy: string;
}

export function TeacherHeroBanner({ fechaHoy }: TeacherHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
      {/* Glow Accent Circles */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 size-[400px] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 size-[300px] rounded-full bg-violet-600/15 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-indigo-500/25 hover:bg-indigo-500/30 border-indigo-400/30 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <IconSparkles size={13} className="text-indigo-300 animate-pulse" />
              Portal Pedagógico
            </Badge>
            <Badge variant="outline" className="text-xs font-medium border-white/20 text-white/80 capitalize bg-white/5 backdrop-blur-md">
              {fechaHoy}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Panel de Control Docente
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Supervisión de aulas asignadas, toma de asistencia rápida y seguimiento de calificaciones en tiempo real.
          </p>
        </div>

        {/* Quick Action Hub */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 transition-colors duration-200 text-xs sm:text-sm h-10 px-4.5 gap-2 cursor-pointer border border-indigo-400/30"
            asChild
          >
            <Link href="/asistencia">
              <IconUserCheck size={16} />
              <span>Tomar Asistencia</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm h-10 px-4 gap-2 backdrop-blur-md cursor-pointer transition-colors"
            asChild
          >
            <Link href="/evaluaciones">
              <IconClipboardCheck size={16} />
              <span>Gestionar Evaluaciones</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
