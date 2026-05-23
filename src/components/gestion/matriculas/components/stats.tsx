import StatCard from "@/components/common/stat-card";
import { IconCertificate, IconSchool, IconUsers } from "@tabler/icons-react";

export default function Stats({ stats }: { stats: any }) {
  const data = [
    {
      title: "METAS A CUMPLIR " + stats.anioAcademico,
      value: stats.metas,
      icon: IconSchool,
      iconColor: "text-indigo-500 dark:text-indigo-400",
      iconBgColor: "bg-indigo-500/10 dark:bg-indigo-500/20",
      description: "Vacantes cubiertas estimadas",
      glowColor: "#4F46E5",
    },
    {
      title: "MATRICULADOS HOY",
      value: stats.matriculadosHoy,
      icon: IconUsers,
      iconColor: "text-emerald-500 dark:text-emerald-400",
      iconBgColor: "bg-emerald-500/10 dark:bg-emerald-500/20",
      description: "Registros procesados hoy",
      glowColor: "#10B981",
    },
    {
      title: "SITUACIÓN REGULAR",
      value: stats.situacionRegular,
      icon: IconCertificate,
      iconColor: "text-orange-500 dark:text-orange-400",
      iconBgColor: "bg-orange-500/10 dark:bg-orange-500/20",
      description: "Alumnos ratificados exitosamente",
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
