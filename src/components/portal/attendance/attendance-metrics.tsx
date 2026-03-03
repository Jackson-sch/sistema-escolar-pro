"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  IconUserCheck,
  IconUserExclamation,
  IconUserMinus,
  IconClock,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AttendanceMetricsProps {
  stats: {
    total: number;
    presentes: number;
    faltas: number;
    tardanzas: number;
    justificadas: number;
  };
}

export function AttendanceMetrics({ stats }: AttendanceMetricsProps) {
  const percentage =
    stats.total > 0 ? (stats.presentes / stats.total) * 100 : 0;

  const items = [
    {
      label: "Asistencias",
      value: stats.presentes,
      icon: IconUserCheck,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Tardanzas",
      value: stats.tardanzas,
      icon: IconClock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Inasistencias",
      value: stats.faltas,
      icon: IconUserMinus,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Justificadas",
      value: stats.justificadas,
      icon: IconUserExclamation,
      color: "text-info",
      bgColor: "bg-info/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <Card
          key={index}
          className="overflow-hidden border-border/50 bg-card/50 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl shadow-inner",
                  item.bgColor,
                  item.color,
                )}
              >
                <item.icon className="size-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {item.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black tabular-nums tracking-tighter">
                    {item.value}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
