import { IconCloudDownload } from "@tabler/icons-react";
import {
  getStudentsAction,
  getInstitucionesAction,
  getUserStatusesAction,
  getNivelesAcademicosAction,
} from "@/actions/students";
import { getInstitucionAction } from "@/actions/institucion";
import { columns } from "@/components/gestion/estudiantes/components/columns";
import { StudentTable } from "@/components/gestion/estudiantes/management/student-table";
import { AddStudentButton } from "@/components/gestion/estudiantes/components/add-student-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Suspense } from "react";

export default async function EstudiantesPage() {
  // Fetch de todos los datos necesarios en paralelo para optimizar carga
  const [
    { data: students = [] },
    { data: instituciones = [] },
    { data: estados = [] },
    { data: nivelesAcademicos = [] },
    { data: institucion },
  ] = await Promise.all([
    getStudentsAction(),
    getInstitucionesAction(),
    getUserStatusesAction(),
    getNivelesAcademicosAction(),
    getInstitucionAction(),
  ]);

  const periodoAcademico = institucion?.cicloEscolarActual;

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            Gestión de Estudiantes
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Administración integral de la información personal y académica de
            los alumnos.
          </p>
        </div>
        <div className="flex flex-row gap-3 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <IconCloudDownload className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="hidden sm:inline font-semibold">
                    Descargar Padrón
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px] font-medium">
                Exportar base de datos de alumnos
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AddStudentButton
            instituciones={instituciones as any}
            estados={estados as any}
            periodoAcademico={periodoAcademico}
          />
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px] text-sm text-muted-foreground font-medium animate-pulse">
            Cargando base de datos de estudiantes...
          </div>
        }
      >
        <div className="px-4 sm:px-2">
          <StudentTable
            columns={columns}
            data={students as any}
            meta={{ instituciones, estados, nivelesAcademicos, institucion }}
          />
        </div>
      </Suspense>
    </div>
  );
}
