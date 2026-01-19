import { getInstitucionAction } from "@/actions/institucion";
import { getVariablesAction } from "@/actions/variables";
import { InstitucionForm } from "@/components/configuracion/institucion-form";
import { VariablesPanel } from "@/components/configuracion/variables-panel";
import { ConfiguracionTabs } from "@/components/configuracion/configuracion-tabs";
import { IconSettings } from "@tabler/icons-react";

export default async function ConfiguracionPage() {
  const [institucionRes, variablesRes] = await Promise.all([
    getInstitucionAction(),
    getVariablesAction(),
  ]);

  if (institucionRes.error || variablesRes.error) {
    return (
      <div className="p-8 text-center text-red-500 font-bold border-2 border-dashed border-red-200 rounded-2xl bg-red-50">
        {institucionRes.error || variablesRes.error}
      </div>
    );
  }

  const institucion = institucionRes.data;
  const variables = variablesRes.data || [];

  return (
    <div className="flex flex-1 flex-col gap-4 sm:gap-6 p-0 sm:p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            Configuración del Sistema
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">
            Gestión de identidad institucional y variables dinámicas de la
            plataforma.
          </p>
        </div>
        <div className="bg-primary/10 p-2 rounded-full hidden sm:block">
          <IconSettings className="size-6 text-primary" />
        </div>
      </div>

      <div className="px-2">
        <ConfiguracionTabs>
          {{
            datos: <InstitucionForm initialData={institucion} />,
            variables: <VariablesPanel initialData={variables} />,
          }}
        </ConfiguracionTabs>
      </div>
    </div>
  );
}
