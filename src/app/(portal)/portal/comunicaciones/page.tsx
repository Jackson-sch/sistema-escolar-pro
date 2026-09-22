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
import { Badge } from "@/components/ui/badge";
import { IconSpeakerphone } from "@tabler/icons-react";
import { Suspense } from "react";
import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Centro de Comunicaciones | Portal de Familia",
  description: "Avisos institucionales, circulares y directorio de docentes del colegio.",
};

interface ComunicacionesPageProps {
  searchParams: Promise<{ hijoId?: string; view?: string }>;
}

function EmptyHijosAlert({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      <div className="space-y-2 px-2">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
          <IconSpeakerphone size={14} />
          Avisos y Comunicados
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
          Centro de Comunicaciones
        </h1>
        <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
          Mantente informado con los avisos oficiales y directivas de la institución.
        </p>
      </div>
      <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
        <p className="text-lg font-bold text-foreground">
          {message || "No tienes estudiantes asociados"}
        </p>
      </Card>
    </div>
  );
}

function ComunicacionesSidebar({
  hijos,
  isDocentesView,
}: {
  hijos: any[];
  isDocentesView: boolean;
}) {
  const activeClass = "bg-indigo-600 text-white shadow-xs";
  const inactiveClass = "text-muted-foreground hover:bg-card/80 hover:text-foreground";

  return (
    <aside className="w-full xl:w-64 flex flex-col gap-4 shrink-0">
      <div className="rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
          Estudiante Seleccionado
        </p>
        <Suspense fallback={<div className="h-9 rounded-full bg-muted/40 animate-pulse" />}>
          <StudentSelector students={hijos} orientation="vertical" />
        </Suspense>
      </div>

      <div className="hidden xl:flex flex-col gap-1.5 p-1 bg-card/80 border border-border/40 rounded-2xl">
        <Link
          href="/portal/comunicaciones"
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${!isDocentesView ? activeClass : inactiveClass}`}
        >
          Avisos Recientes
        </Link>
        <Link
          href="/portal/comunicaciones?view=docentes"
          className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${isDocentesView ? activeClass : inactiveClass}`}
        >
          Directorio Docente
        </Link>
      </div>
    </aside>
  );
}

function DocentesDirectoryView({ docentes }: { docentes: any[] }) {
  if (docentes.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/80 p-12 text-center shadow-sm">
        <p className="text-sm font-bold text-muted-foreground/80">
          Sin docentes registrados en el directorio
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {docentes.map((docente) => (
        <TeacherCard key={docente.id} teacher={docente as any} />
      ))}
    </div>
  );
}

async function fetchPortalCommunicationsData(view?: string, selectedHijoId?: string) {
  if (view === "docentes") {
    const docentesRes = await getDirectorioDocentesAction();
    return { docentes: docentesRes.data || [], anuncios: [], eventos: [] };
  }
  const commsRes = await getPortalCommunicationsAction({
    estudianteId: selectedHijoId || "",
  });
  const { anuncios = [], eventos = [] } = commsRes.success || {};
  return { docentes: [], anuncios, eventos };
}

export default async function PortalComunicacionesPage({
  searchParams,
}: ComunicacionesPageProps) {
  const session = await auth();
  const { hijoId, view } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const hijosRes = await getParentStudentsAction({ padreId: session.user.id });
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return <EmptyHijosAlert message={hijosRes.error} />;
  }

  const selectedHijoId = hijoId || hijos[0].id;
  const isDocentes = view === "docentes";
  const { docentes, anuncios, eventos } = await fetchPortalCommunicationsData(view, selectedHijoId);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      <PageHeader
        icon={<IconSpeakerphone size={20} />}
        title={isDocentes ? "Directorio Docente" : "Centro de Comunicaciones"}
        badge={isDocentes ? "Plantel Educativo" : "Avisos & Circulares"}
        description={
          isDocentes
            ? "Conoce a los docentes y tutores responsables del aprendizaje de tus hijos"
            : "Notificaciones oficiales, comunicados de dirección y calendario de actividades escolares"
        }
        breadcrumbs={[
          { label: "Portal", href: "/portal" },
          { label: isDocentes ? "Docentes" : "Comunicaciones" },
        ]}
      />

      <div className="flex flex-col xl:flex-row w-full gap-6 px-1">
        <ComunicacionesSidebar hijos={hijos} isDocentesView={isDocentes} />

        {isDocentes ? (
          <div className="flex-1 space-y-6 min-w-0">
            <DocentesDirectoryView docentes={docentes} />
          </div>
        ) : (
          <Suspense fallback={<div className="space-y-4" />}>
            <ComunicacionesDashboardClient
              anuncios={anuncios}
              eventos={eventos}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
