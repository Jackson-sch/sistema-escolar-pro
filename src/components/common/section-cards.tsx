import {
  IconTrendingUp,
  IconTrendingDown,
  IconUsers,
  IconCreditCard,
  IconCalendarCheck,
  IconAward,
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
      sub: "Ingresos confirmados",
      icon: IconCreditCard,
      trend: "up" as const,
      trendLabel: "Cobranza activa",
      accent: "from-blue-600 to-indigo-600",
      light: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
    },
    {
      title: "Morosidad (Vencido)",
      value: formatCurrency(stats?.totalOverdue || 0),
      sub: "Deuda vencida acumulada",
      icon: IconAlertTriangle,
      trend: (stats?.totalOverdue || 0) > 1000 ? ("down" as const) : ("neutral" as const),
      trendLabel: (stats?.totalOverdue || 0) > 0 ? "Requiere gestión" : "En orden",
      accent: "from-red-600 to-rose-600",
      light: "bg-red-500/10 text-red-600 dark:text-red-400",
      ring: "ring-red-500/20",
    },
    {
      title: "Asistencia Hoy",
      value: `${stats?.attendanceRate?.toFixed(1) ?? "0"}%`,
      sub: "Monitor en tiempo real",
      icon: IconCalendarCheck,
      trend: (stats?.attendanceRate ?? 0) >= 90 ? ("up" as const) : ("down" as const),
      trendLabel: (stats?.attendanceRate ?? 0) >= 90 ? "Excelente" : "Seguimiento",
      accent: "from-emerald-600 to-teal-600",
      light: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      ring: "ring-emerald-500/20",
    },
    {
      title: "Total Estudiantes",
      value: (stats?.totalStudents ?? 0).toLocaleString("es-PE"),
      sub: `${stats?.activeEnrollments ?? 0} matrículas activas`,
      icon: IconUsers,
      trend: "up" as const,
      trendLabel: "Padrón activo",
      accent: "from-violet-600 to-purple-600",
      light: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
      ring: "ring-violet-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className={cn(
            "liquid-glass group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-500",
            "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5"
          )}
        >
          {/* Animated Blob Background */}
          <div
            className={cn(
              "absolute -top-12 -right-12 size-32 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40 animate-blob",
              card.accent
            )}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-2xl border border-white/10 shadow-inner",
                  card.light
                )}
              >
                <card.icon className="size-6" />
              </div>
              <TrendBadge trend={card.trend} label={card.trendLabel} />
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                {card.title}
              </p>
              <p className="mt-1 text-3xl font-black tracking-tight text-foreground drop-shadow-sm">
                {card.value}
              </p>
            </div>
          </div>

          <div className="relative z-10 mt-4 pt-4 border-t border-white/5">
            <p className="text-xs font-medium text-muted-foreground/80">
              {card.sub}
            </p>
          </div>
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
      cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    down: {
      icon: IconTrendingDown,
      cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    },
    neutral: {
      icon: IconMinus,
      cls: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    },
  }[trend];

  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold shadow-sm",
        config.cls
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}