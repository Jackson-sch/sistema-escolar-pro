"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers } from "@tabler/icons-react";

interface CapacityGaugeProps {
  occupied: number;
  total: number;
  percentage: number;
}

function getStatusColor(p: number) {
  if (p < 70) return "bg-emerald-500";
  if (p < 90) return "bg-amber-500";
  return "bg-red-500";
}

function getStatusText(p: number) {
  if (p < 70) return "Capacidad Ideal";
  if (p < 90) return "Cerca del Límite";
  return "Capacidad Crítica";
}

export function CapacityGauge({
  occupied,
  total,
  percentage,
}: CapacityGaugeProps) {
  return (
    <Card className="h-full overflow-hidden rounded-2xl border-border/50 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Ocupación Institucional
          </CardTitle>
          <IconUsers className="size-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-3xl font-bold">
                {percentage.toFixed(1)}%
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {occupied} de {total} vacantes ocupadas
              </p>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-[10px] font-bold text-white ${getStatusColor(percentage)}`}
            >
              {getStatusText(percentage)}
            </div>
          </div>

          <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-[color,width] duration-500 ${getStatusColor(percentage)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="flex flex-col border-r pr-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Disponibles
              </span>
              <span className="text-sm font-semibold">{total - occupied}</span>
            </div>
            <div className="flex flex-col pl-2">
              <span className="text-[10px] text-muted-foreground uppercase">
                Meta Año
              </span>
              <span className="text-sm font-semibold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
