import { getPermissionsMatrixAction } from "@/actions/permissions/permissions-actions";
import { PermisosClient } from "@/components/configuracion/permisos/permisos-client";
import { PageHeader } from "@/components/common/page-header";
import { IconShieldLock, IconAlertTriangle } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const metadata = {
  title: "Roles & Permisos Institucionales | Sistema Escolar Pro",
  description:
    "Matriz de control de acceso (RBAC) y privilegios por cargo escolar.",
};

export default async function PermisosPage() {
  const result = await getPermissionsMatrixAction({});

  if (result.error || !result.success) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <Alert className="max-w-md border-destructive/30 bg-destructive/5 rounded-3xl p-6">
          <IconAlertTriangle className="size-5 text-destructive" />
          <AlertTitle className="text-destructive font-bold text-sm">
            Error al cargar la matriz de permisos
          </AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            {result.error || "No se pudo obtener la configuración de cargos."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { cargos, permisos } = result.success;

  return (
    <div className="flex flex-1 flex-col gap-5 p-4 sm:p-6 pt-0 w-full max-w-full overflow-x-hidden min-w-0">
      <PageHeader
        icon={<IconShieldLock size={20} />}
        title="Roles & Permisos Institucionales"
        badge="Seguridad & RBAC"
        description="Configuración de niveles de acceso, facultades operativas y restricciones por cargo escolar."
        breadcrumbs={[
          { label: "Inicio", href: "/dashboard" },
          { label: "Configuración", href: "/configuracion/institucion" },
          { label: "Roles & Permisos" },
        ]}
      />

      <div className="w-full min-w-0">
        <PermisosClient cargos={cargos} permisos={permisos} />
      </div>
    </div>
  );
}
