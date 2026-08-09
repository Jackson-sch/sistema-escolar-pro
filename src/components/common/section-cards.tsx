import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconCalendarCheck,
  IconMinus,
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
          <Skeleton key={i} className="h-[130px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Recaudación Total",
      value: formatCurrency(stats?.totalRevenue || 0),
      sub: "Ingresos confirmados en caja",
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
        (stats?.totalOverdue || 0) > 0 ? "Requiere gestión" : "En orden",
      iconColor: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "Asistencia Hoy",
      value: `${stats?.attendanceRate?.toFixed(1) ?? "0"}%`,
      sub: "Monitor de presencia diaria",
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
      sub: `${stats?.activeEnrollments ?? 0} matrículas activas`,
      icon: IconUsers,
      trend: "up" as const,
      trendLabel: "Padrón activo",
      iconColor: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10 border-violet-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex items-center justify-between transition-[background-color,box-shadow,transform] hover:bg-card hover:shadow-md hover:-translate-y-0.5",
          )}
        >
          <div className="space-y-1 min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                {card.title}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-mono text-foreground truncate">
              {card.value}
            </h3>
            <p className="text-[11px] text-muted-foreground/80 truncate">
              {card.sub}
            </p>
          </div>

          <div
            className={cn(
              "size-11 rounded-xl border flex items-center justify-center shrink-0 shadow-xs",
              card.iconBg,
              card.iconColor,
            )}
          >
            <card.icon className="size-5" />
          </div>
        </div>
      ))}
    </div>
  );
}
