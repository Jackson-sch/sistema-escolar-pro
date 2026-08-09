import { Suspense } from "react";
import { IconAlertTriangle, IconClipboardCheck } from "@tabler/icons-react";
import {
  getEvaluacionesAction,
  getTiposEvaluacionAction,
  getPeriodosAction,
} from "@/actions/evaluations";
import { getCoursesAction, getInstitucionesAction } from "@/actions/academic";
import { EvaluacionTable } from "@/components/evaluaciones/management/evaluacion-table";
import { EvaluacionReports } from "@/components/evaluaciones/reportes/evaluacion-reports";
import { AddEvaluacionButton } from "@/components/evaluaciones/management/add-evaluacion-button";
import { AddPeriodoButton } from "@/components/evaluaciones/management/add-periodo-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EvaluacionesTabs } from "@/components/evaluaciones/evaluaciones-tabs";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Badge } from "@/components/ui/badge";

import { auth } from "@/auth";

export default async function EvaluacionesPage() {
  const session = await auth();
  const isProfessor = session?.user?.role === "profesor";
  const profesorId = isProfessor ? session?.user?.id : undefined;

  // Obtener año actual desde la institución o fecha
  const initialInstituciones = await getInstitucionesAction();
  const currentYear =
    initialInstituciones.data?.[0]?.cicloEscolarActual ||
    new Date().getFullYear();

  const [
    evaluacionesRes,
    tiposRes,
    periodosRes,
    cursosRes,
  ] = await Promise.all([
    getEvaluacionesAction({ profesorId }),
    getTiposEvaluacionAction({}),
    getPeriodosAction({ anioEscolar: currentYear }),
    getCoursesAction({ anioAcademico: currentYear, profesorId }),
  ]);

  const evaluaciones = evaluacionesRes.success || [];
  const tipos = tiposRes.success || [];
  const periodos = periodosRes.success || [];
  const cursos = cursosRes.data || [];
  const instituciones = initialInstituciones.data || [];

  const institucionId = instituciones[0]?.id || "";
  const hayPeriodos = periodos.length > 0;

  return (
    <div className="min-h-screen flex flex-col gap-8 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-medium uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconClipboardCheck size={14} />
            Académico & Calificaciones
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-none">
            Gestión de Evaluaciones
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Planifica, programa y califica evaluaciones institucionales. Gestiona periodos académicos, tipos de evaluación y genera reportes de rendimiento.
          </p>
        </div>
      </div>

      {/* ── ALERTA SI NO HAY PERIODOS ── */}
      {!hayPeriodos && (
        <div className="px-2">
          <Alert className="border-amber-500/30 bg-amber-500/5 rounded-2xl">
            <IconAlertTriangle className="size-4 text-amber-600" />
            <AlertTitle className="text-amber-700 dark:text-amber-400 font-bold">
              Configuración Requerida
            </AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-amber-700/80 dark:text-amber-300/80">
              <span>
                Debes crear al menos un periodo académico antes de programar
                evaluaciones.
              </span>
              <AddPeriodoButton institucionId={institucionId} />
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* ── TABS & CONTENT ── */}
      <div>
        <Suspense fallback={<DataTableSkeleton rowCount={8} />}>
          <EvaluacionesTabs>
            {{
              evaluaciones: (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">Evaluaciones Programadas</h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        Listado completo de evaluaciones y su estado de calificación.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {hayPeriodos && (
                        <AddPeriodoButton institucionId={institucionId} />
                      )}
                      <AddEvaluacionButton
                        tipos={tipos}
                        periodos={periodos}
                        cursos={cursos}
                      />
                    </div>
                  </div>
                  <EvaluacionTable
                    data={evaluaciones}
                    meta={{ tipos, periodos, cursos }}
                  />
                </div>
              ),
              reportes: (
                <div className="space-y-6">
                  <div className="px-2">
                    <h3 className="text-xl font-semibold tracking-tight">Reportes Académicos</h3>
                    <p className="text-sm text-muted-foreground font-normal">
                      Análisis de actividad evaluativa y distribución de metodologías por curso.
                    </p>
                  </div>
                  <EvaluacionReports evaluaciones={evaluaciones} />
                </div>
              ),
            }}
          </EvaluacionesTabs>
        </Suspense>
      </div>
    </div>
  );
}
