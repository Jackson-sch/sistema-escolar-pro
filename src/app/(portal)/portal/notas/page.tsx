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
import { IconUser, IconBookOff, IconFileDownload, IconAward } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const metadata = {
  title: "Rendimiento Académico | Portal de Familia",
  description: "Calificaciones por curso, promedios de periodo y observaciones docentes.",
};

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
      <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
        <div className="space-y-2 px-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconAward size={14} />
            Calificaciones
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Rendimiento Académico
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Gestión detallada de notas, promedios por curso y observaciones pedagógicas.
          </p>
        </div>
        <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
          <IconUser className="mx-auto size-14 text-muted-foreground/40 mb-4" />
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            No tienes hijos vinculados
          </h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto">
            Contacta a la oficina de secretaría para vincular a tus estudiantes y habilitar el reporte de notas.
          </p>
        </Card>
      </div>
    );
  }

  // 2. Determinar hijo seleccionado
  const selectedHijoId = hijoId || hijos[0].id;

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
  const rankingData = rankingRes.success || { posicion: 0, total: 0 };
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
    grupo.notas.flatMap((n: any) =>
      n.comentario && n.comentario.trim() !== ""
        ? [
            {
              comment: n.comentario,
              teacherName: grupo.curso.profesor?.name
                ? `${grupo.curso.profesor.name} ${grupo.curso.profesor.apellidoPaterno}`
                : "Docente del Curso",
              courseName: grupo.curso.nombre,
            },
          ]
        : [],
    ),
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
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconAward size={14} />
            Calificaciones y Libreta
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Rendimiento Académico
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Gestión de calificaciones por unidad, cálculo de promedios vigesimales y descarga de libreta oficial.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            asChild
            variant="default"
            className="rounded-xl h-10 px-4 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
          >
            <a
              href={`/api/documentos/boleta?estudianteId=${selectedHijoId}&anio=${currentYear}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconFileDownload className="size-4" />
              <span>Boleta Oficial ({currentYear})</span>
            </a>
          </Button>
        </div>
      </div>

      {/* ── FILTROS Y COMENTARIOS DOCENTES ── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_380px] px-1">
        <div className="space-y-4 rounded-2xl border border-border/40 bg-card/80 p-4 shadow-sm">
          <Suspense fallback={<div className="h-9 rounded-full bg-muted/40 animate-pulse" />}>
            <NotasFilter
              hijos={hijos}
              periodos={periodos.map((p: any) => ({
                id: p.id,
                nombre: p.nombre,
              }))}
              currentHijoId={selectedHijoId}
              currentPeriodoId={selectedPeriodoId}
            />
          </Suspense>
        </div>
        <div className="h-full">
          <TeacherCommentCard comments={displayComments} className="h-full" />
        </div>
      </div>

      {/* ── RESUMEN DE ESTADÍSTICAS KPIS ── */}
      <div className="px-1">
        <NotasStatsSummary
          promedio={promedioGeneral}
          asistencia={asistenciaReal}
          ranking={rankingStr}
        />
      </div>

      {/* ── LISTADO DE CURSOS ── */}
      <main className="space-y-6 px-1">
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
          <Card className="rounded-2xl border-dashed border-border/50 bg-card/80 p-12 text-center shadow-sm">
            <IconBookOff className="mx-auto size-12 text-muted-foreground/30 mb-4" />
            <p className="text-base font-bold uppercase tracking-tight text-muted-foreground">
              Sin evaluaciones oficiales
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
              Las calificaciones aparecerán una vez los docentes registren las notas del periodo.
            </p>
          </Card>
        )}
      </main>

      {/* Footer / Nota legal */}
      <footer className="border-t border-border/30 pt-6 mt-4">
        <p className="text-center text-[10px] font-semibold text-muted-foreground/60">
          Sistema de Certificación Escolar Académica • Datos Oficiales Verificados
        </p>
      </footer>
    </div>
  );
}
