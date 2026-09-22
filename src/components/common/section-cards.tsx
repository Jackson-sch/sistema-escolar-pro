import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconCalendarCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formats";

interface SectionCardsProps {
  stats?: {
    totalStudents: number;
    totalStaff: number;
    activeEnrollments: number;
    totalRevenue: number;
    totalOverdue?: number;
    totalPending?: number;
    attendanceRate?: number;
    academicAverage?: number;
    prospectsCount?: number;
  };
  isLoading?: boolean;
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Recaudación Total",
      value: formatCurrency(stats?.totalRevenue || 0),
      sub: "Ingresos liquidados en caja",
      icon: IconCreditCard,
      trend: "up" as const,
      trendLabel: "Cobranza activa",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: "Morosidad (Vencido)",
      value: formatCurrency(stats?.totalOverdue || 0),
      sub: "Deuda acumulada por cobrar",
      icon: IconAlertTriangle,
      trend:
        (stats?.totalOverdue || 0) > 1000
          ? ("down" as const)
          : ("neutral" as const),
      trendLabel:
        (stats?.totalOverdue || 0) > 0 ? "Gestión requerida" : "Sin morosidad",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Asistencia de Hoy",
      value: `${stats?.attendanceRate?.toFixed(1) ?? "0"}%`,
      sub: "Presencia de alumnos en aula",
      icon: IconCalendarCheck,
      trend:
        (stats?.attendanceRate ?? 0) >= 90
          ? ("up" as const)
          : ("down" as const),
      trendLabel:
        (stats?.attendanceRate ?? 0) >= 90 ? "Excelente" : "Seguimiento",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Padrón Estudiantil",
      value: (stats?.totalStudents ?? 0).toLocaleString("es-PE"),
      sub: `${stats?.activeEnrollments ?? 0} matrículas vigentes`,
      icon: IconUsers,
      trend: "up" as const,
      trendLabel: "Población activa",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="p-5 rounded-2xl bg-card border border-border/60 shadow-xs flex flex-col justify-between transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-sm"
        >
          {/* Fila superior: Título a la izquierda y el icono a un costado a la misma altura */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
              {card.title}
            </span>
            <div
              className={cn(
                "size-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs",
                card.iconBg,
                card.iconColor,
              )}
            >
              <card.icon className="size-4.5" />
            </div>
          </div>

          {/* Fila inferior: Cifra y descripción */}
          <div className="space-y-1">
            <h3 className="text-2xl font-mono font-black tracking-tight text-foreground truncate">
              {card.value}
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              {card.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
