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
import { Badge } from "@/components/ui/badge";
import { IconWallet } from "@tabler/icons-react";

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

  // Extraer niveles únicos de las secciones
  const nivelesMap = new Map();
  secciones.forEach((s: any) => {
    if (s.nivel && !nivelesMap.has(s.nivel.id)) {
      nivelesMap.set(s.nivel.id, s.nivel);
    }
  });
  const niveles = Array.from(nivelesMap.values());

  return (
    <FinanzasTabs>
      {{
        cronograma: (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Cronograma de Pagos</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Seguimiento detallado de cuotas por estudiante.
                </p>
              </div>
              <div className="flex justify-end items-center gap-3">
                <BulkActionsButton
                  conceptos={conceptos}
                  niveles={niveles}
                />
                <AddPensionButton conceptos={conceptos} niveles={niveles} />
              </div>
            </div>
            <CronogramaTable
              data={cronograma as any}
              conceptos={conceptos}
              niveles={niveles}
              institucion={instituciones[0]}
              formatoComprobante={formatoComprobante}
            />
          </div>
        ),
        conceptos: (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">Catálogo de Conceptos</h3>
                <p className="text-sm text-muted-foreground font-normal">
                  Configuración de pensiones, matrículas y otros servicios.
                </p>
              </div>
              <div className="order-1 sm:order-2">
                <AddConceptoButton institucionId={institucionId} />
              </div>
            </div>
            <ConceptoTable data={conceptos} meta={{ institucionId }} />
          </div>
        ),
        reportes: <FinanzasReportes cronograma={cronograma} institucion={instituciones[0]} />,
      }}
    </FinanzasTabs>
  );
}

export default async function FinanzasPage() {
  return (
    <div className="min-h-screen flex flex-col gap-8 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-medium uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconWallet size={14} />
            Tesorería & Cobranzas
          </Badge>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-none">
            Gestión Financiera
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Administra el ciclo de vida financiero de la institución con herramientas de cobranza avanzada y análisis de recaudación en tiempo real.
          </p>
        </div>
      </div>

      {/* ── DASHBOARD ── */}
      <div className="px-2">
        <Suspense fallback={<FinanzasDashboardSkeleton />}>
          <DashboardWrapper />
        </Suspense>
      </div>

      {/* ── TABS & CONTENT ── */}
      <div>
        <Suspense fallback={<DataTableSkeleton rowCount={8} />}>
          <FinanzasContent />
        </Suspense>
      </div>
    </div>
  );
}

