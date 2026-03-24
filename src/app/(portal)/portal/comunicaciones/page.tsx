import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getPortalCommunicationsAction,
  getParentStudentsAction,
} from "@/actions/portal";
import { ComunicacionesDashboardClient } from "@/components/portal/dashboard/comunicaciones-dashboard-client";
import { Card } from "@/components/ui/card";
import { StudentSelector } from "@/components/portal/layout/student-selector";
import Link from "next/link";

import { TeacherCard } from "@/components/portal/docentes/teacher-card";
import { getDirectorioDocentesAction } from "@/actions/docentes";

interface ComunicacionesPageProps {
  searchParams: Promise<{ hijoId?: string; view?: string }>;
}

export default async function PortalComunicacionesPage({
  searchParams,
}: ComunicacionesPageProps) {
  const session = await auth();
  const { hijoId, view } = await searchParams;

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
            Centro de Comunicaciones
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Mantente informado con los avisos y circulares de la institución.
          </p>
        </div>
        <Card className="border-dashed p-12 text-center">
          <p className="text-lg font-bold">
            {hijosRes.error || "No tienes hijos vinculados"}
          </p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

  // 3. Obtener comunicaciones o docentes
  let commsRes: any = {};
  let docentes: any[] = [];

  if (view === "docentes") {
    const docentesRes = await getDirectorioDocentesAction();
    docentes = docentesRes.data || [];
  } else {
    commsRes = await getPortalCommunicationsAction(selectedHijoId);
  }

  const { anuncios = [], eventos = [] } = commsRes.data || {};

  return (
    <div className="flex-1 flex flex-col gap-8 p-4 sm:p-10 pt-0 animate-in fade-in duration-700">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0 mb-4 xl:mb-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          {view === "docentes"
            ? "Directorio Docente"
            : "Centro de Comunicaciones"}
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          {view === "docentes"
            ? "Conoce a los profesionales de la educación que conforman nuestro plantel."
            : "Mantente informado con los avisos y circulares de la institución."}
        </p>
      </div>

      <div className="flex flex-col xl:flex-row w-full gap-8">
        {/* Sidebar Izquierdo (Student & Navigation) */}
        <aside className="w-full xl:w-64 flex flex-col gap-8 shrink-0">
          <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">
              Estudiante Actual
            </p>
            <StudentSelector students={hijos} orientation="vertical" />
          </div>

          <div className="hidden xl:flex flex-col gap-1">
            <Link
              href="/portal/comunicaciones"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!view || view !== "docentes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Actividad Reciente
            </Link>
            <Link
              href="/portal/comunicaciones?view=docentes"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === "docentes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
            >
              Directorio Docente
            </Link>
          </div>
        </aside>

        {/* Contenido Principal (Feed o Docentes) */}
        {view === "docentes" ? (
          <div className="flex-1 space-y-8 min-w-0">
            {docentes.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-muted/10">
                <p className="text-xl font-bold text-muted-foreground/80">
                  Sin docentes registrados
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {docentes.map((docente) => (
                  <TeacherCard key={docente.id} teacher={docente as any} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <ComunicacionesDashboardClient
            anuncios={anuncios}
            eventos={eventos}
          />
        )}
      </div>
    </div>
  );
}
