import { IconCloudDownload } from "@tabler/icons-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Gestión de Estudiantes
          </h1>
          <p className="text-xxs sm:text-sm text-muted-foreground font-medium">
            Administración integral de la información personal y académica de
            los alumnos.
          </p>
        </div>
        <div className="flex flex-row gap-3 items-center">
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <IconCloudDownload className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="hidden sm:inline font-semibold">
                      Descargar Padrón
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="text-micro font-medium"
                >
                  Exportar base de datos de alumnos
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <AddStudentButton
            instituciones={instituciones as any}
            estados={estados as any}
            periodoAcademico={periodoAcademico}
          />
        </div>
      </div>

      <div className="px-4 sm:px-2 space-y-6">
        {/* BANNER DE ESTADO RÁPIDO - DASHBOARD STYLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StudentStats stats={defaultStats} />
        </div>

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
