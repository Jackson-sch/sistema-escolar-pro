import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getStudentScheduleAction,
  getParentStudentsAction,
} from "@/actions/portal";
import { ScheduleViewManager } from "@/components/portal/schedule/schedule-view-manager";
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
  const hijosRes = await getParentStudentsAction(session.user.id);
  const hijos = hijosRes.data || [];

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0">
        <div className="space-y-1 mt-4 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Horario Escolar
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Consulta la programación semanal de clases y actividades.
          </p>
        </div>
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
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0 animate-in fade-in duration-700 max-w-[1400px] w-full mx-auto">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Horario Escolar
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Consulta la programación semanal de clases y actividades.
        </p>
      </div>

      {horarios.length === 0 ? (
        <Card className="border-dashed p-20 text-center bg-muted/20 mt-8">
          <IconBookOff className="mx-auto size-16 text-muted-foreground/40 mb-4" />
          <p className="text-xl font-bold tracking-tight">
            Horario no disponible
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Aún no se ha configurado la carga horaria para el grado de tu hijo.
          </p>
        </Card>
      ) : (
        <ScheduleViewManager
          horarios={horarios}
          hijos={hijos}
          selectedHijoId={selectedHijoId}
        />
      )}
    </div>
  );
}
