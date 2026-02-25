import {
  IconTrendingUp,
  IconUsers,
  IconBriefcase,
  IconSchool,
  IconCreditCard,
  IconCalendarCheck,
  IconAward,
  IconTarget,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: "Recaudación Total",
      value: formatCurrency(stats?.totalRevenue || 0),
      description: "Ingresos acumulados 2025",
      icon: IconCreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50/50",
      border: "border-blue-100",
      badge: "Institucional",
    },
    {
      title: "Asistencia Semanal",
      value: `${stats?.attendanceRate?.toFixed(1) || "0"}%`,
      description: "Promedio de presencia ayer y hoy",
      icon: IconCalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50/50",
      border: "border-emerald-100",
      badge: "+2% vs ayer",
    },
    {
      title: "Rendimiento Académico",
      value: stats?.academicAverage?.toFixed(2) || "0.00",
      description: "Promedio Institucional",
      icon: IconAward,
      color: "text-amber-600",
      bg: "bg-amber-50/50",
      border: "border-amber-100",
      badge: "Estándar",
    },
    {
      title: "Total Estudiantes",
      value: stats?.totalStudents?.toLocaleString() || "0",
      description: "Padrón estudiantil activo",
      icon: IconUsers,
      color: "text-slate-600",
      bg: "bg-slate-50/50",
      border: "border-slate-100",
      badge: "General",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className={cn(
            "relative overflow-hidden border shadow-sm transition-all hover:shadow-md",
            card.border,
          )}
        >
          <div
            className={cn("absolute top-0 right-0 p-3 opacity-10", card.color)}
          >
            <card.icon className="size-16 -mr-4 -mt-4" />
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="font-medium">
                {card.title}
              </CardDescription>
              <card.icon className={cn("size-4", card.color)} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {card.value}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex items-center justify-between pt-0 pb-3">
            <span className="text-[11px] text-muted-foreground font-medium">
              {card.description}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] py-0 h-4 border-muted/50"
            >
              {card.badge}
            </Badge>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
