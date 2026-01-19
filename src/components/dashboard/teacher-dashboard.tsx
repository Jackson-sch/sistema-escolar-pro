"use client";

import {
  IconUsers,
  IconClipboardCheck,
  IconAlertTriangle,
  IconCalendarStats,
  IconBook,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/formats";

interface TeacherDashboardProps {
  data: {
    cursos: any[];
    upcomingEvaluations: any[];
    criticalAttendance: any[];
    evaluationsToGrade: any[];
  };
}

export function TeacherDashboard({ data }: TeacherDashboardProps) {
  const {
    cursos,
    upcomingEvaluations,
    criticalAttendance,
    evaluationsToGrade,
  } = data;

  return (
    <div className="space-y-6 px-2">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPIItem
          title="Mis Cursos"
          value={cursos.length.toString()}
          icon={IconBook}
          color="blue"
        />
        <KPIItem
          title="Eval. Pendientes"
          value={upcomingEvaluations.length.toString()}
          icon={IconCalendarStats}
          color="amber"
        />
        <KPIItem
          title="Alertas Asistencia"
          value={criticalAttendance.length.toString()}
          icon={IconAlertTriangle}
          color="red"
        />
        <KPIItem
          title="Por Calificar"
          value={evaluationsToGrade.length.toString()}
          icon={IconClipboardCheck}
          color="emerald"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Próximas Evaluaciones */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="overflow-hidden border-primary/10">
            <CardHeader className="bg-muted/30 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Próximas Evaluaciones
                  </CardTitle>
                  <CardDescription>
                    Eventos programados para los próximos 7 días
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/evaluaciones">Ver todas</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {upcomingEvaluations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No hay evaluaciones programadas para esta semana.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {upcomingEvaluations.map((evaluacion: any) => (
                    <div
                      key={evaluacion.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <IconCalendarStats size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">
                            {evaluacion.curso.materia.nombre}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {evaluacion.curso.nivelAcademico.grado.nombre} -{" "}
                            {evaluacion.tipo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-primary">
                          {formatDate(evaluacion.fecha)}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase"
                        >
                          Pendiente
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cursos Asignados */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold px-2">Mis Cursos Asignados</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {cursos.map((curso: any) => (
                <Card
                  key={curso.id}
                  className="group hover:border-primary/30 transition-all cursor-pointer"
                >
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center group-hover:text-primary transition-colors">
                        <IconBook size={24} />
                      </div>
                      <Badge variant="secondary" className="rounded-lg">
                        {curso.nivelAcademico.seccion}
                      </Badge>
                    </div>
                    <h4 className="font-black truncate">
                      {curso.areaCurricular.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {curso.nivelAcademico.nivel.nombre} -{" "}
                      {curso.nivelAcademico.grado.nombre}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Alertas y Pendientes de Calificar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alertas de Asistencia */}
          <Card className="border-red-500/20 bg-red-500/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                <IconAlertTriangle className="size-4" />
                Alertas de Asistencia
              </CardTitle>
              <CardDescription className="text-xs">
                Faltas injustificadas hoy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {criticalAttendance.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Todo al día hoy.
                </p>
              ) : (
                criticalAttendance.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-background border border-red-100 dark:border-red-900/30 shadow-sm"
                  >
                    <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 shrink-0">
                      <IconUsers size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {alert.estudiante.name}{" "}
                        {alert.estudiante.apellidoPaterno}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Falta marcada hace poco
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Pendientes de Calificar */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-emerald-600">
                <IconClipboardCheck className="size-4" />
                Pendiente Calificar
              </CardTitle>
              <CardDescription className="text-xs">
                Evaluaciones ya realizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluationsToGrade.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin pendientes.
                </p>
              ) : (
                evaluationsToGrade.map((evalu: any) => (
                  <div
                    key={evalu.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-background border border-emerald-100 dark:border-emerald-900/30 shadow-sm group hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {evalu.curso.areaCurricular.nombre}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {evalu.tipoEvaluacion.nombre} -{" "}
                        {formatDate(evalu.fecha)}
                      </p>
                    </div>
                    <IconChevronRight size={14} className="text-emerald-500" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function KPIItem({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: any;
  color: "blue" | "amber" | "red" | "emerald";
}) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    red: "bg-red-500/10 text-red-600 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm ring-1 ring-border/50">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`size-12 rounded-2xl flex items-center justify-center border ${colorMap[color]}`}
        >
          <Icon size={24} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
            {title}
          </p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
