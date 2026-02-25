import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getParentDashboardDataAction } from "@/actions/portal";
import { WelcomeBanner } from "@/components/portal/welcome-banner";
import { StudentSelector } from "@/components/portal/student-selector";
import { DashboardContent } from "@/components/portal/dashboard-content";
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
    padreId: session.user.id,
    estudianteId: hijoId,
  });

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-destructive font-bold">
          {result.error || "Error al cargar los datos"}
        </p>
      </div>
    );
  }

  const { hijos, currentStudent, stats } = result.success;

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4">
        <WelcomeBanner userName={session.user.name || ""} />
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
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-0 @container/main animate-in fade-in slide-in-from-bottom-4 duration-700 min-h-screen max-w-[1600px] mx-auto w-full">
      {/* Premium Welcome Banner */}
      <WelcomeBanner userName={session.user.name || ""} />
      {/* Custom Header from Design */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-8 border-b border-white/5">
        <div className="flex flex-col gap-4">
          <StudentSelector students={hijos} />
        </div>
      </header>

      {/* Dashboard Específico del Estudiante */}
      <main className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 bg-primary rounded-full" />
          <h2 className="text-2xl font-black tracking-tight">
            Panel de {currentStudent.name}
          </h2>
        </div>

        <DashboardContent data={{ currentStudent, stats }} />
      </main>
    </div>
  );
}
