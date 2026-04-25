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
  IconGraphFilled,
  IconSparkles,
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

interface TeacherDashboardProps {
  data: {
    cursos: any[];
    upcomingEvaluations: any[];
    criticalAttendance: any[];
    evaluationsToGrade: any[];
    todaySchedule: any[];
  };
}

export function TeacherDashboard({ data }: TeacherDashboardProps) {
  const {
    cursos,
    upcomingEvaluations,
    criticalAttendance,
    evaluationsToGrade,
    todaySchedule,
  } = data;

  const totalStudents = cursos.reduce(
    (acc, curso) => acc + (curso._count?.estudiantes || 0),
    0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Welcome Banner - Premium Look */}
      <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-indigo-600 via-primary to-purple-700 p-8 md:p-10 text-white shadow-2xl shadow-primary/30 border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-white/20 hover:bg-white/30 border-white/20 text-white backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit shadow-sm">
              <IconSparkles size={14} />
              Portal Docente Pro
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-sm">
              ¡Panel de Control Académico!
            </h2>
            <p className="text-white/80 font-medium max-w-lg text-lg leading-relaxed">
              Gestiona tus clases, califica evaluaciones y monitorea el progreso de tus alumnos desde un solo lugar.
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <Button size="lg" className="rounded-2xl bg-white text-primary hover:bg-white/90 font-black shadow-xl shadow-white/10 transition-all hover:scale-105 hover:-translate-y-1 h-14 px-6 text-base" asChild>
              <Link href="/evaluaciones/nueva">
                <IconCalendarStats className="mr-2 size-6" />
                Nueva Evaluación
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 size-[500px] rounded-full bg-white/20 blur-[80px] animate-blob" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 size-[400px] rounded-full bg-purple-400/30 blur-[60px] animate-blob" style={{ animationDelay: "2s" }} />
        <IconLayoutDashboard className="absolute -bottom-10 -right-10 size-80 text-white/5 md:text-white/10 rotate-12 drop-shadow-2xl mix-blend-overlay" />
      </div>

      {/* KPI Cards - Elite Design */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KPIItem
          title="Mis Alumnos"
          value={totalStudents.toString()}
          label="Estudiantes activos"
          icon={IconUsers}
          color="blue"
          trend="+2 esta semana"
        />
        <KPIItem
          title="Cursos Asignados"
          value={cursos.length.toString()}
          label="Materias impartidas"
          icon={IconBook}
          color="indigo"
        />
        <KPIItem
          title="Eval. Programadas"
          value={upcomingEvaluations.length.toString()}
          label="Próximos 7 días"
          icon={IconCalendarStats}
          color="amber"
        />
        <KPIItem
          title="Por Calificar"
          value={evaluationsToGrade.length.toString()}
          label="Evaluaciones cerradas"
          icon={IconClipboardCheck}
          color="emerald"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          {/* Today's Schedule - New Section */}
          <section className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IconClock className="size-6" />
                </div>
                Horario de Hoy
              </h3>
              <Badge variant="outline" className="font-mono text-sm px-4 py-1.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </Badge>
            </div>
            <div className="grid gap-4">
              {todaySchedule.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-10 text-center border-dashed">
                  <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 text-primary">
                    <IconClock size={40} opacity={0.5} />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Día Libre</h4>
                  <p className="text-muted-foreground mt-2">No tienes clases programadas para hoy.</p>
                </div>
              ) : (
                todaySchedule.map((item: any) => (
                  <ScheduleItem key={item.id} item={item} />
                ))
              )}
            </div>
          </section>

          {/* Upcoming Evaluations */}
          <div className="liquid-glass rounded-3xl overflow-hidden flex flex-col border border-border/50">
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-border/50 bg-background/40">
              <div>
                <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                  Próximas Evaluaciones
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Cronograma de actividades evaluativas
                </p>
              </div>
              <Button variant="outline" className="rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors" asChild>
                <Link href="/evaluaciones">Gestionar todo</Link>
              </Button>
            </div>
            <div className="p-0 flex-1 bg-background/20 backdrop-blur-md">
              {upcomingEvaluations.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="size-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 text-muted-foreground ring-8 ring-background/50">
                    <IconCalendarStats size={48} opacity={0.5} />
                  </div>
                  <h4 className="text-xl font-bold text-foreground">Agenda Despejada</h4>
                  <p className="text-muted-foreground font-medium mt-2">No hay evaluaciones programadas para esta semana</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {upcomingEvaluations.map((evaluacion: any) => (
                    <EvaluationItem key={evaluacion.id} evaluacion={evaluacion} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Courses Grid */}
          <div className="space-y-5">
            <h3 className="text-2xl font-black tracking-tight px-2 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <IconBook className="size-6" />
              </div>
              Mis Cursos
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {cursos.map((curso: any) => (
                <CourseCard key={curso.id} curso={curso} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Attendance Alerts - High Priority */}
          <div className="liquid-glass rounded-3xl overflow-hidden border border-border/50 relative shadow-lg">
            <div className="absolute -top-10 -right-10 size-40 bg-red-500/10 rounded-full blur-3xl animate-blob" />
            
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-600 shadow-inner">
                  <IconAlertTriangle size={24} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-red-600">Alertas</h3>
                  <p className="text-xs text-red-600/70 font-medium">Faltas injustificadas (72h)</p>
                </div>
              </div>

              <div className="space-y-4">
                {criticalAttendance.length === 0 ? (
                  <div className="py-10 text-center bg-background/50 rounded-2xl border border-dashed border-border/50">
                    <IconClipboardCheck className="mx-auto size-10 text-emerald-500 mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground font-medium">Asistencia perfecta</p>
                  </div>
                ) : (
                  criticalAttendance.map((alert: any) => (
                    <AlertItem key={alert.id} alert={alert} />
                  ))
                )}
                <Button variant="ghost" className="w-full text-xs font-bold text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-colors rounded-xl h-10 mt-2" asChild>
                  <Link href="/asistencia">Ver reporte detallado</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Pending Grades - Task Style */}
          <div className="liquid-glass rounded-3xl overflow-hidden border border-border/50 relative shadow-lg">
            <div className="absolute -bottom-10 -left-10 size-40 bg-emerald-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: "1s" }} />

            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                  <IconClipboardCheck size={24} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-emerald-600">Pendientes</h3>
                  <p className="text-xs text-emerald-600/70 font-medium">Evaluaciones por calificar</p>
                </div>
              </div>

              <div className="space-y-4">
                {evaluationsToGrade.length === 0 ? (
                  <div className="py-10 text-center bg-background/50 rounded-2xl border border-dashed border-border/50">
                    <IconSparkles className="mx-auto size-10 text-emerald-500 mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground font-medium">¡Todo al día! Excelente.</p>
                  </div>
                ) : (
                  evaluationsToGrade.map((evalu: any) => (
                    <PendingGradeItem key={evalu.id} evalu={evalu} />
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tips / Productivity Card */}
          <div className="liquid-glass rounded-3xl overflow-hidden relative bg-linear-to-br from-primary to-indigo-700 text-primary-foreground border-none shadow-xl shadow-primary/20">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-blob" />
            <div className="p-8 relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner shadow-white/20">
                  <IconGraphFilled size={32} className="text-white" />
                </div>
                <h4 className="text-xl font-black tracking-tight drop-shadow-sm">Consejo de hoy</h4>
              </div>
              <p className="text-base text-white/90 leading-relaxed italic font-medium">
                "La educación no es la respuesta a la pregunta. La educación es el medio para encontrar la respuesta a todas las preguntas."
              </p>
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
  trend,
}: {
  title: string;
  value: string;
  label: string;
  icon: any;
  color: "blue" | "amber" | "red" | "emerald" | "indigo";
  trend?: string;
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-500/10",
    amber: "text-amber-600 bg-amber-500/10",
    red: "text-red-600 bg-red-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10",
    indigo: "text-indigo-600 bg-indigo-500/10",
  };

  const glowMap = {
    blue: "bg-blue-500/20",
    amber: "bg-amber-500/20",
    red: "bg-red-500/20",
    emerald: "bg-emerald-500/20",
    indigo: "bg-indigo-500/20",
  };

  return (
    <div className="liquid-glass rounded-3xl p-6 group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl flex flex-col relative overflow-hidden border border-border/50">
      {/* Background Glow */}
      <div className={cn("absolute -right-6 -top-6 size-32 rounded-full blur-3xl opacity-50 transition-all duration-500 group-hover:opacity-100 group-hover:scale-150", glowMap[color])} />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-inner", colorMap[color])}>
            <Icon size={28} strokeWidth={2} />
          </div>
          <div className={cn("p-2 rounded-xl opacity-20 group-hover:scale-110 transition-transform duration-500", colorMap[color].split(" ")[0])}>
             <Icon size={48} strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="space-y-2 mt-auto">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/80">
            {title}
          </p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground leading-none">{value}</h3>
            {trend && <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-md mb-1.5 shadow-sm">{trend}</span>}
          </div>
          <p className="text-xs font-medium text-muted-foreground mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ScheduleItem({ item }: { item: any }) {
  return (
    <div className="group relative flex items-center gap-5 p-5 rounded-3xl bg-background/60 border border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center min-w-[80px] py-2 border-r border-border/50">
        <span className="text-base font-black text-primary drop-shadow-sm">{item.horaInicio}</span>
        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1 bg-muted px-2 py-0.5 rounded-full">{item.horaFin}</span>
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h4 className="font-black text-lg truncate uppercase tracking-tight group-hover:text-primary transition-colors">
          {item.curso.areaCurricular.nombre}
        </h4>
        <div className="flex flex-wrap items-center gap-3 mt-2">
          <Badge variant="secondary" className="text-xs font-bold rounded-full px-3 py-1 bg-muted shadow-sm">
            {item.curso.nivelAcademico.grado.nombre} {item.curso.nivelAcademico.seccion}
          </Badge>
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 bg-background/80 px-3 py-1 rounded-full border shadow-sm">
            <IconUsers size={14} /> {item.curso.nivelAcademico.aulaAsignada || "Aula N/A"}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="rounded-full size-12 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground -mr-2 shadow-sm">
        <IconExternalLink size={20} />
      </Button>
    </div>
  );
}

function EvaluationItem({ evaluacion }: { evaluacion: any }) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-muted/40 transition-colors group">
      <div className="flex items-center gap-6">
        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
          <IconCalendarStats size={28} strokeWidth={2} />
        </div>
        <div className="space-y-1">
          <p className="font-black text-base uppercase tracking-tight group-hover:text-primary transition-colors">
            {evaluacion.curso.areaCurricular.nombre}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground border-border/50 bg-background/50">
               {evaluacion.curso.nivelAcademico.grado.nombre} {evaluacion.curso.nivelAcademico.seccion}
            </Badge>
            <span className="size-1.5 rounded-full bg-border" />
            <span className="text-primary font-black text-[11px] uppercase tracking-wider">{evaluacion.tipoEvaluacion.nombre}</span>
          </div>
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-2">
        <p className="text-sm font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20 shadow-sm">
          {formatDate(evaluacion.fecha)}
        </p>
        <Badge className="text-[9px] uppercase font-black tracking-widest bg-amber-100 text-amber-700 hover:bg-amber-200 border-none shadow-sm px-2 py-0.5">
          En Agenda
        </Badge>
      </div>
    </div>
  );
}

function CourseCard({ curso }: { curso: any }) {
  return (
    <div className="liquid-glass rounded-3xl p-6 group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40 relative overflow-hidden flex flex-col h-full border border-border/50">
       <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/15 transition-colors duration-500" />
       
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="size-16 rounded-2xl bg-background/80 shadow-sm border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
          <IconBook size={32} strokeWidth={1.5} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full bg-background/50 hover:bg-background shadow-sm size-10 border border-transparent hover:border-border">
              <IconDotsVertical size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border/50 backdrop-blur-md bg-background/90">
            <DropdownMenuItem className="rounded-xl cursor-pointer font-medium py-2">Ver Estudiantes</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer font-medium py-2 text-primary focus:bg-primary/10 focus:text-primary">Subir Notas</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl cursor-pointer font-medium py-2">Tomar Asistencia</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="space-y-2 relative z-10 flex-1">
        <Badge variant="outline" className="rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/5 border-primary/20 text-primary mb-2 shadow-sm">
          {curso.nivelAcademico.nivel.nombre}
        </Badge>
        <h4 className="text-xl font-black tracking-tight group-hover:text-primary transition-colors leading-tight drop-shadow-sm">
          {curso.areaCurricular.nombre}
        </h4>
        <p className="text-sm text-muted-foreground font-medium">
          {curso.nivelAcademico.grado.nombre} - Sección "{curso.nivelAcademico.seccion}"
        </p>
      </div>

      <div className="mt-8 pt-5 border-t border-border/50 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-background/90 border flex items-center justify-center shadow-sm">
            <IconUsers size={18} className="text-muted-foreground" />
          </div>
          <span className="text-sm font-black text-foreground drop-shadow-sm">{curso._count?.estudiantes || 0} alumnos</span>
        </div>
        <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl text-sm font-bold bg-background/50 border hover:bg-primary hover:border-primary hover:text-primary-foreground shadow-sm transition-all duration-300">
          Detalles <IconChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

function AlertItem({ alert }: { alert: any }) {
  return (
    <div className="group flex items-center gap-4 p-4 rounded-2xl bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 transition-colors duration-300" />
      <div className="size-12 rounded-xl bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-inner">
        <IconUsers size={24} />
      </div>
      <div className="min-w-0 flex-1 relative z-10">
        <p className="text-sm font-black truncate leading-tight uppercase tracking-tight text-foreground group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors">
          {alert.estudiante.name} {alert.estudiante.apellidoPaterno}
        </p>
        <p className="text-xs text-muted-foreground font-medium mt-1">
          Falta el {formatDate(alert.fecha)}
        </p>
      </div>
      <Badge variant="destructive" className="h-6 text-[10px] px-2 rounded-md font-black uppercase shadow-sm">
        Inasist.
      </Badge>
    </div>
  );
}

function PendingGradeItem({ evalu }: { evalu: any }) {
  return (
    <div className="group flex items-center justify-between p-4 rounded-2xl bg-background/80 border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border cursor-pointer relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-300" />
      <div className="min-w-0 relative z-10">
        <p className="text-sm font-black truncate leading-tight uppercase tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {evalu.curso.areaCurricular.nombre}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
           <Badge variant="outline" className="text-[9px] font-bold uppercase border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm px-1.5">
             {evalu.tipoEvaluacion.nombre}
           </Badge>
           <span className="text-[10px] text-muted-foreground font-medium">
            {formatDate(evalu.fecha)}
          </span>
        </div>
      </div>
      <div className="size-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800 transition-colors duration-300 relative z-10 shadow-inner">
        <IconChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}

