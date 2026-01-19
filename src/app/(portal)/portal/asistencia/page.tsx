import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStudentMonthAttendanceAction } from "@/actions/portal";
import { AttendanceBanner } from "@/components/portal/attendance-banner";
import { AttendanceMetrics } from "@/components/portal/attendance-metrics";
import { AttendanceCalendar } from "@/components/portal/attendance-calendar";
import { NotasFilter } from "@/components/portal/notas-filter"; // Reusing the filter component
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
  const relaciones = await prisma.relacionFamiliar.findMany({
    where: { padreTutorId: session.user.id },
    include: {
      hijo: {
        select: {
          id: true,
          name: true,
          apellidoPaterno: true,
        },
      },
    },
  });

  const hijos = relaciones.map((r) => r.hijo);

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <AttendanceBanner />
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
  const attendanceRes = await getStudentMonthAttendanceAction(
    selectedHijoId,
    currentMonth,
    currentYear
  );
  const asistencias = attendanceRes.data || [];

  // 5. Calcular estadísticas para el mes
  const stats = {
    total: asistencias.length,
    presentes: asistencias.filter(
      (a: any) => a.presente && !a.tardanza && !a.justificada
    ).length,
    faltas: asistencias.filter((a: any) => !a.presente && !a.justificada)
      .length,
    tardanzas: asistencias.filter((a: any) => a.tardanza).length,
    justificadas: asistencias.filter((a: any) => a.justificada).length,
  };

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-700">
      <AttendanceBanner />

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
        asistencias={asistencias}
        currentDate={new Date(currentYear, currentMonth, 1)}
      />

      <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-start gap-4">
        <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <IconUser className="size-6" />
        </div>
        <div>
          <h4 className="font-bold">Nota sobre Registro de Asistencia</h4>
          <p className="text-sm text-muted-foreground mt-1">
            La asistencia es registrada diariamente por el tutor o secretario en
            el aula. Si nota alguna inconsistencia en el registro de su hijo,
            por favor comuníquese con la oficina académica.
          </p>
        </div>
      </div>
    </div>
  );
}
