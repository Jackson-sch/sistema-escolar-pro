import { Suspense } from "react";
import {
  getSeccionesAction,
  getAniosAcademicosAction,
} from "@/actions/academic-structure";
import { getInstitucionByIdAction } from "@/actions/institucion";
import { AsistenciaTabs } from "@/components/asistencia/asistencia-tabs";
import { AsistenciaClient } from "@/components/asistencia/asistencia-client";
import { AsistenciaReportes } from "@/components/asistencia/asistencia-reportes";
import { QRScannerDashboard } from "@/components/asistencia/scanner-qr/qr-scanner-dashboard";
import { PoliticasAsistenciaClient } from "@/components/asistencia/politicas/politicas-asistencia-client";

import { auth } from "@/auth";

export default async function AsistenciaPage() {
  const session = await auth();
  const isProfessor = session?.user?.role === "profesor";
  const profesorId = isProfessor ? session?.user?.id : undefined;

  const currentYear = new Date().getFullYear();
  const [seccionesRes, aniosRes, institucionRes] = await Promise.all([
    getSeccionesAction({
      anioAcademico: currentYear,
      profesorId,
    }),
    getAniosAcademicosAction(),
    getInstitucionByIdAction(session?.user?.institucionId || undefined),
  ]);

  const institucion = institucionRes.data;
  const dbYear = institucion?.cicloEscolarActual || currentYear;

  const secciones = seccionesRes.data || [];
  const anios = aniosRes.data || [];

  // Asegurarnos que el año actual/db esté en la lista si no hay datos
  const finalAnios = anios.length > 0 ? anios : [dbYear];

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Control de Asistencia
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">
            Gestión diaria y reportes consolidados por nivel y sección.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            Cargando módulos de asistencia...
          </div>
        }
      >
        <AsistenciaTabs>
          {{
            registro: (
              <Suspense fallback={<div>Cargando panel de asistencia...</div>}>
                <AsistenciaClient
                  initialSecciones={secciones}
                  aniosAcademicos={finalAnios}
                  defaultYear={dbYear}
                  profesorId={profesorId}
                />
              </Suspense>
            ),
            reportes: (
              <Suspense fallback={<div>Cargando reportes...</div>}>
                <AsistenciaReportes
                  initialSecciones={secciones}
                  aniosAcademicos={finalAnios}
                  defaultYear={dbYear}
                  profesorId={profesorId}
                />
              </Suspense>
            ),
            scanner: (
              <Suspense fallback={<div>Cargando scanner...</div>}>
                <QRScannerDashboard />
              </Suspense>
            ),
            politicas: (
              <Suspense fallback={<div>Cargando políticas...</div>}>
                <PoliticasAsistenciaClient anioAcademico={dbYear} />
              </Suspense>
            ),
          }}
        </AsistenciaTabs>
      </Suspense>
    </div>
  );
}
