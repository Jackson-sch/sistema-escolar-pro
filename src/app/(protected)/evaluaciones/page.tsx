import { Suspense } from "react";
import { IconAlertTriangle, IconClipboardCheck } from "@tabler/icons-react";
import {
  getEvaluacionesAction,
  getTiposEvaluacionAction,
  getPeriodosAction,
} from "@/actions/evaluations";
import { getCoursesAction, getInstitucionesAction } from "@/actions/academic";
import { getSeccionesAction } from "@/actions/academic-structure";
import { EvaluacionTable } from "@/components/evaluaciones/management/evaluacion-table";
import { EvaluacionReports } from "@/components/evaluaciones/reportes/evaluacion-reports";
import { EvaluacionButton } from "@/components/evaluaciones/management/evaluacion-button";
import { CnebBatchGeneratorDialog } from "@/components/evaluaciones/management/cneb-batch-generator-dialog";
import { AddPeriodoButton } from "@/components/evaluaciones/management/add-periodo-button";
import { PeriodosManager } from "@/components/evaluaciones/periodos/periodos-manager";
import { SiagieExportDialog } from "@/components/evaluaciones/siagie-export-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EvaluacionesTabs } from "@/components/evaluaciones/evaluaciones-tabs";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { Badge } from "@/components/ui/badge";

import { auth } from "@/auth";

import { PageHeader } from "@/components/common/page-header";

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
    seccionesRes,
  ] = await Promise.all([
    getEvaluacionesAction({ profesorId }),
    getTiposEvaluacionAction({}),
    getPeriodosAction({ anioEscolar: currentYear }),
    getCoursesAction({ anioAcademico: currentYear, profesorId }),
    getSeccionesAction({ anioAcademico: currentYear, profesorId }),
  ]);

  const evaluaciones = evaluacionesRes.success || [];
  const tipos = tiposRes.success || [];
  const periodos = periodosRes.success || [];
  const cursos = cursosRes.data || [];
  const secciones = (seccionesRes.data as any) || [];
  const instituciones = initialInstituciones.data || [];

  const institucionId = instituciones[0]?.id || "";
  const hayPeriodos = periodos.length > 0;

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL ── */}
      <PageHeader
        icon={<IconClipboardCheck size={20} />}
        title="Evaluaciones & Calificaciones"
        badge="CNEB & SIAGIE"
        description={`Planificación curricular, cronograma de exámenes y registro de notas · Periodo ${currentYear}`}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/evaluaciones" },
          { label: "Evaluaciones" },
        ]}
      />

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
              <AddPeriodoButton
                institucionId={institucionId}
                existingCount={0}
              />
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
                    <div className="flex flex-wrap items-center gap-2.5">
                      <SiagieExportDialog
                        periodos={periodos}
                        secciones={secciones}
                      />
                      {hayPeriodos && (
                        <AddPeriodoButton
                          institucionId={institucionId}
                          existingCount={periodos.length}
                        />
                      )}
                      {hayPeriodos && secciones.length > 0 && (
                        <CnebBatchGeneratorDialog
                          periodos={periodos}
                          secciones={secciones}
                          profesorId={profesorId}
                        />
                      )}
                      <EvaluacionButton
                        tipos={tipos}
                        periodos={periodos}
                        cursos={cursos}
                      />
                    </div>
                  </div>
                  <EvaluacionTable
                    data={evaluaciones}
                    meta={{ tipos, periodos, cursos, secciones }}
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
              periodos: (
                <div className="space-y-6">
                  <PeriodosManager
                    periodos={periodos}
                    institucionId={institucionId}
                  />
                </div>
              ),
            }}
          </EvaluacionesTabs>
        </Suspense>
      </div>
    </div>
  );
}
