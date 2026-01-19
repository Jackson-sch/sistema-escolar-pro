import { IconUserPlus } from "@tabler/icons-react";
import { getProspectosAction } from "@/actions/admissions";
import { getGradosAction } from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { ProspectoTable } from "@/components/gestion/admisiones/prospecto-table";
import { AddProspectoButton } from "@/components/gestion/admisiones/add-prospecto-button";

import { Suspense } from "react";

export default async function AdmisionesPage() {
  const [
    { data: prospectos = [] },
    { data: grados = [] },
    { data: instituciones = [] },
  ] = await Promise.all([
    getProspectosAction(),
    getGradosAction(),
    getInstitucionesAction(),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0 @container/main">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-primary">
            Admisiones (CRM)
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium">
            Gestiona los nuevos interesados y el proceso de evaluación de
            vacantes.
          </p>
        </div>
        <AddProspectoButton
          grados={grados as any}
          instituciones={instituciones as any}
        />
      </div>

      <Suspense
        fallback={
          <div className="h-[400px] w-full animate-pulse bg-muted/10 rounded-xl" />
        }
      >
        <ProspectoTable
          data={prospectos as any}
          grados={grados as any}
          instituciones={instituciones as any}
        />
      </Suspense>
    </div>
  );
}
