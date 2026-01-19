import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  getPeriodosAction,
  getResumenNotasEstudianteAction,
} from "@/actions/evaluations";
import { NotasBanner } from "@/components/portal/notas-banner";
import { CourseGradesCard } from "@/components/portal/course-grades-card";
import { NotasFilter } from "@/components/portal/notas-filter";
import { Card } from "@/components/ui/card";
import { IconUser, IconBookOff } from "@tabler/icons-react";

interface NotasPageProps {
  searchParams: Promise<{ hijoId?: string; periodoId?: string }>;
}

export default async function PortalNotasPage({
  searchParams,
}: NotasPageProps) {
  const session = await auth();
  const { hijoId, periodoId } = await searchParams;

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
        <NotasBanner />
        <Card className="border-dashed p-12 text-center">
          <IconUser className="mx-auto size-12 text-muted-foreground mb-4" />
          <p className="text-lg font-bold">No tienes hijos vinculados</p>
          <p className="text-sm text-muted-foreground mt-1">
            Contacta a secretaría para vincular a tus hijos a tu cuenta.
          </p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;
  const selectedHijo = hijos.find((h) => h.id === selectedHijoId) || hijos[0];

  // 3. Obtener periodos académicos
  const periodosRes = await getPeriodosAction(2025); // Hardcoded year for now as in the rest of the app
  const periodos = periodosRes.data || [];

  // 4. Determinar periodo seleccionado (por defecto el activo o el primero)
  const activePeriodo = periodos.find((p: any) => p.activo) || periodos[0];
  const selectedPeriodoId = periodoId || activePeriodo?.id;

  // 5. Obtener notas del estudiante seleccionado
  const notasRes = await getResumenNotasEstudianteAction(
    selectedHijoId,
    selectedPeriodoId
  );
  const notasPorCurso = notasRes.data || {};
  const cursosIds = Object.keys(notasPorCurso);

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 @container/main animate-in fade-in duration-700">
      <NotasBanner />

      {/* Selectores de Filtro */}
      <NotasFilter
        hijos={hijos}
        periodos={periodos.map((p: any) => ({ id: p.id, nombre: p.nombre }))}
        currentHijoId={selectedHijoId}
        currentPeriodoId={selectedPeriodoId}
      />

      {/* Lista de Cursos y Notas */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/80">
            Cursos Matriculados ({cursosIds.length})
          </h2>
        </div>

        {cursosIds.length === 0 ? (
          <Card className="border-dashed p-20 text-center bg-muted/20">
            <IconBookOff className="mx-auto size-16 text-muted-foreground/40 mb-4" />
            <p className="text-xl font-bold tracking-tight">
              No hay notas registradas
            </p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
              Aún no se han publicado calificaciones para {selectedHijo.name} en
              el periodo seleccionado.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {Object.values(notasPorCurso).map((grupo: any) => (
              <CourseGradesCard
                key={grupo.curso.id}
                curso={grupo.curso}
                notas={grupo.notas}
                promedio={grupo.promedio}
              />
            ))}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground px-4 italic">
        * Las notas mostradas son referenciales. El boletín oficial es emitido
        por la secretaría académica al finalizar el periodo.
      </p>
    </div>
  );
}
