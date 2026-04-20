import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentDashboardDataAction } from "@/actions/portal";
import { StudentSelector } from "@/components/portal/layout/student-selector";
import { DashboardContent } from "@/components/portal/dashboard/dashboard-content";
import { Card } from "@/components/ui/card";
import { IconUser } from "@tabler/icons-react";

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

  // Type assertion or check to fix inferred '{}' issue
  const data = result.success as {
    hijos: any[];
    currentStudent: any;
    stats: any;
  };

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive font-bold">
          {result.error || "Error al cargar los datos"}
        </p>
      </div>
    );
  }

  const { hijos, currentStudent, stats } = data;

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0">
        <div className="space-y-1 mt-4 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Bienvenido al Portal
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Resumen general de la actividad escolar y accesos rápidos.
          </p>
        </div>
        <Card className="border-dashed p-12 text-center bg-muted/20">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <IconUser className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold">No tienes hijos registrados</p>
          <p className="text-sm text-muted-foreground mt-2">
            Contacta a la administración para vincular a tus hijos al sistema.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 md:p-10 pt-0 @container/main animate-in fade-in duration-700 min-h-screen max-w-[1600px] mx-auto w-full">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Bienvenido al Portal
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Resumen general de la actividad escolar y accesos rápidos.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-2 border-b border-white/5">
        <div className="flex flex-col gap-4">
          <StudentSelector students={hijos} />
        </div>
      </div>

      {/* Dashboard Específico del Estudiante */}
      <main className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-primary rounded-full" />
          <h2 className="text-2xl font-black tracking-tight capitalize">
            Panel de {currentStudent.name}
          </h2>
        </div>

        <DashboardContent data={{ currentStudent, stats }} />
      </main>
    </div>
  );
}
