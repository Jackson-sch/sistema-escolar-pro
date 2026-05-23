import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getPeriodosAction,
  getResumenNotasEstudianteAction,
  getRankingEstudianteAction,
  getAsistenciaEstudianteAction,
} from "@/actions/evaluations";
import { getParentStudentsAction } from "@/actions/portal";
import { getInstitucionesAction } from "@/actions/academic";
import { CourseGradesCard } from "@/components/portal/academic/course-grades-card";
import { NotasFilter } from "@/components/portal/academic/notas-filter";
import { NotasStatsSummary } from "@/components/portal/academic/notas-stats-summary";
import { TeacherCommentCard } from "@/components/portal/academic/teacher-comment-card";
import { Card } from "@/components/ui/card";
import { IconUser, IconBookOff, IconFileDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

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
  const hijosRes = await getParentStudentsAction({ padreId: session.user.id });
  const hijos = hijosRes.success || [];

  if (hijos.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
        <div className="space-y-1 mt-4 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Rendimiento Académico
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Gestión detallada de notas, promedios y retroalimentación
            pedagógica.
          </p>
        </div>
        <Card className="border-dashed p-12 text-center bg-card/20 backdrop-blur-xl rounded-[2.5rem]">
          <IconUser className="mx-auto size-14 text-muted-foreground/40 mb-4" />
          <p className="text-xl font-bold tracking-tight">
            No tienes hijos vinculados
          </p>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Contacta a secretaría para vincular a tus hijos a tu cuenta y
            empezar el seguimiento.
          </p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;
  const selectedHijo =
    hijos.find((h: any) => h.id === selectedHijoId) || hijos[0];

  // 3. Obtener año académico actual de la institución
  const { data: instituciones = [] } = await getInstitucionesAction();
  const currentYear =
    instituciones[0]?.cicloEscolarActual || new Date().getFullYear();

  // 4. Obtener periodos académicos
  const periodosRes = await getPeriodosAction({ anioEscolar: currentYear });
  const periodos = periodosRes.success || [];

  // 5. Periodo seleccionado (URL o el primero activo)
  const selectedPeriodoId = periodoId || periodos[0]?.id;

  // 6. Obtener notas
  const resNotas = await getResumenNotasEstudianteAction({
    estudianteId: selectedHijoId,
    periodoId: selectedPeriodoId === "all" ? undefined : selectedPeriodoId,
  });
  const notasPorCurso = resNotas.success || {};
  const cursosGrupos = Object.values(notasPorCurso);

  // 7. Calcular estadísticas para el resumen
  const promedios = cursosGrupos.map((g: any) => g.promedio);
  const promedioGeneral =
    promedios.length > 0
      ? promedios.reduce((a, b) => a + b, 0) / promedios.length
      : 0;

  // 7. Calcular ranking real
  const rankingRes = await getRankingEstudianteAction({
    estudianteId: selectedHijoId,
    periodoId: selectedPeriodoId === "all" ? undefined : selectedPeriodoId,
    anioEscolar: currentYear,
  });
  const rankingData = (rankingRes.success as any) || { posicion: 0, total: 0 };
  const rankingStr =
    rankingData.total > 0
      ? `#${rankingData.posicion.toString().padStart(2, "0")} de ${rankingData.total}`
      : "---";

  // 8. Calcular asistencia real
  const asistenciaRes = await getAsistenciaEstudianteAction({
    estudianteId: selectedHijoId,
    periodoId: selectedPeriodoId === "all" ? undefined : selectedPeriodoId,
    anioEscolar: currentYear,
  });
  const asistenciaData = asistenciaRes.success || { porcentaje: 0 };
  const asistenciaReal = asistenciaData.porcentaje;

  // 8. Extraer comentarios para el rotador
  const allComments = cursosGrupos.flatMap((grupo: any) =>
    grupo.notas
      .filter((n: any) => n.comentario && n.comentario.trim() !== "")
      .map((n: any) => ({
        comment: n.comentario,
        teacherName: grupo.curso.profesor?.name
          ? `${grupo.curso.profesor.name} ${grupo.curso.profesor.apellidoPaterno}`
          : "Docente del Curso",
        courseName: grupo.curso.nombre,
      })),
  );

  const displayComments =
    allComments.length > 0
      ? allComments
      : [
          {
            comment:
              "Bienvenido a tu panel de rendimiento. Aquí podrás ver tus progresos y las observaciones de tus docentes una vez sean registradas.",
            teacherName: "Sistema Académico",
            courseName: "Portal Estudiantil",
          },
        ];

  return (
    <div className="flex flex-1 flex-col gap-8 p-4 sm:p-6 pt-0 @container/main animate-in fade-in duration-1000">
      {/* Header: Título y Descripción */}
      <header className="space-y-4 animate-in slide-in-from-top-4 duration-700">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Rendimiento Académico
          </h1>
          <p className="text-sm md:text-base text-muted-foreground/80 font-medium leading-relaxed">
            Gestión detallada de notas, promedios y retroalimentación
            pedagógica.
          </p>
        </div>

        {/* Panel de Control Integrado (Arriba bajo el título) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6 items-start">
          <div className="bg-card/40 backdrop-blur-xl border border-border/40 p-4 rounded-[2rem] shadow-sm space-y-4">
            <NotasFilter
              hijos={hijos}
              periodos={periodos.map((p: any) => ({
                id: p.id,
                nombre: p.nombre,
              }))}
              currentHijoId={selectedHijoId}
              currentPeriodoId={selectedPeriodoId}
            />

            <div className="pt-2 border-t border-border/20 flex justify-end">
              <Button 
                asChild
                variant="outline"
                className="rounded-2xl gap-2 font-bold px-6 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
              >
                <a 
                  href={`/api/documentos/boleta?estudianteId=${selectedHijoId}&anio=${currentYear}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconFileDownload size={18} />
                  Descargar Boleta Oficial ({currentYear})
                </a>
              </Button>
            </div>
          </div>
          <div className="h-full">
            <TeacherCommentCard comments={displayComments} className="h-full" />
          </div>
        </div>
      </header>

      {/* Resumen de Estadísticas */}
      <NotasStatsSummary
        promedio={promedioGeneral}
        asistencia={asistenciaReal}
        ranking={rankingStr}
      />

      {/* Listado de Cursos - Dos columnas en desktop */}
      <main className="space-y-6">
        {cursosGrupos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cursosGrupos.map((grupo: any) => (
              <CourseGradesCard
                key={grupo.curso.id}
                curso={grupo.curso}
                notas={grupo.notas}
                promedio={grupo.promedio}
              />
            ))}
          </div>
        ) : (
          <Card className="border-dashed p-16 text-center bg-card/20 backdrop-blur-xl rounded-[2.5rem]">
            <IconBookOff className="mx-auto size-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-bold uppercase tracking-tight text-muted-foreground/60">
              Sin evaluaciones oficiales
            </p>
            <p className="text-xs text-muted-foreground/40 mt-2 max-w-xs mx-auto">
              Las calificaciones aparecerán una vez finalizada la carga docente
              del periodo.
            </p>
          </Card>
        )}
      </main>

      {/* Footer / Nota legal */}
      <footer className="pt-10 border-t border-border/20">
        <p className="text-center text-[9px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30">
          Sistema de Certificación Escolar Académica • Datos Verificados
        </p>
      </footer>
    </div>
  );
}
