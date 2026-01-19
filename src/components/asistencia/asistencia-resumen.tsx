import React from "react";
import {
  IconUsers,
  IconCheck,
  IconClock,
  IconX,
  IconInfoCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AlumnoAsistencia {
  id: string;
  estado: string;
}

interface AsistenciaResumenProps {
  alumnos: AlumnoAsistencia[];
}

export function AsistenciaResumen({ alumnos }: AsistenciaResumenProps) {
  const total = alumnos.length;
  const presentes = alumnos.filter((a) => a.estado === "presente").length;
  const tardanzas = alumnos.filter((a) => a.estado === "tarde").length;
  const ausentes = alumnos.filter((a) => a.estado === "ausente").length;
  const justificados = alumnos.filter((a) => a.estado === "justificado").length;

  const registrados = alumnos.filter((a) => a.estado !== "").length;
  const porcentajeProgreso = total > 0 ? (registrados / total) * 100 : 0;

  const stats = [
    {
      label: "Total Inscritos",
      value: total,
      icon: IconUsers,
      color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      iconContainer: "bg-blue-500/10",
    },
    {
      label: "Presentes",
      value: presentes,
      icon: IconCheck,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
      iconContainer: "bg-emerald-500/10",
    },
    {
      label: "Tardanzas",
      value: tardanzas,
      icon: IconClock,
      color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
      iconContainer: "bg-orange-500/10",
    },
    {
      label: "Ausentes",
      value: ausentes,
      icon: IconX,
      color: "bg-red-500/10 text-red-600 border-red-500/20",
      iconContainer: "bg-red-500/10",
    },
  ];

  return (
    <Card className="bg-card/30 border-border/40 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl shadow-primary/5 h-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black tracking-tight uppercase">
          Resumen de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-all duration-300",
                stat.color,
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", stat.iconContainer)}>
                  <stat.icon className="size-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {stat.label}
                </span>
              </div>
              <span className="text-lg font-black">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-border/40 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Progreso
            </span>
            <span className="text-xs font-black text-primary">
              {Math.round(porcentajeProgreso)}%
            </span>
          </div>
          <Progress
            value={porcentajeProgreso}
            className="h-2 rounded-full bg-muted/20"
          />
          <p className="text-[10px] font-medium text-center text-muted-foreground italic">
            {porcentajeProgreso === 100
              ? "Todos los estados registrados"
              : `${total - registrados} alumnos pendientes por marcar`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
