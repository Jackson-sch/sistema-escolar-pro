"use client";

import {
  IconUsers,
  IconClipboardCheck,
  IconAlertTriangle,
  IconCalendarStats,
  IconBook,
  IconChevronRight,
  IconClock,
  IconLayoutDashboard,
  IconDotsVertical,
  IconExternalLink,
  IconSparkles,
  IconUserCheck,
  IconPencil,
  type Icon,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AreaCurricular {
  id: string;
  nombre: string;
}

interface Grado {
  id: string;
  nombre: string;
}

interface NivelAcademico {
  id: string;
  grado: Grado;
  nivel: { id: string; nombre: string };
  seccion: string;
  aulaAsignada?: string | null;
}

interface CursoDocente {
  id: string;
  areaCurricular: AreaCurricular;
  nivelAcademico: NivelAcademico;
  _count?: { estudiantes: number };
}

interface EvaluacionDocente {
  id: string;
  fecha: string | Date;
  curso: {
    areaCurricular: AreaCurricular;
    nivelAcademico: { grado: Grado; seccion: string };
  };
  tipoEvaluacion: { nombre: string };
}

interface AlertaAsistencia {
  id: string;
  fecha: string | Date;
  estudiante: { name?: string | null; apellidoPaterno?: string | null };
}

interface HorarioDocente {
  id: string;
  horaInicio: string;
  horaFin: string;
  curso: {
    areaCurricular: AreaCurricular;
    nivelAcademico: { id?: string; grado: Grado; seccion: string; aulaAsignada?: string | null };
  };
}

interface TeacherDashboardProps {
  data: {
    cursos: CursoDocente[];
    totalUniqueStudents?: number;
    upcomingEvaluations: EvaluacionDocente[];
    criticalAttendance: AlertaAsistencia[];
    evaluationsToGrade: EvaluacionDocente[];
    todaySchedule: HorarioDocente[];
  };
}

export function TeacherDashboard({ data }: TeacherDashboardProps) {
  const {
    cursos,
    totalUniqueStudents,
    upcomingEvaluations,
    criticalAttendance,
    evaluationsToGrade,
    todaySchedule,
  } = data;

  const totalStudents = totalUniqueStudents ?? cursos.reduce(
    (acc, curso) => Math.max(acc, curso._count?.estudiantes || 0),
    0
  );

  const fechaHoy = new Date().toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "America/Lima",
  });

  return (
    <div className="space-y-6 animate-in fade-in animation-duration- pb-12">
      {/* Banner de Bienvenida Ejecutivo Docente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
        {/* Glow Accent Circles */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 size-[400px] rounded-full bg-indigo-500/20 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 size-[300px] rounded-full bg-purple-500/20 blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-500/20 border-indigo-500/30 text-indigo-300 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
                <IconSparkles size={12} />
                Portal Pedagógico Docente
              </Badge>
              <Badge variant="outline" className="text-[10px] font-semibold border-white/20 text-white/80 capitalize">
                {fechaHoy}
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Panel de Gestión Académica
            </h1>
            <p className="text-xs md:text-sm text-indigo-200/80 max-w-xl leading-relaxed">
              Monitoreo en tiempo real de tus clases asignadas, registro de asistencias y calificaciones de evaluaciones.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all duration-200 text-xs h-9.5 px-4 gap-2 cursor-pointer"
              asChild
            >
              <Link href="/evaluaciones/nueva">
                <IconCalendarStats size={15} />
                <span>Nueva Evaluación</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/20 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs h-9.5 px-4 gap-2 backdrop-blur-md cursor-pointer"
              asChild
            >
              <Link href="/asistencia">
                <IconUserCheck size={15} />
                <span>Asistencia</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI Docentes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPIItem
          title="Mis Estudiantes"
          value={totalStudents.toString()}
          label="Total matriculados en tus aulas"
          icon={IconUsers}
          badgeText="Activos"
          color="indigo"
        />
        <KPIItem
          title="Cursos Asignados"
          value={cursos.length.toString()}
          label="Asignaturas a tu cargo"
          icon={IconBook}
          color="blue"
        />
        <KPIItem
          title="Clases de Hoy"
          value={todaySchedule.length.toString()}
          label="Sesiones programadas hoy"
          icon={IconClock}
          color="purple"
        />
        <KPIItem
          title="Por Calificar"
          value={evaluationsToGrade.length.toString()}
          label="Evaluaciones pendientes"
          icon={IconClipboardCheck}
          badgeText={evaluationsToGrade.length > 0 ? "Pendiente" : "Al día"}
          color={evaluationsToGrade.length > 0 ? "amber" : "emerald"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Columna Principal (8Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Horario de Hoy */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <div className="size-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <IconClock size={14} />
                </div>
                Jornada de Clases de Hoy
              </h3>
              <Badge variant="outline" className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full border-border/50 text-muted-foreground capitalize">
                {fechaHoy}
              </Badge>
            </div>

            <div className="grid gap-3">
              {todaySchedule.length === 0 ? (
                <div className="rounded-2xl p-8 text-center border border-dashed border-border/40 bg-card/80 shadow-xs space-y-2">
                  <div className="size-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-500">
                    <IconClock size={24} opacity={0.6} />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Sin clases programadas hoy</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">No tienes sesiones lectivas asignadas para la fecha actual.</p>
                </div>
              ) : (
                todaySchedule.map((item) => (
                  <ScheduleItem key={item.id} item={item} />
                ))
              )}
            </div>
          </section>

          {/* Mis Cursos Asignados */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <div className="size-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <IconBook size={14} />
                </div>
                Mis Cursos y Aulas Asignadas
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold rounded-full px-2.5 py-0.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5">
                {cursos.length} Asignaturas
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {cursos.map((curso) => (
                <CourseCard key={curso.id} curso={curso} />
              ))}
            </div>
          </section>

          {/* Próximas Evaluaciones */}
          <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden shadow-xs">
            <div className="p-4 flex items-center justify-between border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <IconCalendarStats size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Próximas Evaluaciones Programadas
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Cronograma evaluativo de los próximos 7 días
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs font-semibold rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer" asChild>
                <Link href="/evaluaciones">Ver todas</Link>
              </Button>
            </div>

            <div className="p-0">
              {upcomingEvaluations.length === 0 ? (
                <div className="p-8 text-center space-y-1">
                  <IconCalendarStats className="mx-auto size-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs font-semibold text-foreground">Sin evaluaciones programadas</p>
                  <p className="text-[11px] text-muted-foreground">No hay exámenes programados para esta semana.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {upcomingEvaluations.map((evaluacion) => (
                    <EvaluationItem key={evaluacion.id} evaluacion={evaluacion} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Columna Lateral (4Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Alertas de Asistencia */}
          <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <IconAlertTriangle size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Inasistencias Recientes
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Últimos 3 días lectivos</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {criticalAttendance.length === 0 ? (
                <div className="py-6 text-center bg-muted/10 rounded-xl border border-dashed border-border/30 space-y-1">
                  <IconUserCheck className="mx-auto size-7 text-emerald-500 opacity-60" />
                  <p className="text-xs font-semibold text-foreground">Asistencia completa</p>
                  <p className="text-[10px] text-muted-foreground">Sin inasistencias en tus secciones.</p>
                </div>
              ) : (
                criticalAttendance.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              )}
              <Button variant="ghost" className="w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-xl h-9 mt-1 cursor-pointer" asChild>
                <Link href="/asistencia">Ir a Control de Asistencia</Link>
              </Button>
            </div>
          </div>

          {/* Evaluaciones Pendientes por Calificar */}
          <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-md p-4 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <IconPencil size={14} />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Notas Pendientes
                  </h3>
                  <p className="text-[10px] text-muted-foreground">Evaluaciones a ingresar</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {evaluationsToGrade.length === 0 ? (
                <div className="py-6 text-center bg-muted/10 rounded-xl border border-dashed border-border/30 space-y-1">
                  <IconSparkles className="mx-auto size-7 text-emerald-500 opacity-60" />
                  <p className="text-xs font-semibold text-foreground">¡Todo al día!</p>
                  <p className="text-[10px] text-muted-foreground">Todas las notas han sido registradas.</p>
                </div>
              ) : (
                evaluationsToGrade.map((evalu) => (
                  <PendingGradeItem key={evalu.id} evalu={evalu} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIItem({
  title,
  value,
  label,
  icon: Icon,
  color,
  badgeText,
}: {
  title: string;
  value: string;
  label: string;
  icon: Icon;
  color: "blue" | "amber" | "emerald" | "indigo" | "purple";
  badgeText?: string;
}) {
  const colorMap = {
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    purple: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="rounded-2xl p-4 border border-border/40 bg-card/80 backdrop-blur-md shadow-xs flex flex-col justify-between relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn("size-8 rounded-xl flex items-center justify-center border", colorMap[color])}>
          <Icon size={16} />
        </div>
      </div>

      <div className="mt-3 space-y-0.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-extrabold tracking-tight text-foreground">{value}</h3>
          {badgeText && (
            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 rounded-full border-border/40 bg-muted/30">
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

function ScheduleItem({ item }: { item: HorarioDocente }) {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-card/80 border border-border/40 hover:border-indigo-500/30 transition-all duration-200 shadow-xs gap-3">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
          <span className="text-xs font-bold font-mono">{item.horaInicio}</span>
          <span className="text-[9px] text-muted-foreground font-semibold">a {item.horaFin}</span>
        </div>

        <div className="min-w-0 space-y-0.5">
          <h4 className="font-bold text-xs text-foreground truncate uppercase">
            {item.curso.areaCurricular.nombre}
          </h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-semibold border-border/40 bg-muted/30 px-2 py-0">
              {item.curso.nivelAcademico.grado.nombre} "{item.curso.nivelAcademico.seccion}"
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <IconUsers size={11} /> {item.curso.nivelAcademico.aulaAsignada || "Aula asignada"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button variant="outline" size="sm" className="rounded-xl h-8 px-2.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/10 cursor-pointer gap-1" asChild>
          <Link href={`/asistencia?seccion=${item.curso.nivelAcademico.id}`}>
            <IconUserCheck size={13} />
            <span className="hidden sm:inline">Asistencia</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl size-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-500/10 cursor-pointer" asChild>
          <Link href="/gestion/estudiantes">
            <IconExternalLink size={15} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function EvaluationItem({ evaluacion }: { evaluacion: EvaluacionDocente }) {
  return (
    <Link
      href={`/evaluaciones/${evaluacion.id}/notas`}
      className="flex items-center justify-between p-3.5 hover:bg-muted/20 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
          <IconCalendarStats size={16} />
        </div>
        <div className="min-w-0 space-y-0.5">
          <p className="font-bold text-xs text-foreground truncate uppercase group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {evaluacion.curso.areaCurricular.nombre}
          </p>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[9px] font-semibold border-border/40 text-muted-foreground px-1.5 py-0">
              {evaluacion.curso.nivelAcademico.grado.nombre} "{evaluacion.curso.nivelAcademico.seccion}"
            </Badge>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
              {evaluacion.tipoEvaluacion.nombre}
            </span>
          </div>
        </div>
      </div>
      <Badge variant="outline" className="text-[10px] font-mono font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0.5 shrink-0">
        {formatDate(evaluacion.fecha)}
      </Badge>
    </Link>
  );
}

function CourseCard({ curso }: { curso: CursoDocente }) {
  return (
    <div className="rounded-2xl p-4 border border-border/40 bg-card/80 backdrop-blur-md shadow-xs hover:border-indigo-500/30 transition-all duration-200 flex flex-col justify-between space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-1 min-w-0">
          <Badge variant="outline" className="rounded-full text-[9px] font-bold uppercase border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-2 py-0">
            {curso.nivelAcademico.nivel.nombre}
          </Badge>
          <h4 className="text-sm font-bold text-foreground truncate uppercase">
            {curso.areaCurricular.nombre}
          </h4>
          <p className="text-xs text-muted-foreground font-medium">
            {curso.nivelAcademico.grado.nombre} — Sección &quot;{curso.nivelAcademico.seccion}&quot;
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl size-7 text-muted-foreground hover:text-foreground cursor-pointer">
              <IconDotsVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border border-border/40 z-[80]">
            <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" asChild>
              <Link href="/gestion/estudiantes">Ver Estudiantes</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer text-indigo-600 dark:text-indigo-400" asChild>
              <Link href="/evaluaciones">Ingresar Notas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg text-xs font-medium cursor-pointer" asChild>
              <Link href="/asistencia">Tomar Asistencia</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="pt-2 border-t border-border/30 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
          <IconUsers size={14} className="text-indigo-500" />
          {curso._count?.estudiantes || 0} Alumnos
        </span>
        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 rounded-lg cursor-pointer gap-1" asChild>
          <Link href="/evaluaciones">
            <span>Gestionar</span>
            <IconChevronRight size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: AlertaAsistencia }) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30 text-xs">
      <div className="min-w-0 pr-2">
        <p className="font-bold text-foreground truncate uppercase text-[11px]">
          {alert.estudiante.name} {alert.estudiante.apellidoPaterno}
        </p>
        <p className="text-[10px] text-muted-foreground">
          Inasistencia: {formatDate(alert.fecha)}
        </p>
      </div>
      <Badge variant="outline" className="text-[9px] font-bold text-red-600 border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded-full shrink-0">
        Inasistente
      </Badge>
    </div>
  );
}

function PendingGradeItem({ evalu }: { evalu: EvaluacionDocente }) {
  return (
    <Link
      href={`/evaluaciones/${evalu.id}/notas`}
      className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/30 hover:border-amber-500/30 transition-all duration-200 text-xs group"
    >
      <div className="min-w-0 pr-2">
        <p className="font-bold text-foreground truncate uppercase text-[11px] group-hover:text-amber-600 dark:group-hover:text-amber-400">
          {evalu.curso.areaCurricular.nombre}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium">
          {evalu.tipoEvaluacion.nombre} — {formatDate(evalu.fecha)}
        </p>
      </div>
      <IconChevronRight size={14} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
    </Link>
  );
}
