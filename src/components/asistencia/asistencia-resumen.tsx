import React from "react";
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconX,
  IconChartBar,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AlumnoAsistencia {
  id: string;
  estado: string;
}

interface AsistenciaResumenProps {
  alumnos: AlumnoAsistencia[];
}

export function AsistenciaResumen({ alumnos }: AsistenciaResumenProps) {
  const total = alumnos.length;
  const presentes = alumnos.filter((a) => a.estado === "presente").length;
  const tardanzas = alumnos.filter((a) => a.estado === "tarde").length;
  const ausentes = alumnos.filter((a) => a.estado === "ausente").length;

  const registrados = alumnos.filter((a) => a.estado !== "").length;
  const porcentajeProgreso = total > 0 ? (registrados / total) * 100 : 0;

  const stats = [
    {
      label: "TOTAL INSCRITOS",
      value: total,
      icon: IconUsers,
      color: "bg-primary/5 border-primary/20",
      iconColor: "bg-primary/20 text-primary",
      valueColor: "text-primary",
    },
    {
      label: "PRESENTES",
      value: presentes,
      icon: IconCheck,
      color: "bg-emerald-500/5 border-emerald-500/20",
      iconColor: "bg-emerald-500/20 text-emerald-500",
      valueColor: "text-emerald-500",
    },
    {
      label: "TARDANZAS",
      value: tardanzas,
      icon: IconClock,
      color: "bg-amber-500/5 border-amber-500/20",
      iconColor: "bg-amber-500/20 text-amber-500",
      valueColor: "text-amber-500",
    },
    {
      label: "AUSENTES",
      value: ausentes,
      icon: IconX,
      color: "bg-rose-500/5 border-rose-500/20",
      iconColor: "bg-rose-500/20 text-rose-500",
      valueColor: "text-rose-500",
    },
  ];

  return (
    <div className="bg-card backdrop-blur-md p-5 rounded-3xl border sticky top-8 shadow-xl">
      <h2 className="text-sm font-bold mb-6 tracking-[0.2em] flex items-center gap-3 text-white/40 uppercase">
        <IconChartBar className="size-4 text-primary" />
        Resumen de Hoy
      </h2>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-2xl border flex items-center justify-between transition-all hover:bg-muted/20 group",
              "bg-muted border-muted",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                  stat.iconColor,
                )}
              >
                <stat.icon className="size-5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <span
              className={cn(
                "text-2xl font-black tabular-nums",
                stat.valueColor,
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-muted">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            Progreso del Registro
          </span>
          <span className="text-sm font-black text-primary tabular-nums">
            {Math.round(porcentajeProgreso)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden p-[2px]">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)] relative"
            style={{ width: `${porcentajeProgreso}%` }}
          >
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-yellow-500/20 to-transparent animate-shimmer" />
          </div>
        </div>
        <p className="text-center mt-5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic">
          {porcentajeProgreso === 100 ? "Completado" : "Sincronizando..."}
        </p>
      </div>
    </div>
  );
}
