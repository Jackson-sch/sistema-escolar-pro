import {
  IconCash,
  IconClock,
  IconAlertTriangle,
  IconReceipt2,
  IconTrendingUp,
  IconChartBar,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      color: "emerald",
      description: "Total acumulado",
    },
    {
      title: "Por Cobrar",
      value: formatCurrency(estadisticas?.pendiente || 0),
      icon: IconClock,
      color: "amber",
      description: "Incluye moras",
    },
    {
      title: "Deudas Vencidas",
      value: estadisticas?.deudasVencidas || 0,
      icon: IconAlertTriangle,
      color: "red",
      description: "Cuotas impagas",
    },
    {
      title: "Por Verificar",
      value: estadisticas?.pagosPendientesVerificacion || 0,
      icon: IconReceipt2,
      color: "blue",
      description: "Atención requerida",
      highlight: (estadisticas?.pagosPendientesVerificacion || 0) > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.title} 
            className={cn(
              "liquid-glass border-none group transition-all duration-300 hover:scale-[1.02]",
              stat.highlight && "ring-2 ring-primary/40 shadow-lg shadow-primary/20"
            )}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "p-2.5 rounded-2xl transition-colors",
                  stat.color === "emerald" && "bg-emerald-500/10 text-emerald-500",
                  stat.color === "amber" && "bg-amber-500/10 text-amber-500",
                  stat.color === "red" && "bg-red-500/10 text-red-500",
                  stat.color === "blue" && "bg-blue-500/10 text-blue-500",
                )}>
                  <stat.icon className="size-5" />
                </div>
                {stat.highlight && (
                  <Badge className="bg-primary text-primary-foreground animate-pulse text-[10px] font-black uppercase tracking-tighter">
                    Pendiente
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                  {stat.title}
                </p>
                <h3 className="text-2xl font-black tracking-tighter">
                  {stat.value}
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recaudación Mensual Card */}
        <Card className="md:col-span-2 liquid-glass border-none relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors" />
          
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconTrendingUp className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight">
                    Meta de Recaudación del Mes
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-medium">
                    Progreso basado en la proyección mensual
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full font-black text-xs px-3">
                {new Date().toLocaleString('es-ES', { month: 'long' }).toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Recaudado actual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black tracking-tighter text-primary">
                    {formatCurrency(estadisticas?.recaudacionMensual || 0)}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">
                    / {formatCurrency(estadisticas?.proyeccionMensual || 0)}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 max-w-xs w-full space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Porcentaje</p>
                    <p className="text-xl font-black text-primary">{percentageMonthly.toFixed(1)}%</p>
                  </div>
                  <div className="text-right space-y-0.5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Faltante</p>
                    <p className="text-sm font-bold">
                      {formatCurrency((estadisticas?.proyeccionMensual || 0) - (estadisticas?.recaudacionMensual || 0))}
                    </p>
                  </div>
                </div>
                <div className="relative h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-linear-to-r from-primary/80 to-primary transition-all duration-1000 ease-out"
                    style={{ width: `${percentageMonthly}%` }}
                  />
                  {/* Glow effect on progress bar */}
                  <div 
                    className="absolute inset-y-0 right-0 w-8 bg-white/20 blur-sm"
                    style={{ left: `calc(${percentageMonthly}% - 2rem)` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mora Acumulada Card */}
        <Card className={cn(
          "liquid-glass border-none relative overflow-hidden group",
          (estadisticas?.totalMora || 0) > 0 ? "bg-amber-500/3" : ""
        )}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <IconChartBar className="size-5" />
              </div>
              <CardTitle className="text-lg font-black tracking-tight text-amber-700 dark:text-amber-500">
                Mora Acumulada
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Ingresos por recargos</p>
                <h3 className="text-3xl font-black tracking-tighter text-amber-600 dark:text-amber-500">
                  {formatCurrency(estadisticas?.totalMora || 0)}
                </h3>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-700/80 dark:text-amber-500/80 leading-relaxed font-medium">
                  Este monto representa ingresos adicionales generados por pagos fuera de fecha.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

