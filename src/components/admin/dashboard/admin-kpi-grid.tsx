"use client";

import {
  IconSchool,
  IconUsers,
  IconUserShield,
  IconChartBar,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";

interface AdminKpiGridProps {
  stats: {
    instituciones: number;
    estudiantes: number;
    profesores: number;
    admins: number;
  };
}

export function AdminKpiGrid({ stats }: AdminKpiGridProps) {
  const statCards = [
    {
      title: "Instituciones",
      value: stats?.instituciones || 0,
      icon: IconSchool,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      description: "Colegios registrados en el sistema",
    },
    {
      title: "Estudiantes Matriculados",
      value: stats?.estudiantes || 0,
      icon: IconUsers,
      color:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      description: "Alumnos activos en la plataforma",
    },
    {
      title: "Docentes y Personal",
      value: stats?.profesores || 0,
      icon: IconUserShield,
      color:
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      description: "Profesores con carga lectiva",
    },
    {
      title: "Administradores",
      value: stats?.admins || 0,
      icon: IconChartBar,
      color:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      description: "Cuentas con acceso directivo",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="p-5 rounded-2xl border border-border/60 bg-card shadow-xs flex flex-col justify-between transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <div
                className={`size-9 rounded-xl flex items-center justify-center border ${card.color}`}
              >
                <Icon className="size-4.5" />
              </div>
            </div>

            <div>
              <div className="text-3xl font-mono font-black tracking-tight text-foreground">
                {card.value.toLocaleString("es-PE")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
