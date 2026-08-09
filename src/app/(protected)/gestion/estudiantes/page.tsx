import { IconCloudDownload, IconUsers } from "@tabler/icons-react";
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
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const metadata = {
  title: "Gestión de Estudiantes | Sistema Escolar Pro",
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
    <div className="min-h-screen flex flex-col gap-6 p-4 md:p-8 pt-6 @container/main">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1 rounded-full text-xxs font-semibold uppercase tracking-widest flex items-center gap-2 w-fit">
            <IconUsers size={14} />
            Padrón Estudiantil
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-none">
            Gestión de Estudiantes
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-normal leading-relaxed">
            Administración integral del expediente personal, historial de matrículas y estado de los alumnos.
          </p>
        </div>

        <div className="flex flex-row gap-3 items-center shrink-0">
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="rounded-xl h-10 px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer">
                  <IconCloudDownload className="size-4 text-muted-foreground" />
                  <span className="hidden sm:inline">Descargar Padrón</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="text-micro font-medium"
              >
                Exportar base de datos de alumnos en Excel/CSV
              </TooltipContent>
            </Tooltip>
          )}

          <AddStudentButton
            instituciones={instituciones as any}
            estados={estados as any}
            periodoAcademico={periodoAcademico}
          />
        </div>
      </div>

      {/* ── BENTO KPIS ── */}
      <div className="px-1">
        <StudentStats stats={defaultStats} />
      </div>

      {/* ── TABLA DE ESTUDIANTES ── */}
      <div className="px-1">
        <StudentTable
          columns={columns}
          data={estudiantes as any}
          totalCount={totalCount}
          meta={{ instituciones, estados, nivelesAcademicos, institucion }}
        />
      </div>
    </div>
  );
}
