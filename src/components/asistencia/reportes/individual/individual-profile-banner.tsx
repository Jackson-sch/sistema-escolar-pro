"use client";

import { IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface IndividualProfileBannerProps {
  estudianteNombre: string;
  totalDiasEvaluados: number;
  tasaGlobal: number;
}

export function IndividualProfileBanner({
  estudianteNombre,
  totalDiasEvaluados,
  tasaGlobal,
}: IndividualProfileBannerProps) {
  const initials = estudianteNombre
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/90 via-slate-900 to-indigo-900/80 p-6 text-white shadow-xl border border-indigo-500/20">
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 size-[300px] rounded-full bg-indigo-500/15 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Avatar className="size-14 rounded-2xl border-2 border-indigo-400/30 shadow-md">
            <AvatarFallback className="bg-indigo-600/50 text-white font-black text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider gap-1">
                <IconSparkles className="size-3" />
                Perfil de Asistencia Individual
              </Badge>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white uppercase">
              {estudianteNombre}
            </h3>
            <p className="text-xs text-indigo-200/80 font-medium">
              {totalDiasEvaluados} Días Lectivos Monitoreados en el Periodo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200/70">
              Índice Global
            </span>
            <div className="text-2xl font-black font-mono text-white tracking-tight">
              {tasaGlobal.toFixed(1)}%
            </div>
          </div>
          <Badge
            className={cn(
              "rounded-xl px-2.5 py-1 font-bold text-xs uppercase border-0 shadow-sm",
              tasaGlobal >= 90
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : tasaGlobal >= 75
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30",
            )}
          >
            {tasaGlobal >= 90 ? "Óptimo" : tasaGlobal >= 75 ? "Regular" : "Atención"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
