import { Suspense } from "react";
import { getUserStatesAction } from "@/actions/user-states";
import { EstadoUsuarioTable } from "@/components/configuracion/usuarios/estados/estado-usuario-table";
import { AddEstadoUsuarioButton } from "@/components/configuracion/usuarios/estados/add-estado-usuario-button";

export default async function EstadosUsuarioPage() {
  const { data: estados = [] } = await getUserStatesAction();

  return (
    <div className="flex flex-1 flex-col gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
            Estados de Usuario
          </h1>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Gestiona los estados operativos, permisos de acceso y colores de
            identificación para usuarios.
          </p>
        </div>
        <AddEstadoUsuarioButton />
      </div>

      <div className="px-4 sm:px-2">
        <Suspense
          fallback={
            <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-xl" />
          }
        >
          <EstadoUsuarioTable data={estados} />
        </Suspense>
      </div>
    </div>
  );
}
