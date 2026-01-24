import {
  IconUsers,
  IconCloudDownload,
  IconBriefcase,
} from "@tabler/icons-react";
import {
  getStaffAction,
  getInstitucionesAction,
  getUserStatusessAction,
  getCargosAction,
} from "@/actions/staff";
import { columns } from "@/components/gestion/personal/components/columns";
import { StaffTable } from "@/components/gestion/personal/management/staff-table";
import { AddStaffButton } from "@/components/gestion/personal/components/add-staff-button";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Suspense } from "react";

export default async function PersonalPage() {
  // Fetch de todos los datos necesarios en paralelo para optimizar carga
  const [
    { data: staff = [] },
    { data: instituciones = [] },
    { data: estados = [] },
    { data: cargos = [] },
  ] = await Promise.all([
    getStaffAction(),
    getInstitucionesAction(),
    getUserStatusessAction(),
    getCargosAction(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Gestión de Personal
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Administración de perfiles, cargos y nómina docente y
            administrativa.
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
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Exportar Personal</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AddStaffButton
            instituciones={instituciones as any}
            estados={estados as any}
            cargos={cargos as any}
          />
        </div>
      </div>

      <div className="px-4 sm:px-2">
        <Suspense
          fallback={
            <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-xl" />
          }
        >
          <StaffTable
            columns={columns}
            data={staff as any}
            meta={{ instituciones, estados, cargos }}
          />
        </Suspense>
      </div>
    </div>
  );
}
