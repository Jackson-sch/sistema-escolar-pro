import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconCalendarCheck,
  IconAward,
  IconMinus,
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
    attendanceRate?: number;
    academicAverage?: number;
    prospectsCount?: number;
  };
  isLoading?: boolean;
}

export function SectionCards({ stats, isLoading }: SectionCardsProps) {

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[150px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Recaudación Total",
      value: formatCurrency(stats?.totalRevenue || 0),
      sub: "Ingresos acumulados 2025",
      icon: IconCreditCard,
      trend: "up" as const,
      trendLabel: "+12% vs mes anterior",
      accent: "from-blue-600 to-blue-700",
      light: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
      ring: "ring-blue-100 dark:ring-blue-900",
    },
    {
      title: "Asistencia Semanal",
      value: `${stats?.attendanceRate?.toFixed(1) ?? "0"}%`,
      sub: "Promedio últimos 7 días",
      icon: IconCalendarCheck,
      trend:
        (stats?.attendanceRate ?? 0) >= 85
          ? ("up" as const)
          : ("down" as const),
      trendLabel: (stats?.attendanceRate ?? 0) >= 85 ? "Sobre meta" : "Bajo meta",
      accent: "from-emerald-600 to-teal-600",
      light: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-100 dark:ring-emerald-900",
    },
    {
      title: "Rendimiento Académico",
      value: stats?.academicAverage?.toFixed(2) ?? "—",
      sub: "Promedio institucional",
      icon: IconAward,
      trend: "neutral" as const,
      trendLabel: "Periodo en curso",
      accent: "from-amber-500 to-orange-500",
      light: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
      ring: "ring-amber-100 dark:ring-amber-900",
    },
    {
      title: "Total Estudiantes",
      value: (stats?.totalStudents ?? 0).toLocaleString("es-PE"),
      sub: "Padrón estudiantil activo",
      icon: IconUsers,
      trend: "up" as const,
      trendLabel: `${stats?.activeEnrollments ?? 0} matrículas activas`,
      accent: "from-violet-600 to-purple-700",
      light: "bg-violet-50 dark:bg-violet-950/30",
      iconColor: "text-violet-600 dark:text-violet-400",
      ring: "ring-violet-100 dark:ring-violet-900",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm ring-1 transition-all duration-300",
            "hover:shadow-lg hover:-translate-y-0.5",
            card.ring
          )}
        >
          {/* Decorative gradient blob */}
          <div
            className={cn(
              "absolute -top-6 -right-6 size-24 rounded-full bg-linear-to-br opacity-10 transition-opacity group-hover:opacity-20",
              card.accent
            )}
          />

          {/* Top row */}
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-xl",
                card.light
              )}
            >
              <card.icon className={cn("size-5", card.iconColor)} />
            </div>
            <TrendBadge trend={card.trend} label={card.trendLabel} />
          </div>

          {/* Value */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {card.title}
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              {card.value}
            </p>
          </div>

          {/* Footer */}
          <p className="mt-2 text-[11px] text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

function TrendBadge({
  trend,
  label,
}: {
  trend: "up" | "down" | "neutral";
  label: string;
}) {
  const config = {
    up: {
      icon: IconTrendingUp,
      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    },
    down: {
      icon: IconTrendingDown,
      cls: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400",
    },
    neutral: {
      icon: IconMinus,
      cls: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
    },
  }[trend];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        config.cls
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}