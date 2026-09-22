"use client";

import { ReporteHeader } from "./reporte-header";
import { ReporteTable } from "./reporte-table";
import { ReporteEmptyState } from "./reporte-empty-state";
import { ReporteAlertas } from "./reporte-alertas";
import { ReporteInstitucional } from "./reporte-institucional";
import { ReporteIndividual } from "./reporte-individual";
import { ReporteJustificaciones } from "./reporte-justificaciones";
import { InstReportData } from "./reporte-types";

interface ReporteResultadosProps {
  reportType: string;
  isPending: boolean;
  seccionId: string;
  studentId: string;
  reportData: any[];
  daysInMonth: number;
  anio: number;
  mes: number;
  alertsData: any[];
  instData: InstReportData;
  studentData: any[];
  justificationsData: any[];
  estudianteNombre: string;
}

function MensualReportView({
  isPending,
  mes,
  anio,
  reportData,
  daysInMonth,
}: {
  isPending: boolean;
  mes: number;
  anio: number;
  reportData: any[];
  daysInMonth: number;
}) {
  if (isPending) {
    return (
      <div className="bg-card/80 border border-border/40 rounded-2xl overflow-hidden shadow-xs flex flex-col items-center justify-center min-h-[400px]">
        <ReporteEmptyState type="loading" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <ReporteHeader
        mes={mes}
        anio={anio}
        totalEstudiantes={reportData.length}
        data={reportData}
        daysInMonth={daysInMonth}
      />
      <div>
        {reportData.length > 0 ? (
          <ReporteTable
            reportData={reportData}
            daysInMonth={daysInMonth}
            anio={anio}
            mes={mes}
          />
        ) : (
          <div className="bg-card/80 border border-border/40 rounded-2xl p-8">
            <ReporteEmptyState type="empty" />
          </div>
        )}
      </div>
    </div>
  );
}

function InstitucionalReportView({
  instData,
  seccionId,
  isPending,
}: {
  instData: InstReportData;
  seccionId: string;
  isPending: boolean;
}) {
  const resumen =
    seccionId && seccionId !== "all"
      ? instData.data.filter((d: any) => d.id === seccionId)
      : instData.data;

  return (
    <ReporteInstitucional
      resumen={resumen}
      stats={instData.stats}
      trendData={instData.trendData}
      meta={instData.meta}
      isPending={isPending}
    />
  );
}

function isInitialEmptyState(
  reportType: string,
  seccionId: string,
  studentId: string,
  isPending: boolean,
): boolean {
  if (isPending || seccionId || studentId) return false;
  return (
    reportType !== "institucional" &&
    reportType !== "alertas" &&
    reportType !== "justificaciones"
  );
}

export function ReporteResultados({
  reportType,
  isPending,
  seccionId,
  studentId,
  reportData,
  daysInMonth,
  anio,
  mes,
  alertsData,
  instData,
  studentData,
  justificationsData,
  estudianteNombre,
}: ReporteResultadosProps) {
  const showInitialEmpty = isInitialEmptyState(reportType, seccionId, studentId, isPending);

  return (
    <div className="flex-1 p-4 lg:p-6 pt-0">
      {reportType === "mensual" && seccionId && (
        <MensualReportView
          isPending={isPending}
          mes={mes}
          anio={anio}
          reportData={reportData}
          daysInMonth={daysInMonth}
        />
      )}

      {reportType === "alertas" && (
        <ReporteAlertas alertas={alertsData} isPending={isPending} />
      )}

      {reportType === "institucional" && (
        <InstitucionalReportView
          instData={instData}
          seccionId={seccionId}
          isPending={isPending}
        />
      )}

      {reportType === "individual" && studentId && (
        <ReporteIndividual
          data={studentData}
          estudianteNombre={estudianteNombre}
          isPending={isPending}
        />
      )}

      {reportType === "justificaciones" && (
        <ReporteJustificaciones
          justificaciones={justificationsData}
          isPending={isPending}
        />
      )}

      {showInitialEmpty && (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 animate-in fade-in animation-duration-">
          <ReporteEmptyState type="initial" />
        </div>
      )}
    </div>
  );
}
