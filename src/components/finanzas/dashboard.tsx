import {
  IconCash,
  IconClock,
  IconAlertTriangle,
  IconReceipt2,
  IconTrendingUp,
} from "@tabler/icons-react";
import StatCard from "@/components/common/stat-card";
import { formatCurrency } from "@/lib/formats";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinanzasDashboardProps {
  estadisticas?: {
    pendiente: number;
    cobrado: number;
    deudasVencidas: number;
    totalMora: number;
    pagosPendientesVerificacion: number;
    recaudacionMensual: number;
    proyeccionMensual: number;
  };
}

export function FinanzasDashboard({ estadisticas }: FinanzasDashboardProps) {
  const percentageMonthly =
    estadisticas?.proyeccionMensual && estadisticas.proyeccionMensual > 0
      ? (estadisticas.recaudacionMensual / estadisticas.proyeccionMensual) * 100
      : 0;

  const stats = [
    {
      title: "Resumen Cobrado",
      value: formatCurrency(estadisticas?.cobrado || 0),
      icon: IconCash,
      iconColor: "text-green-600",
      description: "Total histórico acumulado",
    },
    {
      title: "Por Cobrar (Total)",
      value: formatCurrency(estadisticas?.pendiente || 0),
      icon: IconClock,
      iconColor: "text-amber-600",
      description: "Incluye moras acumuladas",
    },
    {
      title: "Deudas Vencidas",
      value: estadisticas?.deudasVencidas || 0,
      icon: IconAlertTriangle,
      iconColor: "text-red-600",
      description: "Cuotas no pagadas a la fecha",
    },
    {
      title: "Por Verificar",
      value: estadisticas?.pagosPendientesVerificacion || 0,
      icon: IconReceipt2,
      iconColor: "text-blue-600",
      description: "Depósitos pendientes de revisión",
      trend:
        (estadisticas?.pagosPendientesVerificacion || 0) > 0
          ? "Atención requerida"
          : "Al día",
      trendType:
        (estadisticas?.pagosPendientesVerificacion || 0) > 0 ? "down" : "up",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Meta de Recaudación del Mes
              </CardTitle>
              <IconTrendingUp className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="mt-2 text-2xl font-bold">
              {formatCurrency(estadisticas?.recaudacionMensual || 0)}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                de {formatCurrency(estadisticas?.proyeccionMensual || 0)}
              </span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span>{percentageMonthly.toFixed(1)}% Completado</span>
                <span>
                  Faltan{" "}
                  {formatCurrency(
                    (estadisticas?.proyeccionMensual || 0) -
                      (estadisticas?.recaudacionMensual || 0),
                  )}
                </span>
              </div>
              <Progress value={percentageMonthly} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {estadisticas?.totalMora ? (
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">
                Mora Acumulada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">
                {formatCurrency(estadisticas.totalMora)}
              </div>
              <p className="text-xs text-amber-600/80 mt-1">
                Ingresos adicionales por pagos tardíos.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
