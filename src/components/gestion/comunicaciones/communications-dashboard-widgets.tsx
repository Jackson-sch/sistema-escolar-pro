"use client";

import {
  IconMail,
  IconMessage,
  IconBrandWhatsapp,
  IconCheck,
  IconX,
  IconInfoCircle,
  IconPlug,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CommunicationsStats {
  totalEsteMes: number;
  tendencia: number;
  tasaExito: number;
  canales: {
    EMAIL: number;
    SMS: number;
    WHATSAPP: number;
  };
  integrations: {
    resend: boolean;
    twilio: boolean;
  };
}

export function CommunicationsStatsGrid({ stats }: { stats: CommunicationsStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Envíos del Mes */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Envíos de este Mes
          </span>
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            <IconTrendingUp className="size-3 mr-1" />
            +{stats.tendencia}%
          </Badge>
        </div>
        <div>
          <h3 className="text-3xl font-bold font-mono text-foreground">
            {stats.totalEsteMes}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Notificaciones despachadas
          </p>
        </div>
      </div>

      {/* Tasa de Entrega / Éxito */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Tasa de Éxito
          </span>
          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div>
          <h3 className="text-3xl font-bold font-mono text-foreground">
            {stats.tasaExito}%
          </h3>
          <div className="w-full bg-muted/40 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{ width: `${stats.tasaExito}%` }}
            />
          </div>
        </div>
      </div>

      {/* Canales Utilizados */}
      <div className="p-4 rounded-2xl bg-card/80 border border-border/50 shadow-sm flex flex-col justify-between h-36 col-span-1 md:col-span-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Distribución por Canal
          </span>
          <span className="text-[10px] text-muted-foreground font-medium">
            Mes en curso
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <IconMail className="size-4 mb-0.5" />
            <span className="text-base font-bold font-mono">
              {stats.canales.EMAIL}
            </span>
            <span className="text-[9px] font-bold uppercase">Correo</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <IconMessage className="size-4 mb-0.5" />
            <span className="text-base font-bold font-mono">
              {stats.canales.SMS}
            </span>
            <span className="text-[9px] font-bold uppercase">SMS</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <IconBrandWhatsapp className="size-4 mb-0.5" />
            <span className="text-base font-bold font-mono">
              {stats.canales.WHATSAPP}
            </span>
            <span className="text-[9px] font-bold uppercase">WhatsApp</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommunicationsIntegrationsSidebar({
  stats,
}: {
  stats: CommunicationsStats;
}) {
  return (
    <div className="space-y-4 lg:col-span-4">
      <Card className="p-5 rounded-2xl bg-card/80 border-border/40 shadow-xl space-y-3">
        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
          <IconPlug className="size-4 text-indigo-500" />
          Estado de Integraciones
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Estado operativo de los proveedores de telecomunicaciones.
        </p>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/30">
            <div className="flex items-center gap-2">
              <IconMail className="size-4 text-indigo-500" />
              <span className="text-xs font-semibold">Resend Email API</span>
            </div>
            {stats.integrations.resend ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                <IconCheck className="size-3 mr-0.5" /> Activo
              </Badge>
            ) : (
              <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                <IconX className="size-3 mr-0.5" /> Inactivo
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/30">
            <div className="flex items-center gap-2">
              <IconBrandWhatsapp className="size-4 text-emerald-500" />
              <span className="text-xs font-semibold">Twilio SMS / WhatsApp</span>
            </div>
            {stats.integrations.twilio ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                <IconCheck className="size-3 mr-0.5" /> Activo
              </Badge>
            ) : (
              <Badge className="bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                <IconX className="size-3 mr-0.5" /> Inactivo
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 rounded-2xl bg-indigo-500/5 border-indigo-500/15 space-y-3">
        <h4 className="font-bold text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2 uppercase tracking-wider">
          <IconInfoCircle className="size-4 text-indigo-500" />
          Guía de Despacho
        </h4>
        <div className="space-y-2 text-xs text-muted-foreground leading-relaxed font-medium">
          <div className="flex gap-2">
            <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
              1
            </span>
            <p>Escriba el nombre o DNI del alumno para vincular a sus apoderados.</p>
          </div>
          <div className="flex gap-2">
            <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
              2
            </span>
            <p>Seleccione los canales activos por los que desea enviar la alerta.</p>
          </div>
          <div className="flex gap-2">
            <span className="size-4 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 text-[10px] font-bold">
              3
            </span>
            <p>Consulte el registro de auditoría en la opción &ldquo;Ver Historial&rdquo;.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
