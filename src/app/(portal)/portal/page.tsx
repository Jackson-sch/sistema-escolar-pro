import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentDashboardDataAction } from "@/actions/portal";
import { StudentSelector } from "@/components/portal/layout/student-selector";
import { DashboardContent } from "@/components/portal/dashboard/dashboard-content";
import { Card } from "@/components/ui/card";
import { IconUser, IconSchool } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const metadata = {
  title: "Portal de Familia | Sistema Escolar Pro",
  description: "Resumen académico, estado financiero y seguimiento del estudiante.",
};

interface SearchParams {
  hijoId?: string;
}

export default async function PortalDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();
  const { hijoId } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const result = await getParentDashboardDataAction({
    estudianteId: hijoId,
  });

  const data = result.success as {
    hijos: any[];
    currentStudent: any;
    stats: any;
  };

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-destructive font-bold text-sm">
          {result.error || "Error al cargar los datos del portal"}
        </p>
      </div>
    );
  }

  const { hijos, currentStudent, stats } = data;

  if (hijos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="space-y-2 px-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSchool size={14} />
            Portal de Familia
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Bienvenido al Portal
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Resumen general de la actividad escolar, calificaciones y pagos.
          </p>
        </div>

        <Card className="rounded-2xl border border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
            <IconUser className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No tienes estudiantes asociados</h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Por favor, contacta a la oficina de administración de la institución para vincular a tus hijos al sistema.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSchool size={14} />
            Portal de Familia
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Bienvenido al Portal
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Resumen en tiempo real del progreso académico, control de asistencia y servicios del estudiante.
          </p>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Estudiante Seleccionado
          </span>
          <Suspense fallback={<div className="h-10 rounded-xl bg-muted/40 animate-pulse" />}>
            <StudentSelector students={hijos} />
          </Suspense>
        </div>
      </div>

      {/* ── PANEL DEL ESTUDIANTE ── */}
      <main className="space-y-4 px-1">
        <div className="flex items-center gap-3 py-1">
          <div className="flex size-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary shrink-0">
            <IconUser className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight capitalize text-foreground">
              Panel de {currentStudent.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {currentStudent.grado || "Información Académica"}
            </p>
          </div>
        </div>

        <DashboardContent data={{ currentStudent, stats }} />
      </main>
    </div>
  );
}
