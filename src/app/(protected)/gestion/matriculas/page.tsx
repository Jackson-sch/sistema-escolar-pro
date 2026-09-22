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
import { DownloadEnrollmentsReportButton } from "@/components/gestion/matriculas/components/download-consolidado-button";
import Stats from "@/components/gestion/matriculas/components/stats";
import { Badge } from "@/components/ui/badge";

import { Suspense } from "react";

import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Padrón de Matrículas | Sistema Escolar Pro",
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
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL ── */}
      <PageHeader
        icon={<IconSchool size={20} />}
        title="Padrón de Matrículas"
        badge={`Ciclo ${currentAnio}`}
        description="Control de vacantes por aula, ratificación de matrícula y emisión de constancias oficiales"
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Matrícula", href: "/gestion/matriculas" },
          { label: "Padrón" },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <DownloadEnrollmentsReportButton />
            <AddEnrollmentButton nivelesAcademicos={nivelesAcademicos as any} />
          </div>
        }
      />

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
