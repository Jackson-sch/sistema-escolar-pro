"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  IconTrophy,
  IconPercentage,
  IconChartInfographic,
} from "@tabler/icons-react";

interface StatsSummaryProps {
  promedio: number;
  asistencia: number;
  ranking: string;
}

export function NotasStatsSummary({
  promedio,
  asistencia,
  ranking,
}: StatsSummaryProps) {
  const stats = [
    {
      label: "Promedio General",
      value: `${promedio.toFixed(1)}/20`,
      icon: IconChartInfographic,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      glow: "shadow-blue-500/10",
    },
    {
      label: "Asistencia Total",
      value: `${asistencia}%`,
      icon: IconPercentage,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    {
      label: "Posición Ranking",
      value: ranking,
      icon: IconTrophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className={cn(
            "group relative overflow-hidden rounded-[2rem] border p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl",
            stat.bg,
            stat.border,
            stat.glow,
          )}
        >
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "flex size-14 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6",
                stat.bg,
                stat.color,
              )}
            >
              <stat.icon className="size-8" />
            </div>

            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                {stat.label}
              </p>
              <h3
                className={cn("text-2xl font-black tracking-tight", stat.color)}
              >
                {stat.value}
              </h3>
            </div>
          </div>

          {/* Decorative background circle */}
          <div
            className={cn(
              "absolute -right-8 -top-8 size-24 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150",
              stat.bg,
            )}
          />
        </Card>
      ))}
    </div>
  );
}
