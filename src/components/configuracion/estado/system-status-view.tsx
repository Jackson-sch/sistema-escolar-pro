"use client";

import { useState, useTransition, useEffect } from "react";
import {
  IconActivity,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconDatabase,
  IconBuilding,
  IconSchool,
  IconShieldCheck,
  IconServer,
  IconClock,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { getSystemStatusAction, SystemCheckItem } from "@/actions/system-status";

function getCategoryIcon(category: string) {
  switch (category) {
    case "database":
      return IconDatabase;
    case "institution":
      return IconBuilding;
    case "academic":
      return IconSchool;
    case "security":
      return IconShieldCheck;
    default:
      return IconServer;
  }
}

function formatUptime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds % 60}s`;
}

export function SystemStatusView() {
  const [checklist, setChecklist] = useState<SystemCheckItem[]>([]);
  const [summary, setSummary] = useState<{
    totalChecks: number;
    configuredCount: number;
    completionPercentage: number;
    dbLatencyMs: number;
    uptimeSeconds: number;
    timestamp: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const fetchStatus = () => {
    startTransition(async () => {
      const res = await getSystemStatusAction();
      if (res.success && res.data) {
        setChecklist(res.data.checklist);
        setSummary(res.data.summary);
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  useEffect(() => {
    fetchStatus();
  }, []);



  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <IconActivity className="size-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-foreground">
              Diagnóstico de Salud & Preparación del Sistema
            </h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Checklist de configuración operacional, latencia de base de datos y servicios activos
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStatus}
          disabled={isPending}
          className="rounded-xl gap-2 h-9 text-xs font-bold border-border/50 bg-background"
        >
          <IconRefresh className={`size-4 ${isPending ? "animate-spin" : ""}`} />
          Re-evaluar Estado
        </Button>
      </div>

      {/* Overview Cards & Global Progress */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Readiness Level */}
          <div className="bg-card/80 border border-border/50 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nivel de Preparación
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[11px] font-bold">
                {summary.completionPercentage}% Listo
              </Badge>
            </div>
            <div className="text-2xl font-black text-foreground">
              {summary.configuredCount} / {summary.totalChecks} Verificados
            </div>
            <Progress value={summary.completionPercentage} className="h-2 rounded-full" />
          </div>

          {/* Card 2: DB Latency */}
          <div className="bg-card/80 border border-border/50 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Latencia de Base de Datos
              </span>
              <div className="text-2xl font-black text-foreground">
                {summary.dbLatencyMs} ms
              </div>
              <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                <IconCheck className="size-3.5" /> PostgreSQL Responsivo
              </p>
            </div>
            <div className="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <IconDatabase className="size-5" />
            </div>
          </div>

          {/* Card 3: Uptime & Time */}
          <div className="bg-card/80 border border-border/50 rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Tiempo Activo (Uptime)
              </span>
              <div className="text-2xl font-black text-foreground">
                {formatUptime(summary.uptimeSeconds)}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <IconClock className="size-3.5" /> {new Date(summary.timestamp).toLocaleTimeString("es-PE")}
              </p>
            </div>
            <div className="size-11 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
              <IconServer className="size-5" />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Checklist Grid */}
      <div className="bg-card/80 border border-border/50 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <h2 className="text-base font-black text-foreground">
              Checklist de Verificación de Módulos & Parámetros
            </h2>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Evalúa los requerimientos de configuración básica para la salida a producción
            </p>
          </div>
        </div>

        {isPending && checklist.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground font-medium">
            Evaluando parámetros del sistema...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {checklist.map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-colors duration-200 flex items-start gap-3.5 ${
                    item.isConfigured
                      ? "bg-emerald-500/[0.02] border-emerald-500/30"
                      : "bg-amber-500/[0.02] border-amber-500/30"
                  }`}
                >
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      item.isConfigured
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {item.isConfigured ? (
                      <IconCheck className="size-5" />
                    ) : (
                      <IconAlertTriangle className="size-5" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <CategoryIcon className="size-3.5 text-muted-foreground" />
                        {item.title}
                      </h3>
                      <Badge
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                          item.isConfigured
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400"
                        }`}
                      >
                        {item.isConfigured ? "Configurado" : "Pendiente"}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[11px] font-semibold border-t border-border/20 mt-2">
                      <span className="text-foreground/80">{item.value}</span>
                      <span className="text-muted-foreground">{item.statusText}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
