"use client";

import {
  IconSchool,
  IconUsers,
  IconClock,
  IconAlertCircle,
  IconTrendingUp,
  IconTrendingDown,
  IconUserCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats?: {
    current: {
      perc: number;
      tasaTardanza: number;
    };
    deltaAsistencia: number;
    deltaTardanza: number;
  };
  meta?: {
    periodLabel?: string;
  };
  totalAlumnos: number;
}

export function StatsGrid({ stats, meta, totalAlumnos }: StatsGridProps) {
  const percAsistencia = stats?.current?.perc || 0;
  const tasaTardanza = stats?.current?.tasaTardanza || 0;
  const tasaPuntualidad = 100 - tasaTardanza;
  const tasaAusentismo = 100 - percAsistencia;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in animation-duration-">
      {/* 1. Tasa de Asistencia General */}
      <StatCard
        title="Tasa de Asistencia"
        value={`${percAsistencia.toFixed(1)}%`}
        progressValue={percAsistencia}
        delta={stats?.deltaAsistencia || 0}
        icon={IconSchool}
        badgeText={percAsistencia >= 90 ? "Óptimo" : percAsistencia >= 75 ? "Regular" : "Alerta"}
        subLabel={meta?.periodLabel || "Consolidado institucional"}
        color={percAsistencia < 75 ? "rose" : percAsistencia < 90 ? "amber" : "emerald"}
      />

      {/* 2. Tasa de Puntualidad */}
      <StatCard
        title="Puntualidad Institucional"
        value={`${tasaPuntualidad.toFixed(1)}%`}
        progressValue={tasaPuntualidad}
        delta={stats?.deltaTardanza ? -stats.deltaTardanza : 0}
        icon={IconClock}
        badgeText={tasaPuntualidad >= 85 ? "A Tiempo" : "Tardanzas"}
        subLabel="Ingresos a tiempo en jornada"
        color={tasaPuntualidad < 80 ? "rose" : tasaPuntualidad < 90 ? "amber" : "indigo"}
      />

      {/* 3. Ausentismo Registrado */}
      <StatCard
        title="Índice de Ausentismo"
        value={`${tasaAusentismo.toFixed(1)}%`}
        progressValue={tasaAusentismo}
        icon={IconAlertCircle}
        badgeText={tasaAusentismo > 15 ? "Alto Riesgo" : "Bajo Ausentismo"}
        subLabel="Inasistencias acumuladas"
        color={tasaAusentismo > 20 ? "rose" : tasaAusentismo > 10 ? "amber" : "emerald"}
      />

      {/* 4. Población Escolar Activa */}
      <StatCard
        title="Población Escolar"
        value={totalAlumnos.toString()}
        icon={IconUsers}
        badgeText="Alumnos Activos"
        subLabel="Matrícula activa en el sistema"
        color="indigo"
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  progressValue?: number;
  delta?: number;
  icon: any;
  subLabel: string;
  badgeText?: string;
  color?: "indigo" | "emerald" | "amber" | "rose";
}

function StatCard({
  title,
  value,
  progressValue,
  delta,
  icon: Icon,
  subLabel,
  badgeText,
  color = "indigo",
}: StatCardProps) {
  const isUp = delta !== undefined && delta > 0;

  const colorStyles = {
    indigo: {
      border: "border-indigo-500/20 hover:border-indigo-500/40",
      bg: "bg-linear-to-br from-indigo-500/[0.04] to-indigo-500/[0.08]",
      iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
      text: "text-indigo-600 dark:text-indigo-400",
      progressBg: "bg-indigo-500/10",
      progressFill: "bg-indigo-500",
      badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      bg: "bg-linear-to-br from-emerald-500/[0.04] to-emerald-500/[0.08]",
      iconBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-600 dark:text-emerald-400",
      progressBg: "bg-emerald-500/10",
      progressFill: "bg-emerald-500",
      badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      bg: "bg-linear-to-br from-amber-500/[0.04] to-amber-500/[0.08]",
      iconBg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
      text: "text-amber-600 dark:text-amber-400",
      progressBg: "bg-amber-500/10",
      progressFill: "bg-amber-500",
      badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/40",
      bg: "bg-linear-to-br from-rose-500/[0.04] to-rose-500/[0.08]",
      iconBg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      text: "text-rose-600 dark:text-rose-400",
      progressBg: "bg-rose-500/10",
      progressFill: "bg-rose-500",
      badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  }[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-200 backdrop-blur-md flex flex-col justify-between space-y-4",
        colorStyles.border,
        colorStyles.bg,
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "size-10 rounded-xl border flex items-center justify-center shrink-0 shadow-xs",
            colorStyles.iconBg,
          )}
        >
          <Icon className="size-5" />
        </div>

        <div className="flex items-center gap-1.5">
          {delta !== undefined && delta !== 0 && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 font-mono",
                isUp
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
              )}
            >
              {isUp ? <IconTrendingUp size={11} /> : <IconTrendingDown size={11} />}
              {Math.abs(delta).toFixed(1)}%
            </Badge>
          )}

          {badgeText && (
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                colorStyles.badge,
              )}
            >
              {badgeText}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          {title}
        </span>
        <div className="flex items-baseline gap-2">
          <h2 className={cn("text-3xl font-black font-mono tracking-tight", colorStyles.text)}>
            {value}
          </h2>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground">{subLabel}</p>
      </div>

      {progressValue !== undefined && (
        <Progress
          value={Math.min(100, Math.max(0, progressValue))}
          className={cn("h-1.5", colorStyles.progressBg)}
          indicatorClassName={colorStyles.progressFill}
        />
      )}
    </div>
  );
}
