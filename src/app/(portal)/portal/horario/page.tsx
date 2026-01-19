import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStudentScheduleAction } from "@/actions/portal";
import { ScheduleBanner } from "@/components/portal/schedule-banner";
import { WeeklySchedule } from "@/components/portal/weekly-schedule";
import { NotasFilter } from "@/components/portal/notas-filter";
import { Card } from "@/components/ui/card";
import { IconBookOff } from "@tabler/icons-react";

interface HorarioPageProps {
  searchParams: Promise<{ hijoId?: string }>;
}

export default async function PortalHorarioPage({
  searchParams,
}: HorarioPageProps) {
  const session = await auth();
  const { hijoId } = await searchParams;

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
        <ScheduleBanner />
        <Card className="border-dashed p-12 text-center">
          <p className="text-lg font-bold">No tienes hijos vinculados</p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

  // 3. Obtener horario
  const scheduleRes = await getStudentScheduleAction(selectedHijoId);
  const horarios = scheduleRes.data || [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-700">
      <ScheduleBanner />

      <NotasFilter
        hijos={hijos}
        periodos={[]}
        currentHijoId={selectedHijoId}
        currentPeriodoId=""
        showPeriodo={false}
      />

      {horarios.length === 0 ? (
        <Card className="border-dashed p-20 text-center bg-muted/20">
          <IconBookOff className="mx-auto size-16 text-muted-foreground/40 mb-4" />
          <p className="text-xl font-bold tracking-tight">
            Horario no disponible
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Aún no se ha configurado la carga horaria para el grado de tu hijo.
          </p>
        </Card>
      ) : (
        <WeeklySchedule horarios={horarios} />
      )}

      <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-3xl flex items-start gap-4 shadow-inner">
        <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
          <IconBookOff className="size-6" />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-200">
            Sobre la Programación Académica
          </h4>
          <p className="text-sm text-amber-700/80 dark:text-amber-300/60 mt-1">
            Los horarios están sujetos a cambios por actividades institucionales
            programadas. Se notificará a través del módulo de Comunicaciones
            cualquier ajuste mayor.
          </p>
        </div>
      </div>
    </div>
  );
}
