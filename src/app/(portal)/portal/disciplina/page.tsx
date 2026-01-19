import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getStudentDisciplineRecordsForParentAction } from "@/actions/discipline";
import { DisciplineBanner } from "@/components/portal/discipline-banner";
import { DisciplineList } from "@/components/portal/discipline-list";
import { NotasFilter } from "@/components/portal/notas-filter";
import { Card } from "@/components/ui/card";
import { IconUser, IconInfoCircle } from "@tabler/icons-react";

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
        <DisciplineBanner />
        <Card className="border-dashed p-12 text-center rounded-3xl">
          <IconUser className="mx-auto size-12 text-muted-foreground mb-4" />
          <p className="text-lg font-bold">No tienes hijos vinculados</p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

  // 3. Obtener registros disciplinarios visibles
  const disciplineRes = await getStudentDisciplineRecordsForParentAction(
    selectedHijoId
  );
  const records = disciplineRes.data || [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 animate-in fade-in duration-700">
      <DisciplineBanner />

      {/* Selector de Hijo */}
      <NotasFilter
        hijos={hijos}
        periodos={[]}
        currentHijoId={selectedHijoId}
        currentPeriodoId=""
        showPeriodo={false}
      />

      <DisciplineList records={records} />

      <div className="bg-muted/30 border border-border/50 p-6 rounded-3xl flex items-start gap-4">
        <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
          <IconInfoCircle className="size-6" />
        </div>
        <div>
          <h4 className="font-bold">Política de Visibilidad</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Solo se muestran los registros autorizados por la dirección o el
            departamento psicopedagógico. Si desea más información o agendar una
            cita con el especialista, por favor utilice el módulo de
            comunicaciones.
          </p>
        </div>
      </div>
    </div>
  );
}
