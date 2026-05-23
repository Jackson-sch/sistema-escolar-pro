import { getProspectosAction } from "@/actions/admissions";
import { getGradosAction } from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { ProspectoTable } from "@/components/gestion/admisiones/management/prospecto-table";
import { AddProspectoButton } from "@/components/gestion/admisiones/components/add-prospecto-button";

import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function AdmisionesPage() {
  const [
    prospectosRes,
    gradosRes,
    institucionesRes,
  ] = await Promise.all([
    getProspectosAction({}),
    getGradosAction(),
    getInstitucionesAction(),
  ]);

  const prospectos = prospectosRes.success || [];
  const grados = (gradosRes as any).success || (gradosRes as any).data || [];
  const instituciones = (institucionesRes as any).success || (institucionesRes as any).data || [];

  return (
    <div className="flex flex-1 flex-col gap-8 p-0 sm:p-6 pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            Admisiones (CRM)
          </h1>
          <p className="text-xxs sm:text-sm text-muted-foreground font-medium">
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
