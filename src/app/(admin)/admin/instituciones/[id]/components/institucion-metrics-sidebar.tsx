"use client";

import {
  IconUsers,
  IconSchool,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InstitucionMetricsSidebarProps {
  metrics: {
    users: number;
    niveles: number;
    sedes: number;
    periodos: number;
  };
  institucionId: string;
}

export function InstitucionMetricsSidebar({
  metrics,
  institucionId,
}: InstitucionMetricsSidebarProps) {
  const items = [
    {
      label: "Usuarios Totales",
      value: metrics.users,
      icon: IconUsers,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      label: "Niveles Académicos",
      value: metrics.niveles,
      icon: IconSchool,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      label: "Sedes Operativas",
      value: metrics.sedes,
      icon: IconMapPin,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      label: "Periodos Lectivos",
      value: metrics.periodos,
      icon: IconCalendar,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 rounded-2xl border border-border/60 bg-card shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Métricas de la Institución
        </h3>

        <div className="space-y-4">
          {items.map((i) => {
            const Icon = i.icon;
            return (
              <div
                key={i.label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-8 rounded-lg flex items-center justify-center ${i.color}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {i.label}
                  </span>
                </div>
                <span className="text-base font-mono font-bold text-foreground">
                  {i.value}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
