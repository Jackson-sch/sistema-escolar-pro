import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getStudentMonthAttendanceAction,
  getParentStudentsAction,
} from "@/actions/portal";
import { AttendanceMetrics } from "@/components/portal/attendance/attendance-metrics";
import { AttendanceCalendar } from "@/components/portal/attendance/attendance-calendar";
import { NotasFilter } from "@/components/portal/academic/notas-filter";
import { Card } from "@/components/ui/card";
import { IconUser, IconCalendarCheck, IconInfoCircle } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const metadata = {
  title: "Control de Asistencia | Portal de Familia",
  description: "Monitoreo diario de puntualidad, faltas e inasistencias justificadas.",
};

interface AsistenciaPageProps {
  searchParams: Promise<{ hijoId?: string; mes?: string; anio?: string }>;
}

export default async function PortalAsistenciaPage({
  searchParams,
}: AsistenciaPageProps) {
  const session = await auth();
  const { hijoId, mes, anio } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  // 1. Obtener hijos del padre
  const hijosRes = await getParentStudentsAction({ padreId: session.user.id });
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="space-y-2 px-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconCalendarCheck size={14} />
            Asistencia Escolar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Control de Asistencia
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Monitorea la puntualidad y el registro diario de asistencia del estudiante.
          </p>
        </div>
        <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
          <IconUser className="mx-auto size-14 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-bold tracking-tight text-foreground">No tienes estudiantes asociados</h3>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

  // 3. Determinar mes y año (por defecto actual)
  const now = new Date();
  const currentMonth = mes ? parseInt(mes) : now.getMonth();
  const currentYear = anio ? parseInt(anio) : now.getFullYear();

  // 4. Obtener asistencias
  const attendanceRes = await getStudentMonthAttendanceAction({
    estudianteId: selectedHijoId,
    mes: currentMonth,
    anio: currentYear,
  });
  const asistencias = attendanceRes.success || [];

  // 5. Calcular estadísticas para el mes
  const stats = {
    total: asistencias.length,
    presentes: asistencias.filter(
      (a: any) => a.presente && !a.tardanza && !a.justificada,
    ).length,
    faltas: asistencias.filter((a: any) => !a.presente && !a.justificada)
      .length,
    tardanzas: asistencias.filter((a: any) => a.tardanza).length,
    justificadas: asistencias.filter((a: any) => a.justificada).length,
  };

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconCalendarCheck size={14} />
            Asistencia Escolar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Control de Asistencia
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Monitorea la puntualidad, tardanzas e inasistencias registradas diariamente en el aula.
          </p>
        </div>
      </div>

      {/* Selector de Hijo */}
      <div className="px-1">
        <Suspense fallback={<div className="h-9 rounded-full bg-muted/40 animate-pulse" />}>
          <NotasFilter
            hijos={hijos}
            periodos={[]}
            currentHijoId={selectedHijoId}
            currentPeriodoId=""
            showPeriodo={false}
          />
        </Suspense>
      </div>

      {/* Métrica de Asistencia */}
      <div className="px-1">
        <AttendanceMetrics stats={stats} />
      </div>

      {/* Calendario de Asistencia */}
      <div className="px-1">
        <Suspense fallback={<div className="h-56 rounded-2xl bg-muted/40 animate-pulse" />}>
          <AttendanceCalendar
            asistencias={asistencias as any}
            currentDate={new Date(currentYear, currentMonth, 1)}
          />
        </Suspense>
      </div>

      {/* Información Informativa */}
      <div className="px-1">
        <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card/80 p-5 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <IconInfoCircle className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Reglamento de Asistencia Escolar</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              La asistencia se registra durante los primeros 15 minutos del horario de ingreso. Las justificaciones de inasistencia deben ser remitidas a través de la oficina de tutoría en un plazo máximo de 48 horas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
