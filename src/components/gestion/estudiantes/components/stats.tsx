import StatCard from "@/components/common/stat-card";
import { IconSchool, IconUsers, IconUserPlus } from "@tabler/icons-react";

interface StudentStatsProps {
  stats: {
    totalStudents: number;
    activeEnrollments: number;
    newEnrollments: number;
    currentYear: number;
  };
}

export default function StudentStats({ stats }: StudentStatsProps) {
  const data = [
    {
      title: "PADRÓN TOTAL",
      value: stats.totalStudents,
      icon: IconUsers,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      description: "Estudiantes registrados en la base de datos",
      glowColor: "#4F46E5",
    },
    {
      title: "MATRÍCULA ACTIVA " + stats.currentYear,
      value: stats.activeEnrollments,
      icon: IconSchool,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      description: "Alumnos formalizados en el ciclo actual",
      glowColor: "#10B981",
    },
    {
      title: "NUEVOS ALUMNOS " + stats.currentYear,
      value: stats.newEnrollments,
      icon: IconUserPlus,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBgColor: "bg-orange-500/10 dark:bg-orange-500/20",
      description: "Nuevos ingresos registrados en este periodo",
      glowColor: "#F97316",
    },
  ];

  return (
    <>
      {data.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </>
  );
}
