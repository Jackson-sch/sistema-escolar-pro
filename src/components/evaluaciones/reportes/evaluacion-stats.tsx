import { StatCard } from "@/components/common/stat-card";
import { IconChartBar, IconUsers, IconAlertTriangle, IconAward } from "@tabler/icons-react";

interface EvaluacionStatsProps {
  totalEvaluaciones: number;
  totalNotas: number;
  sinCalificar: number;
  promedioGeneral: number;
}

export function EvaluacionStats({
  totalEvaluaciones,
  totalNotas,
  sinCalificar,
  promedioGeneral,
}: EvaluacionStatsProps) {
  const data = [
    {
      title: "Total Evaluaciones",
      value: totalEvaluaciones,
      icon: IconChartBar,
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBgColor: "bg-violet-500/10 border border-violet-500/20",
      description: "Programadas esta gestión",
    },
    {
      title: "Notas Registradas",
      value: totalNotas,
      icon: IconUsers,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBgColor: "bg-emerald-500/10 border border-emerald-500/20",
      description: "Ingresadas al sistema",
    },
    {
      title: "Sin Calificar",
      value: sinCalificar,
      icon: IconAlertTriangle,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBgColor: "bg-amber-500/10 border border-amber-500/20",
      description: "Evaluaciones pendientes",
    },
    {
      title: "Promedio General",
      value: promedioGeneral.toFixed(1),
      icon: IconAward,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBgColor: "bg-blue-500/10 border border-blue-500/20",
      description: "Escala vigesimal (estimado)",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {data.map((stat) => (
        <StatCard key={stat.title} {...stat as any} />
      ))}
    </div>
  );
}
