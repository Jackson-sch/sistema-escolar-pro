"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconCalendarCheck,
  IconReceipt,
  IconChartBar,
  IconShirt,
  IconArrowUpRight,
  IconCircleCheck,
  IconClockHour4,
  IconX,
} from "@tabler/icons-react";

interface QuickSummaryHeroProps {
  studentName: string;
  asistenciaHoy?: {
    presente: boolean;
    tardanza: boolean;
    horaLlegada?: string | null;
    justificada?: boolean;
  } | null;
  payments?: {
    overdue: any[];
    upcoming: any[];
    totalDeuda: number;
  };
}

export function QuickSummaryHero({
  studentName,
  asistenciaHoy,
  payments,
}: QuickSummaryHeroProps) {
  const firstName = studentName?.split(" ")[0] || "Estudiante";

  // Evaluación de estado de pagos
  const overdueCount = payments?.overdue?.length || 0;
  const nextPayment = payments?.upcoming?.[0];

  // Configuración del Badge de Asistencia Hoy
  const getAttendanceBadge = () => {
    if (!asistenciaHoy) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground border border-border/50">
          <IconClockHour4 className="size-4 text-blue-500 animate-pulse" />
          <span>
            Asistencia de hoy: <strong>En curso</strong>
          </span>
        </div>
      );
    }
    if (asistenciaHoy.presente && !asistenciaHoy.tardanza) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <IconCircleCheck className="size-4 text-emerald-500" />
          <span>
            Presente{" "}
            {asistenciaHoy.horaLlegada
              ? `(${asistenciaHoy.horaLlegada})`
              : "a tiempo"}
          </span>
        </div>
      );
    }
    if (asistenciaHoy.tardanza) {
      return (
        <div className="flex items-center gap-2 rounded-xl bg-amber-500/10 px-3.5 py-2 text-xs font-bold text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <IconClock className="size-4 text-amber-500" />
          <span>
            Tardanza registrada{" "}
            {asistenciaHoy.horaLlegada ? `(${asistenciaHoy.horaLlegada})` : ""}
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <IconX className="size-4 text-rose-500" />
        <span>Falta no justificada</span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5">
        {/* Encabezado y Badges de Estado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors font-bold">
                Resumen &ldquo;De un Vistazo&rdquo;
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              Actividad reciente de{" "}
              <span className="text-primary capitalize">{firstName}</span>
            </h2>
          </div>

          {/* Badge Asistencia Hoy */}
          <div>{getAttendanceBadge()}</div>
        </div>

        {/* Alertas Financieras o de Deuda */}
        {overdueCount > 0 ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-rose-900 dark:text-rose-100">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0 shadow-md">
                <IconAlertTriangle className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Tienes {overdueCount} pensión{overdueCount > 1 ? "es" : ""}{" "}
                  vencida{overdueCount > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Monto acumulado:{" "}
                  <strong>S/ {payments?.totalDeuda?.toFixed(2)}</strong>
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 self-start sm:self-auto shadow-md"
            >
              <Link href="/portal/deudas">
                Subir Pago
                <IconArrowUpRight className="ml-1 size-4" />
              </Link>
            </Button>
          </div>
        ) : nextPayment ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-amber-900 dark:text-amber-100">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                <IconReceipt className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Próxima Pensión
                </p>
                <p className="text-sm font-bold">
                  {nextPayment.concepto?.nombre || "Cuota mensual"} — S/{" "}
                  {nextPayment.monto?.toFixed(2)}
                </p>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-xl font-bold border-amber-500/30 text-amber-800 dark:text-amber-200 hover:bg-amber-500/10 shrink-0 self-start sm:self-auto"
            >
              <Link href="/portal/deudas">Ver Detalle</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-emerald-800 dark:text-emerald-200">
            <IconCheck className="size-5 text-emerald-500 shrink-0" />
            <p className="text-xs font-medium">
              ¡Excelente! No registras pensiones vencidas ni deudas pendientes.
            </p>
          </div>
        )}

        <div className="space-y-2 border-t border-border/50 pt-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Accesos Rápidos Directos
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              href="/portal/deudas"
              className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 p-3 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <IconReceipt className="size-4" />
              </div>
              <span>Estado de Cuenta</span>
            </Link>

            <Link
              href="/portal/notas"
              className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 p-3 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
                <IconChartBar className="size-4" />
              </div>
              <span>Mis Calificaciones</span>
            </Link>

            <Link
              href="/portal/asistencia"
              className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 p-3 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <IconCalendarCheck className="size-4" />
              </div>
              <span>Control Asistencia</span>
            </Link>

            <Link
              href="/portal/uniformes"
              className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/50 p-3 text-xs font-semibold transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
                <IconShirt className="size-4" />
              </div>
              <span>Tienda Uniformes</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
