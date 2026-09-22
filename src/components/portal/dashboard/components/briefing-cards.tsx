"use client";

import Link from "next/link";
import {
  IconCalendarCheck,
  IconReceipt,
  IconChartBar,
  IconArrowRight,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconX,
  IconSchool,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface BriefingCardsProps {
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
  attendancePercentage?: number;
}

function AsistenciaStatusBody({
  asistenciaHoy,
}: {
  asistenciaHoy?: BriefingCardsProps["asistenciaHoy"];
}) {
  if (!asistenciaHoy) {
    return (
      <>
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
          En desarrollo
        </p>
        <p className="text-[11px] text-muted-foreground">
          El registro de asistencia se actualiza durante la primera hora.
        </p>
      </>
    );
  }

  if (asistenciaHoy.presente && !asistenciaHoy.tardanza) {
    return (
      <>
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
          <IconCircleCheck
            size={16}
            className="text-emerald-600 dark:text-emerald-400 shrink-0"
          />
          Presente a tiempo
        </p>
        <p className="text-[11px] text-muted-foreground">
          {asistenciaHoy.horaLlegada
            ? `Ingreso registrado: ${asistenciaHoy.horaLlegada}`
            : "Asistencia puntual confirmada."}
        </p>
      </>
    );
  }

  if (asistenciaHoy.tardanza) {
    return (
      <>
        <p className="text-sm font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
          <IconClock
            size={16}
            className="text-amber-600 dark:text-amber-400 shrink-0"
          />
          Tardanza registrada
        </p>
        <p className="text-[11px] text-muted-foreground">
          {asistenciaHoy.horaLlegada
            ? `Ingreso: ${asistenciaHoy.horaLlegada}`
            : "Llegó después de la hora de tolerancia."}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
        <IconX
          size={16}
          className="text-rose-600 dark:text-rose-400 shrink-0"
        />
        Falta sin registrar
      </p>
      <p className="text-[11px] text-muted-foreground">
        {asistenciaHoy.justificada
          ? "Inasistencia justificada por el apoderado."
          : "No se registró ingreso en portería."}
      </p>
    </>
  );
}

function AsistenciaHoyCard({
  asistenciaHoy,
  attendancePercentage,
}: {
  asistenciaHoy?: BriefingCardsProps["asistenciaHoy"];
  attendancePercentage: number;
}) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between p-4 rounded-xl border transition-all",
        !asistenciaHoy && "bg-blue-500/5 border-blue-500/20",
        asistenciaHoy?.presente &&
          !asistenciaHoy.tardanza &&
          "bg-emerald-500/5 border-emerald-500/25",
        asistenciaHoy?.tardanza && "bg-amber-500/5 border-amber-500/25",
        asistenciaHoy &&
          !asistenciaHoy.presente &&
          "bg-rose-500/5 border-rose-500/25",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconCalendarCheck size={14} className="text-primary" /> 1. Asistencia de Hoy
        </span>
        <span className="text-[10px] font-bold text-muted-foreground">
          {attendancePercentage}% global
        </span>
      </div>

      <div className="space-y-1">
        <AsistenciaStatusBody asistenciaHoy={asistenciaHoy} />
      </div>

      <div className="pt-3 mt-1 border-t border-border/30">
        <Link
          href="/portal/asistencia"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          Ver historial mensual <IconArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function PensionesCard({
  payments,
}: {
  payments?: BriefingCardsProps["payments"];
}) {
  const overdueCount = payments?.overdue?.length || 0;
  const totalDeuda = payments?.totalDeuda || 0;
  const nextPayment = payments?.upcoming?.[0];

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-4 rounded-xl border transition-all",
        overdueCount > 0
          ? "bg-rose-500/5 border-rose-500/25"
          : "bg-emerald-500/5 border-emerald-500/25",
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconReceipt size={14} className="text-primary" /> 2. Pensiones y Cuotas
        </span>
      </div>

      <div className="space-y-1">
        {overdueCount > 0 ? (
          <>
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
              <IconAlertTriangle
                size={16}
                className="text-rose-600 dark:text-rose-400 shrink-0"
              />
              {overdueCount} cuota(s) pendiente(s)
            </p>
            <p className="text-[11px] text-muted-foreground font-mono font-bold">
              Total por regularizar: S/ {totalDeuda.toFixed(2)}
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <IconCircleCheck
                size={16}
                className="text-emerald-600 dark:text-emerald-400 shrink-0"
              />
              Al día en pagos
            </p>
            <p className="text-[11px] text-muted-foreground">
              {nextPayment
                ? `Próx. vencimiento: ${nextPayment.mes || "Pensión actual"}`
                : "No registra deudas pendientes."}
            </p>
          </>
        )}
      </div>

      <div className="pt-3 mt-1 border-t border-border/30">
        <Link
          href="/portal/deudas"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          Pagar o subir comprobante <IconArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

function RendimientoCard() {
  return (
    <div className="flex flex-col justify-between p-4 rounded-xl border border-border/50 bg-muted/20">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <IconChartBar size={14} className="text-primary" /> 3. Rendimiento CNEB
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <IconSchool size={16} className="text-primary shrink-0" />
          Progreso Académico
        </p>
        <p className="text-[11px] text-muted-foreground">
          Consulta los logros por competencia y las calificaciones de los periodos bimestrales.
        </p>
      </div>

      <div className="pt-3 mt-1 border-t border-border/30">
        <Link
          href="/portal/notas"
          className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          Ver libreta de calificaciones <IconArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}

export function BriefingCards({
  asistenciaHoy,
  payments,
  attendancePercentage = 95,
}: BriefingCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      <AsistenciaHoyCard
        asistenciaHoy={asistenciaHoy}
        attendancePercentage={attendancePercentage}
      />
      <PensionesCard payments={payments} />
      <RendimientoCard />
    </div>
  );
}
