import { IconUsers } from "@tabler/icons-react";
import {
  getStudentsAction,
  getInstitucionesAction,
  getUserStatusesAction,
  getNivelesAcademicosAction,
  getStudentDashboardStatsAction,
} from "@/actions/students";
import { getInstitucionAction } from "@/actions/institucion";
import { columns } from "@/components/gestion/estudiantes/components/columns";
import { StudentTable } from "@/components/gestion/estudiantes/management/student-table";
import { AddStudentButton } from "@/components/gestion/estudiantes/components/add-student-button";
import StudentStats from "@/components/gestion/estudiantes/components/stats";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";

import { PageHeader } from "@/components/common/page-header";

export const metadata = {
  title: "Padrón de Estudiantes | Sistema Escolar Pro",
  description: "Administración de alumnos, expedientes académicos y padrón escolar.",
};

export default async function EstudiantesPage() {
  const [
    { data: estudiantes = [], totalCount = 0 },
    { data: instituciones = [] },
    { data: estados = [] },
    { data: nivelesAcademicos = [] },
    { data: institucion },
    { data: stats },
  ] = await Promise.all([
    getStudentsAction({ page: 1, pageSize: 25 }),
    getInstitucionesAction(),
    getUserStatusesAction(),
    getNivelesAcademicosAction(),
    getInstitucionAction(),
    getStudentDashboardStatsAction(),
  ]);

  const periodoAcademico = institucion?.cicloEscolarActual || new Date().getFullYear();
  const session = await auth();
  const isAdmin = session?.user?.role === "administrativo" || session?.user?.role === "super_admin";

  const defaultStats = stats || {
    totalStudents: 0,
    activeEnrollments: 0,
    newEnrollments: 0,
    currentYear: periodoAcademico,
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 pt-0">
      {/* ── HEADER COMPACTO INSTITUCIONAL ── */}
      <PageHeader
        icon={<IconUsers size={20} />}
        title="Padrón de Estudiantes"
        badge="Expedientes"
        description={`Administración de alumnos matriculados y seguimiento académico · Periodo ${periodoAcademico}`}
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Personas", href: "/gestion/estudiantes" },
          { label: "Estudiantes" },
        ]}
        actions={
          <AddStudentButton
            instituciones={instituciones as any}
            estados={estados as any}
            periodoAcademico={periodoAcademico}
          />
        }
      />

      {/* ── TABLA / DIRECTORIO DE ESTUDIANTES CON KPIS INTERACTIVOS ── */}
      <div className="px-1">
        <StudentTable
          columns={columns}
          data={estudiantes as any}
          totalCount={totalCount}
          meta={{ instituciones, estados, nivelesAcademicos, institucion }}
          stats={defaultStats}
          showPadronExport={isAdmin}
        />
      </div>
    </div>
  );
}
