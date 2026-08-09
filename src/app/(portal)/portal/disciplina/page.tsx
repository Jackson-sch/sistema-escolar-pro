import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentDisciplineRecordsForParentAction } from "@/actions/discipline";
import { getParentStudentsAction } from "@/actions/portal";
import { DisciplineList } from "@/components/portal/discipline/discipline-list";
import { NotasFilter } from "@/components/portal/academic/notas-filter";
import { Card } from "@/components/ui/card";
import { IconUser, IconInfoCircle, IconShieldCheck } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const metadata = {
  title: "Registro Conductual | Portal de Familia",
  description: "Seguimiento de méritos, deméritos y observaciones psicopedagógicas.",
};

interface DisciplinaPageProps {
  searchParams: Promise<{ hijoId?: string }>;
}

export default async function PortalDisciplinaPage({
  searchParams,
}: DisciplinaPageProps) {
  const session = await auth();
  const { hijoId } = await searchParams;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const hijosRes = await getParentStudentsAction({ padreId: session.user.id });
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="space-y-2 px-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconShieldCheck size={14} />
            Convivencia Escolar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Registro de Disciplina
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Seguimiento de conducta, reconocimientos y deméritos estudiantiles.
          </p>
        </div>
        <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
          <IconUser className="mx-auto size-14 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-bold tracking-tight text-foreground">No tienes estudiantes asociados</h3>
        </Card>
      </div>
    );
  }

  const selectedHijoId = hijoId || hijos[0].id;

  const disciplineRes = await getStudentDisciplineRecordsForParentAction({
    studentId: selectedHijoId,
  });
  const records = disciplineRes.success || [];

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconShieldCheck size={14} />
            Convivencia Escolar
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Registro de Disciplina
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Seguimiento de conducta, reconocimientos meritorios e incidencias evaluadas por tutoría.
          </p>
        </div>
      </div>

      {/* Selector de Hijo */}
      <div className="px-1">
        <Suspense fallback={<div className="h-9 rounded-full bg-muted/40 animate-pulse" />}>
          <NotasFilter
            hijos={hijos}
            periodos={[]}
            currentHijoId={selectedHijoId}
            currentPeriodoId=""
            showPeriodo={false}
          />
        </Suspense>
      </div>

      {/* Lista de Registros */}
      <div className="px-1">
        <DisciplineList records={records} />
      </div>

      {/* Nota sobre Política de Visibilidad */}
      <div className="px-1">
        <div className="flex items-start gap-4 rounded-2xl border border-border/40 bg-card/80 p-5 shadow-sm">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <IconInfoCircle className="size-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Política de Transparencia y Convivencia</h4>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Únicamente se visualizan los registros oficializados por la dirección de convivencia o tutoría. Para agendar una entrevista pedagógica con el equipo psicopedagógico, comunícate mediante la sección de avisos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
