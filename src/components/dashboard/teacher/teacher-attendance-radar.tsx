"use client";

import {
  IconAlertTriangle,
  IconUserCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/formats";
import { AlertaAsistencia } from "./teacher-types";

interface TeacherAttendanceRadarProps {
  criticalAttendance: AlertaAsistencia[];
}

export function TeacherAttendanceRadar({
  criticalAttendance,
}: TeacherAttendanceRadarProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-md p-4.5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <IconAlertTriangle size={15} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Radar de Inasistencias
            </h3>
            <p className="text-[10px] text-muted-foreground">
              Últimos 3 días en tus aulas
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="text-[10px] font-bold border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10"
        >
          {criticalAttendance.length} Alertas
        </Badge>
      </div>

      <div className="space-y-2">
        {criticalAttendance.length === 0 ? (
          <div className="py-6 text-center bg-muted/10 rounded-2xl border border-dashed border-border/30 space-y-1.5 px-3">
            <div className="size-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <IconUserCheck size={16} />
            </div>
            <p className="text-xs font-bold text-foreground">
              Asistencia 100% Regular
            </p>
            <p className="text-[10px] text-muted-foreground">
              No se registran faltas críticas recientes en tus secciones.
            </p>
          </div>
        ) : (
          criticalAttendance.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}

        <Button
          variant="outline"
          className="w-full text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 rounded-xl h-9 mt-1 cursor-pointer"
          asChild
        >
          <Link href="/asistencia">
            <span>Ir al Registro de Asistencia</span>
            <IconArrowRight size={14} className="ml-1.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: AlertaAsistencia }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-red-500/5 border border-red-500/20 text-xs">
      <div className="min-w-0 pr-2 space-y-0.5">
        <p className="font-bold text-foreground truncate uppercase text-xs">
          {alert.estudiante.name} {alert.estudiante.apellidoPaterno}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Inasistencia: {formatDate(alert.fecha)}
        </p>
      </div>
      <Badge
        variant="outline"
        className="text-[9px] font-bold text-red-600 dark:text-red-400 border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0"
      >
        Inasistente
      </Badge>
    </div>
  );
}
