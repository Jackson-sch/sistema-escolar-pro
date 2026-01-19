import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconClipboardList, IconReportAnalytics, IconAlertTriangle } from "@tabler/icons-react"
import { getEvaluacionesAction, getTiposEvaluacionAction, getPeriodosAction } from "@/actions/evaluations"
import { getCoursesAction, getInstitucionesAction } from "@/actions/academic"
import { EvaluacionTable } from "@/components/evaluaciones/evaluacion-table"
import { EvaluacionReports } from "@/components/evaluaciones/evaluacion-reports"
import { AddEvaluacionButton } from "@/components/evaluaciones/add-evaluacion-button"
import { AddPeriodoButton } from "@/components/evaluaciones/add-periodo-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { EvaluacionesTabs } from "@/components/evaluaciones/evaluaciones-tabs"
import { Suspense } from "react"

interface Props {
  searchParams: Promise<{
    cursoId?: string
    tipoId?: string
    periodoId?: string
  }>
}

export default async function EvaluacionesPage() {
  const [
    { data: evaluaciones = [] },
    { data: tipos = [] },
    { data: periodos = [] },
    { data: cursos = [] },
    { data: instituciones = [] }
  ] = await Promise.all([
    getEvaluacionesAction(),
    getTiposEvaluacionAction(),
    getPeriodosAction(),
    getCoursesAction(),
    getInstitucionesAction()
  ])

  const institucionId = instituciones[0]?.id || ""
  const hayPeriodos = periodos.length > 0

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">Gestión de Evaluaciones</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">
            Planificación académica y registro de calificaciones institucionales.
          </p>
        </div>
      </div>

      {/* Alerta si no hay periodos */}
      {!hayPeriodos && (
        <Alert variant="destructive" className="border-amber-200 bg-amber-50 text-amber-900 mx-4 sm:mx-2">
          <IconAlertTriangle className="size-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Configuración Requerida</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span>Debes crear al menos un periodo académico antes de programar evaluaciones.</span>
            <AddPeriodoButton institucionId={institucionId} />
          </AlertDescription>
        </Alert>
      )}

      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">Cargando módulos de evaluación...</div>}>
        <EvaluacionesTabs>
          {{
            evaluaciones: (
              <div className="space-y-4 px-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-sm text-muted-foreground font-medium">
                    Listado de evaluaciones programadas y sus estados.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {hayPeriodos && <AddPeriodoButton institucionId={institucionId} />}
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
              <div className="space-y-4">
                <EvaluacionReports evaluaciones={evaluaciones} />
              </div>
            )
          }}
        </EvaluacionesTabs>
      </Suspense>
    </div>
  )
}

