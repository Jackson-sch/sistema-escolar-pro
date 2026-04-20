import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentDisciplineRecordsForParentAction } from "@/actions/discipline";
import { getParentStudentsAction } from "@/actions/portal";
import { DisciplineList } from "@/components/portal/discipline/discipline-list";
import { NotasFilter } from "@/components/portal/academic/notas-filter";
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
  const hijosRes = await getParentStudentsAction({ padreId: session.user.id });
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0">
        <div className="space-y-1 mt-4 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Registro de Disciplina
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Seguimiento de conducta y méritos estudiantiles.
          </p>
        </div>
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
  const disciplineRes = await getStudentDisciplineRecordsForParentAction({
    studentId: selectedHijoId,
  });
  const records = disciplineRes.success || [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-10 pt-0 animate-in fade-in duration-700">
      {/* Sección de Encabezado */}
      <div className="space-y-1 mt-4 md:mt-0">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          Registro de Disciplina
        </h1>
        <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
          Seguimiento de conducta y méritos estudiantiles.
        </p>
      </div>

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
