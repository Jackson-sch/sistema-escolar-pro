import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getStudentMonthAttendanceAction,
  getParentStudentsAction,
} from "@/actions/portal";
import { AttendanceMetrics } from "@/components/portal/attendance/attendance-metrics";
import { AttendanceCalendar } from "@/components/portal/attendance/attendance-calendar";
import { NotasFilter } from "@/components/portal/academic/notas-filter"; // Reusing the filter component
import { Card } from "@/components/ui/card";
import { IconUser } from "@tabler/icons-react";

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
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <div className="space-y-1 mt-4 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Control de Asistencia
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Monitorea la puntualidad y asistencia diaria a clases.
          </p>
        </div>
        <Card className="border-dashed p-12 text-center">
          <IconUser className="mx-auto size-12 text-muted-foreground mb-4" />
          <p className="text-lg font-bold">No tienes hijos vinculados</p>
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
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-700">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Control de Asistencia
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Monitorea la puntualidad y asistencia diaria a clases.
        </p>
      </div>

      {/* Selector de Hijo (Reutilizamos NotasFilter por ahora ya que tiene la lógica de URL) */}
      <NotasFilter
        hijos={hijos}
        periodos={[]} // Not used here, we could extend it or create a MonthFilter
        currentHijoId={selectedHijoId}
        currentPeriodoId=""
        showPeriodo={false}
      />

      <AttendanceMetrics stats={stats} />

      <AttendanceCalendar
        asistencias={asistencias as any}
        currentDate={new Date(currentYear, currentMonth, 1)}
      />

      <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-start gap-4">
        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <IconUser className="size-6" />
        </div>
        <div>
          <h4 className="font-bold">Nota sobre Registro de Asistencia</h4>
          <p className="text-xs text-balance text-muted-foreground mt-1">
            La asistencia es registrada diariamente por el tutor o secretario en
            el aula. Si nota alguna inconsistencia en el registro de su hijo,
            por favor comuníquese con la oficina académica.
          </p>
        </div>
      </div>
    </div>
  );
}
