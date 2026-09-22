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

import { PageHeader } from "@/components/common/page-header";
import { IconCalendarCheck } from "@tabler/icons-react";

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
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      <PageHeader
        icon={<IconCalendarCheck size={20} />}
        title="Control de Asistencia"
        badge="Diario & QR"
        description={`Registro y monitoreo de asistencia, tardanzas y justificaciones · Periodo ${dbYear}`}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Académico", href: "/asistencia" },
          { label: "Asistencia" },
        ]}
      />

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            Cargando módulos de asistencia...
          </div>
        }
      >
        <AsistenciaTabs isProfessor={isProfessor}>
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
