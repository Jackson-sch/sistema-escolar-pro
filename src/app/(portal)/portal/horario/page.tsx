import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getStudentScheduleAction,
  getParentStudentsAction,
} from "@/actions/portal";
import { ScheduleViewManager } from "@/components/portal/schedule/schedule-view-manager";
import { Card } from "@/components/ui/card";
import { IconBookOff, IconClock, IconUser } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const metadata = {
  title: "Horario Escolar | Portal de Familia",
  description: "Programación de clases semanales y distribución por horas pedagógicas.",
};

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
  const hijosRes = await getParentStudentsAction({});
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="space-y-2 px-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconClock size={14} />
            Carga Horaria
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Horario Escolar
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Consulta la programación semanal de clases y actividades del estudiante.
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

  // 3. Obtener horario
  const scheduleRes = await getStudentScheduleAction({
    estudianteId: selectedHijoId,
  });
  const horarios = scheduleRes.success || [];

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconClock size={14} />
            Carga Horaria
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Horario Escolar
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Distribución semanal de materias, docentes asignados y aulas por periodo pedagógico.
          </p>
        </div>
      </div>

      <div className="px-1">
        {horarios.length === 0 ? (
          <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
            <IconBookOff className="mx-auto size-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-xl font-bold tracking-tight text-foreground">
              Horario no disponible
            </h3>
            <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto">
              Aún no se ha publicado la carga horaria definitiva para la sección asignada.
            </p>
          </Card>
        ) : (
          <Suspense fallback={<div className="h-64 rounded-2xl bg-muted/40 animate-pulse" />}>
            <ScheduleViewManager
              horarios={horarios}
              hijos={hijos}
              selectedHijoId={selectedHijoId}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
