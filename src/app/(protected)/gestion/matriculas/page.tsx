import {
  IconUsers,
  IconCloudDownload,
  IconSchool,
  IconCertificate,
  IconArrowRight,
  IconBook2,
} from "@tabler/icons-react";
import {
  getEnrollmentsAction,
  getEnrollmentStatsAction,
} from "@/actions/enrollments";
import { getNivelesAcademicosAction } from "@/actions/students";
import { getInstitucionAction } from "@/actions/institucion";
import { columns } from "@/components/gestion/matriculas/columns";
import { EnrollmentTable } from "@/components/gestion/matriculas/enrollment-table";
import { AddEnrollmentButton } from "@/components/gestion/matriculas/add-enrollment-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Stats from "@/components/gestion/matriculas/stats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Suspense } from "react";

export default async function MatriculasPage() {
  const { data: institucion } = await getInstitucionAction();
  const currentAnio = institucion?.cicloEscolarActual || 2026;

  // Carga paralela de datos maestros y registros
  const [
    { data: enrollments = [] },
    { data: nivelesAcademicos = [] },
    { data: stats },
  ] = await Promise.all([
    getEnrollmentsAction(), // Podríamos filtrar también aquí si fuera necesario
    getNivelesAcademicosAction(currentAnio),
    getEnrollmentStatsAction(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Registro de Matrículas
          </h1>
          <p className="text-muted-foreground text-[10px] sm:text-xs">
            Control de inscripciones académicas, asignación de aulas y estados
            de vacantes {currentAnio}.
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 sm:w-auto sm:px-3"
                >
                  <IconCloudDownload className="sm:mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Reporte Consolidado</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reporte Consolidado</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AddEnrollmentButton nivelesAcademicos={nivelesAcademicos as any} />
        </div>
      </div>

      <div className="px-4 sm:px-2 space-y-6">
        {/* BANNER DE ESTADO RÁPIDO - DASHBOARD STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Stats stats={stats} />
        </div>

        <Suspense
          fallback={
            <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-xl" />
          }
        >
          <EnrollmentTable
            columns={columns}
            data={enrollments as any}
            meta={{ nivelesAcademicos, institucion }}
          />
        </Suspense>
      </div>
    </div>
  );
}
