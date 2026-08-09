"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconSparkles,
  IconAlertTriangle,
  IconTrendingUp,
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Link from "next/link";

interface AIProactiveAlertsProps {
  totalOverdue?: number;
  lateTodayCount?: number;
  absentTodayCount?: number;
  capacityPercentage?: number;
}

export function AIProactiveAlerts({
  totalOverdue = 0,
  lateTodayCount = 0,
  absentTodayCount = 0,
  capacityPercentage = 0,
}: AIProactiveAlertsProps) {
  const [expanded, setExpanded] = useState(false);

  // Generar alertas automáticas procesadas por la IA
  const alerts = [];

  if (totalOverdue > 0) {
    alerts.push({
      id: "overdue-alert",
      type: "financial",
      title: "Riesgo de Cartera Morosa",
      message: `Se registran S/ ${totalOverdue.toFixed(2)} en pensiones pendientes. Recomendamos enviar recordatorios de cobranza por e-mail.`,
      actionUrl: "/finanzas/verificacion",
      actionLabel: "Revisar Cobranzas",
    });
  }

  if (absentTodayCount > 0 || lateTodayCount > 0) {
    alerts.push({
      id: "attendance-alert",
      type: "academic",
      title: "Monitoreo de Asistencia de Hoy",
      message: `Se registraron ${lateTodayCount} tardanzas y ${absentTodayCount} inasistencias en el turno actual.`,
      actionUrl: "/asistencia",
      actionLabel: "Ver Asistencia",
    });
  }

  if (capacityPercentage > 85) {
    alerts.push({
      id: "capacity-alert",
      type: "capacity",
      title: "Alta Ocupación de Vacantes",
      message: `La institución se encuentra al ${capacityPercentage}% de su capacidad máxima. Evalúa habilitar nuevas secciones para el próximo ciclo.`,
      actionUrl: "/gestion/academico/estructura",
      actionLabel: "Ver Secciones",
    });
  }

  // Si no hay alertas críticas, mostrar recomendación de crecimiento
  if (alerts.length === 0) {
    alerts.push({
      id: "growth-insight",
      type: "growth",
      title: "Operaciones en Rango Óptimo",
      message: "Todas las métricas clave de asistencia, cobranzas y vacantes se encuentran en parámetros saludables.",
      actionUrl: "/gestion/admisiones",
      actionLabel: "Ver Prospectos",
    });
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary/10 via-card/90 to-card/80 p-5 md:p-6 shadow-sm shadow-primary/5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/20 shrink-0">
            <IconSparkles className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base md:text-lg font-black tracking-tight">
                Copilot IA: Alertas y Diagnóstico Institucional
              </h3>
              <Badge className="bg-primary/20 text-primary border-none font-bold text-[10px]">
                {alerts.length} Insights
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Análisis proactivo generado automáticamente según la actividad de hoy.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-bold gap-1 rounded-xl text-muted-foreground hover:text-foreground"
          >
            {expanded ? "Contraer" : "Ver Diagnóstico"}
            {expanded ? <IconChevronUp className="size-4" /> : <IconChevronDown className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Insights Grid */}
      {expanded && (
        <div className="mt-5 grid gap-3 border-t border-border/40 pt-4 animate-in fade-in animation-duration-">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/30 bg-muted/50 p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-3">
                {alert.type === "financial" ? (
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                    <IconAlertTriangle className="size-4" />
                  </div>
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                    <IconTrendingUp className="size-4" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    {alert.message}
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="outline"
                size="sm"
                className="rounded-xl font-bold text-xs border-primary/20 text-primary hover:bg-primary/10 shrink-0 self-start sm:self-auto"
              >
                <Link href={alert.actionUrl}>
                  {alert.actionLabel}
                  <IconArrowRight className="ml-1 size-3.5" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
