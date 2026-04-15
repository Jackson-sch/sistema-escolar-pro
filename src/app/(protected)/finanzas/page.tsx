import { Suspense } from "react";
import {
  getConceptosAction,
  getCronogramaAction,
  getEstadisticasCobranzaAction,
} from "@/actions/finance";
import { getInstitucionesAction } from "@/actions/academic";
import { getSeccionesAction } from "@/actions/academic-structure";
import { getVariableByKeyAction } from "@/actions/variables";
import {
  FORMATO_COMPROBANTE_KEY,
  type FormatoComprobante,
} from "@/lib/comprobante-constants";
import { ConceptoTable } from "@/components/finanzas/conceptos/concepto-table";
import { CronogramaTable } from "@/components/finanzas/cronogramas/cronograma-table";
import { AddConceptoButton } from "@/components/finanzas/conceptos/add-concepto-button";
import { AddPensionButton } from "@/components/finanzas/cronogramas/add-pension-button";
import { BulkActionsButton } from "@/components/finanzas/cronogramas/bulk-actions-button";
import { FinanzasDashboard } from "@/components/finanzas/dashboard";
import { FinanzasReportes } from "@/components/finanzas/reportes/reportes";
import { FinanzasTabs } from "@/components/finanzas/finanzas-tabs";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { FinanzasDashboardSkeleton } from "@/components/finanzas/dashboard-skeleton";

/**
 * Componente que carga las estadísticas del dashboard
 */
async function DashboardWrapper() {
  const { success: estadisticas } = await getEstadisticasCobranzaAction({});
  return <FinanzasDashboard estadisticas={estadisticas} />;
}

/**
 * Componente que carga el cuerpo principal (Tabs)
 */
async function FinanzasContent() {
  const currentYear = new Date().getFullYear();
  const [
    { success: conceptos = [] },
    { success: cronograma = [] },
    { data: instituciones = [] },
    { data: secciones = [] },
    formatoRes,
  ] = await Promise.all([
    getConceptosAction({}),
    getCronogramaAction({}),
    getInstitucionesAction(),
    getSeccionesAction({ anioAcademico: currentYear }),
    getVariableByKeyAction(FORMATO_COMPROBANTE_KEY),
  ]);

  const institucionId = instituciones[0]?.id || "";
  const formatoComprobante = (formatoRes.data?.valor ||
    "A4") as FormatoComprobante;

  return (
    <FinanzasTabs>
      {{
        cronograma: (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Cronograma de pagos pendientes por estudiante.
              </p>
              <div className="flex-1 flex justify-end items-center gap-2 order-1 sm:order-2">
                <BulkActionsButton
                  conceptos={conceptos}
                  secciones={secciones}
                />
                <AddPensionButton conceptos={conceptos} secciones={secciones} />
              </div>
            </div>
            <CronogramaTable
              data={cronograma}
              conceptos={conceptos}
              institucion={instituciones[0]}
              formatoComprobante={formatoComprobante}
            />
          </>
        ),
        conceptos: (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Catálogo de conceptos de pago: Matrícula, Pensiones, etc.
              </p>
              <div className="order-1 sm:order-2">
                <AddConceptoButton institucionId={institucionId} />
              </div>
            </div>
            <ConceptoTable data={conceptos} meta={{ institucionId }} />
          </>
        ),
        reportes: <FinanzasReportes cronograma={cronograma} />,
      }}
    </FinanzasTabs>
  );
}

export default async function FinanzasPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Gestión Financiera
          </h1>
          <p className="text-sm text-muted-foreground">
            Control integral de pensiones, pagos y cobranzas institucional.
          </p>
        </div>
      </div>

      <Suspense fallback={<FinanzasDashboardSkeleton />}>
        <DashboardWrapper />
      </Suspense>

      <Suspense fallback={<DataTableSkeleton rowCount={8} />}>
        <FinanzasContent />
      </Suspense>
    </div>
  );
}
