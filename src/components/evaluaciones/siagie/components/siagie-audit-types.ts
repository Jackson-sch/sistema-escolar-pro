import {
  SectionAuditSummary,
  SectionAuditDetail,
} from "@/actions/siagie-audit";

export interface SiagieAuditConsoleProps {
  initialData: {
    periodoActualId: string;
    periodos: Array<{ id: string; nombre: string; activo: boolean }>;
    kpis: {
      porcentajeGlobal: number;
      totalSecciones: number;
      seccionesListasCount: number;
      seccionesObservadasCount: number;
      seccionesIncompletasCount: number;
      granTotalEsperado: number;
      granTotalRegistrado: number;
    };
    secciones: SectionAuditSummary[];
  };
}

export type { SectionAuditSummary, SectionAuditDetail };
