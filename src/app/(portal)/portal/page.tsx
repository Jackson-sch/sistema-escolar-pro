import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentDashboardDataAction } from "@/actions/portal";
import { StudentSelector } from "@/components/portal/layout/student-selector";
import { DashboardContent } from "@/components/portal/dashboard/dashboard-content";
import { Card } from "@/components/ui/card";
import { IconUser, IconSchool } from "@tabler/icons-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Portal de Familias | Sistema Escolar Pro",
  description: "Resumen del día, asistencia, estado de pensiones y calificaciones del estudiante.",
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
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <PageHeader
          icon={<IconSchool size={20} />}
          title="Portal de Familias"
          badge="Área de Apoderados"
          description="Resumen de actividad escolar, calificaciones y estado de pensiones."
        />

        <Card className="rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center shadow-xs">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <IconUser className="size-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">No tienes estudiantes asociados</h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
            Por favor, contacta a la secretaría o administración del colegio para vincular a tus hijos al portal.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL CON SELECTOR DE HIJOS ── */}
      <PageHeader
        icon={<IconSchool size={20} />}
        title={`Portal de Familias`}
        badge={currentStudent.grado || "Área Familiar"}
        description={`Seguimiento en tiempo real para apoderados · ${currentStudent.name} ${currentStudent.apellidoPaterno || ""}`}
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: currentStudent.name || "Estudiante" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Suspense fallback={<div className="h-9 w-40 rounded-xl bg-muted/40 animate-pulse" />}>
              <StudentSelector students={hijos} />
            </Suspense>
          </div>
        }
      />

      {/* ── CONTENIDO PRINCIPAL: EL PARTE DEL DÍA ── */}
      <main className="space-y-4">
        <DashboardContent data={{ currentStudent, stats }} />
      </main>
    </div>
  );
}
