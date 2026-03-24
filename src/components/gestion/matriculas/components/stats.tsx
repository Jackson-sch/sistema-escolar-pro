import StatCard from "@/components/common/stat-card";
import { IconCertificate, IconSchool, IconUsers } from "@tabler/icons-react";

export default function Stats({ stats }: { stats: any }) {
  const data = [
    {
      title: "METAS A CUMPLIR " + stats.anioAcademico,
      value: stats.metas,
      icon: IconSchool,
      iconColor: "text-blue-400",
      iconBgColor: "bg-blue-400/10",
      description: "Vacantes cubiertas estimadas",
      glowColor: "#0000FF",
    },
    {
      title: "MATRICULADOS HOY",
      value: stats.matriculadosHoy,
      icon: IconUsers,
      iconColor: "text-green-400",
      iconBgColor: "bg-green-400/10",
      description: "Registros procesados hoy",
      glowColor: "#0000FF",
    },
    {
      title: "SITUACIÓN REGULAR",
      value: stats.situacionRegular,
      icon: IconCertificate,
      iconColor: "text-orange-400",
      iconBgColor: "bg-orange-400/10",
      description: "Alumnos ratificados exitosamente",
      glowColor: "#0000FF",
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
