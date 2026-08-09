import {
  IconCloudDownload,
  IconSchool,
} from "@tabler/icons-react";
import {
  getEnrollmentsAction,
  getEnrollmentStatsAction,
} from "@/actions/enrollments";
import { getNivelesAcademicosAction } from "@/actions/students";
import { getInstitucionAction } from "@/actions/institucion";
import { columns } from "@/components/gestion/matriculas/components/columns";
import { EnrollmentTable } from "@/components/gestion/matriculas/management/enrollment-table";
import { AddEnrollmentButton } from "@/components/gestion/matriculas/components/add-enrollment-button";
import { Button } from "@/components/ui/button";
import Stats from "@/components/gestion/matriculas/components/stats";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Suspense } from "react";

export const metadata = {
  title: "Registro de Matrículas | Sistema Escolar Pro",
  description: "Control de inscripciones académicas, vacantes y asignación de aulas.",
};

export default async function MatriculasPage() {
  const { data: institucion } = await getInstitucionAction();
  const currentAnio = institucion?.cicloEscolarActual || 2026;

  const [
    { data: enrollments = [] },
    { data: nivelesAcademicos = [] },
    { data: stats },
  ] = await Promise.all([
    getEnrollmentsAction(),
    getNivelesAcademicosAction(currentAnio),
    getEnrollmentStatsAction(),
  ]);

  return (
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconSchool size={14} />
            Inscripciones Académicas {currentAnio}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Registro de Matrículas
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Control de vacantes por aula, ratificación de estudiantes y emisión de constancias de inscripción.
          </p>
        </div>

        <div className="flex flex-row gap-3 items-center shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" className="rounded-xl h-10 px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer">
                <IconCloudDownload className="size-4 text-muted-foreground" />
                <span className="hidden sm:inline">Reporte Consolidado</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-micro font-medium">
              Descargar consolidado de matrículas en formato excel
            </TooltipContent>
          </Tooltip>

          <AddEnrollmentButton nivelesAcademicos={nivelesAcademicos as any} />
        </div>
      </div>

      {/* ── BENTO KPIS ── */}
      <div className="px-1">
        <Stats stats={stats} />
      </div>

      {/* ── TABLA DE MATRÍCULAS ── */}
      <div className="px-1">
        <Suspense
          fallback={
            <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-2xl border border-border/40" />
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
