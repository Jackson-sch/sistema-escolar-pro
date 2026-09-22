import { Suspense } from "react";
import {
  getConceptosAction,
  getCronogramaAction,
  getEstadisticasCobranzaAction,
} from "@/actions/finance";
import { getInstitucionesAction } from "@/actions/academic";
import { getNivelesAction } from "@/actions/academic-structure";
import { getVariableByKeyAction } from "@/actions/variables";
import {
  FORMATO_COMPROBANTE_KEY,
  type FormatoComprobante,
} from "@/lib/comprobante-constants";
import { ConceptoTable } from "@/components/finanzas/conceptos/concepto-table";
import { CronogramaTable } from "@/components/finanzas/cronogramas/cronograma-table";
import { FinanzasDashboard } from "@/components/finanzas/dashboard";
import { FinanzasReportes } from "@/components/finanzas/reportes/reportes";
import { FinanzasTabs } from "@/components/finanzas/finanzas-tabs";
import { CajaRapidaPOS } from "@/components/finanzas/pos/caja-rapida-pos";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";
import { FinanzasDashboardSkeleton } from "@/components/finanzas/dashboard-skeleton";
import { PageHeader } from "@/components/common/page-header";
import { IconWallet } from "@tabler/icons-react";

/**
 * Componente que carga las estadísticas del dashboard
 */
async function DashboardData() {
  const statsRes = await getEstadisticasCobranzaAction({});
  const estadisticas = statsRes.success || {
    pendiente: 0,
    cobrado: 0,
    deudasVencidas: 0,
    totalMora: 0,
    pagosPendientesVerificacion: 0,
    recaudacionMensual: 0,
    proyeccionMensual: 0,
  };

  return <FinanzasDashboard estadisticas={estadisticas} />;
}

/**
 * Componente que carga el contenido principal de finanzas
 */
async function FinanzasContent() {
  const [
    conceptosRes,
    cronogramaRes,
    institucionesRes,
    nivelesRes,
    formatoVarRes,
  ] = await Promise.all([
    getConceptosAction({ includeInactive: true }),
    getCronogramaAction({}),
    getInstitucionesAction(),
    getNivelesAction(),
    getVariableByKeyAction(FORMATO_COMPROBANTE_KEY),
  ]);

  const conceptos = (conceptosRes as any).success || (conceptosRes as any).data || [];
  const cronograma = (cronogramaRes as any).success || (cronogramaRes as any).data || [];
  const instituciones = (institucionesRes as any).data || (institucionesRes as any).success || [];
  const niveles = (nivelesRes as any).data || (nivelesRes as any).success || [];
  const institucionId = instituciones[0]?.id || "";
  const formatoComprobante =
    (formatoVarRes.data?.valor as FormatoComprobante) || "TICKET";

  return (
    <FinanzasTabs>
      {{
        caja: <CajaRapidaPOS />,
        cronograma: (
          <CronogramaTable
            data={cronograma as any}
            conceptos={conceptos}
            niveles={niveles}
            institucion={instituciones[0]}
            formatoComprobante={formatoComprobante}
          />
        ),
        conceptos: (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 px-1">
              <div>
                <h3 className="text-base font-extrabold text-foreground tracking-tight">
                  Catálogo de Conceptos de Cobro
                </h3>
                <p className="text-xs text-muted-foreground font-normal">
                  Configuración de pensiones mensuales, matrículas, APAFA y
                  servicios escolares.
                </p>
              </div>
            </div>
            <ConceptoTable data={conceptos} meta={{ institucionId }} />
          </div>
        ),
        reportes: (
          <FinanzasReportes
            cronograma={cronograma}
            institucion={instituciones[0]}
          />
        ),
      }}
    </FinanzasTabs>
  );
}

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Finanzas"
        description="Panel central de recaudación, cronogramas de pensiones, caja y reportes de tesorería"
        icon={<IconWallet className="size-6 text-primary" />}
      />

      <Suspense fallback={<FinanzasDashboardSkeleton />}>
        <DashboardData />
      </Suspense>

      <Suspense fallback={<DataTableSkeleton />}>
        <FinanzasContent />
      </Suspense>
    </div>
  );
}
