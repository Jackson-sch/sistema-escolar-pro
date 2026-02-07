import { Suspense } from "react";
import {
  getSeccionesAction,
  getAniosAcademicosAction,
} from "@/actions/academic-structure";
import { AsistenciaTabs } from "@/components/asistencia/asistencia-tabs";
import { AsistenciaClient } from "@/components/asistencia/asistencia-client";
import { AsistenciaReportes } from "@/components/asistencia/asistencia-reportes";

export default async function AsistenciaPage() {
  const currentYear = new Date().getFullYear();
  const [seccionesRes, aniosRes] = await Promise.all([
    getSeccionesAction({ anioAcademico: currentYear }),
    getAniosAcademicosAction(),
  ]);

  const secciones = seccionesRes.data || [];
  const anios = aniosRes.data || [];

  // Asegurarnos que el año actual esté en la lista si no hay datos
  const finalAnios = anios.length > 0 ? anios : [currentYear];

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
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
                  defaultYear={currentYear}
                />
              </Suspense>
            ),
            reportes: (
              <Suspense fallback={<div>Cargando reportes...</div>}>
                <AsistenciaReportes
                  initialSecciones={secciones}
                  aniosAcademicos={finalAnios}
                  defaultYear={currentYear}
                />
              </Suspense>
            ),
          }}
        </AsistenciaTabs>
      </Suspense>
    </div>
  );
}
