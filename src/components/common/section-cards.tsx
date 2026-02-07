import {
  IconTrendingDown,
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
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-[160px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 px-2 sm:grid-cols-2 lg:grid-cols-4">
      {/* INGRESOS TOTALES */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Recaudación Total</CardDescription>
            <IconCreditCard className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(stats?.totalRevenue || 0)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              Institucional
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Ingresos acumulados 2025
          </div>
          <div className="text-muted-foreground">
            Basado en pagos registrados
          </div>
        </CardFooter>
      </Card>

      {/* ESTUDIANTES */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Total Estudiantes</CardDescription>
            <IconUsers className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalStudents?.toLocaleString() || "0"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              General
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Padrón estudiantil activo
          </div>
          <div className="text-muted-foreground">Incluye todos los niveles</div>
        </CardFooter>
      </Card>

      {/* ASISTENCIA SEMANAL */}
      <Card className="@container/card border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Asistencia Semanal</CardDescription>
            <IconCalendarCheck className="size-4 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-primary">
            {stats?.attendanceRate?.toFixed(1) || "0"}%
          </CardTitle>
          <CardAction>
            <Badge className="gap-1 bg-primary text-primary-foreground border-0">
              <IconTrendingUp className="size-3" />
              +2% vs ayer
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm font-medium text-primary/80">
          Promedio de presencia ayer y hoy.
        </CardFooter>
      </Card>

      {/* PROMEDIO ACADEMICO */}
      <Card className="@container/card border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Rendimiento Académico</CardDescription>
            <IconAward className="size-4 text-amber-600" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-amber-600">
            {stats?.academicAverage?.toFixed(2) || "0.00"}
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="gap-1 border-amber-500/30 text-amber-600"
            >
              Promedio Institucional
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm font-medium text-amber-700/80">
          Basado en evaluaciones recientes.
        </CardFooter>
      </Card>

      {/* MATRICULAS */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Matrículas 2025</CardDescription>
            <IconSchool className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.activeEnrollments?.toLocaleString() || "0"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1 text-emerald-600">
              Activas
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Vacantes ocupadas este año
          </div>
          <div className="text-muted-foreground">Proyección de asistencia</div>
        </CardFooter>
      </Card>

      {/* PROSPECTOS */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Conversión (Prospectos)</CardDescription>
            <IconTarget className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.prospectsCount || "0"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              CRM Funnel
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Interesados en Admisión
          </div>
          <div className="text-muted-foreground">Potenciales matriculados</div>
        </CardFooter>
      </Card>

      {/* PERSONAL */}
      <Card className="@container/card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription>Personal Total</CardDescription>
            <IconBriefcase className="size-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats?.totalStaff?.toLocaleString() || "0"}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              Nómina
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Docentes y administrativos
          </div>
          <div className="text-muted-foreground">Fuerza laboral activa</div>
        </CardFooter>
      </Card>

      {/* KPI ADICIONAL (ALERTA) */}
      <Card className="@container/card border-red-500/20 bg-red-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-red-700 font-bold">
              Estado de Alertas
            </CardDescription>
            <IconTrendingDown className="size-4 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
            03
          </CardTitle>
          <CardAction>
            <Badge variant="destructive" className="gap-1">
              Atención hoy
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm font-medium text-red-700/80">
          Pagos por verificar y faltas críticas.
        </CardFooter>
      </Card>
    </div>
  );
}
