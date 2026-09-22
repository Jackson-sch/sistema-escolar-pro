"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportStatCardProps {
  title: string;
  value: string;
  description: string;
  icon: any;
  color?: "primary" | "emerald" | "red" | "amber" | "violet";
  trend?: { value: number; isUp: boolean };
  progress?: number;
  delay?: number;
  subValue?: string;
}

const REPORT_STAT_COLORS: Record<
  NonNullable<ReportStatCardProps["color"]>,
  { icon: string; bar: string; glow: string; badge: string }
> = {
  primary: {
    icon: "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    bar: "bg-blue-600",
    glow: "hover:border-blue-500/30",
    badge: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  },
  emerald: {
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    bar: "bg-emerald-500",
    glow: "hover:border-emerald-500/30",
    badge: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  },
  red: {
    icon: "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
    bar: "bg-rose-500",
    glow: "hover:border-rose-500/30",
    badge: "text-rose-600 bg-rose-500/10 border-rose-500/20",
  },
  amber: {
    icon: "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    bar: "bg-amber-500",
    glow: "hover:border-amber-500/30",
    badge: "text-amber-600 bg-amber-500/10 border-amber-500/20",
  },
  violet: {
    icon: "text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20",
    bar: "bg-violet-500",
    glow: "hover:border-violet-500/30",
    badge: "text-violet-600 bg-violet-500/10 border-violet-500/20",
  },
};

export function ReportStatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "primary",
  trend,
  progress,
  delay = 0,
  subValue,
}: ReportStatCardProps) {
  const c = REPORT_STAT_COLORS[color];

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-card/70 backdrop-blur-xs border border-border/60 rounded-2xl shadow-2xs transition-all duration-200 hover:shadow-xs hover:border-border/80 group",
        c.glow,
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <CardContent className="p-3.5 sm:p-4">
        {/* Fila Superior: Icono, Título y Trend Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={cn(
                "size-8 rounded-xl flex items-center justify-center border shadow-2xs shrink-0 transition-transform group-hover:scale-105",
                c.icon,
              )}
            >
              <Icon size={16} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </span>
          </div>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-0.5 text-[10px] font-black font-mono px-1.5 py-0.5 rounded-md border shrink-0",
                trend.isUp
                  ? "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                  : "text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20",
              )}
            >
              {trend.isUp ? (
                <ArrowUpRight size={11} />
              ) : (
                <ArrowDownRight size={11} />
              )}
              {trend.value.toFixed(0)}%
            </div>
          )}
        </div>

        {/* Fila Central: Valor Principal Calibrado */}
        <div className="space-y-0.5">
          <h4 className="text-base sm:text-lg lg:text-xl font-black font-mono tracking-tight text-foreground truncate">
            {value}
          </h4>
          <p className="text-[11px] text-muted-foreground font-normal truncate">
            {description}
          </p>
          {subValue && (
            <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 truncate">
              {subValue}
            </p>
          )}
        </div>

        {/* Fila Inferior: Micro Barra de Progreso Integrada */}
        {progress !== undefined && (
          <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between gap-2">
            <div className="flex-1 bg-muted/60 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700 ease-out", c.bar)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground font-mono shrink-0">
              {progress.toFixed(0)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

