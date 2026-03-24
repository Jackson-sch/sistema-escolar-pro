import {
  getSeccionesAction,
  getGradosAction,
  getTutoresAction,
} from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { getSedesAction } from "@/actions/sedes";
import { SeccionViewSwitcher } from "@/components/gestion/academico/estructura/secciones/seccion-view-switcher";
import { AddSeccionButton } from "@/components/gestion/academico/estructura/secciones/add-seccion-button";
import { CloneStructureButton } from "@/components/gestion/academico/estructura/secciones/clone-structure-button";

export default async function SeccionesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { data: instituciones = [] } = await getInstitucionesAction();
  const institucionId = instituciones[0]?.id || "";
  const currentAnio = instituciones[0]?.cicloEscolarActual || 2026;
  const anioParam = resolvedSearchParams.anio ? parseInt(resolvedSearchParams.anio as string) : currentAnio;

  const [
    { data: secciones = [] },
    { data: grados = [] },
    { data: tutores = [] },
    { data: sedes = [] },
  ] = await Promise.all([
    getSeccionesAction({ anioAcademico: anioParam }),
    getGradosAction(),
    getTutoresAction(),
    getSedesAction(),
  ]);

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define las secciones (A, B, C...) para cada grado y año académico.
        </p>
        <div className="flex gap-2 items-center">
          <CloneStructureButton currentAnio={currentAnio} institucionId={institucionId} />
          <AddSeccionButton
            grados={grados}
            tutores={tutores}
            sedes={sedes}
            institucionId={institucionId}
            currentAnio={currentAnio}
          />
        </div>
      </div>
      <SeccionViewSwitcher
        data={secciones}
        meta={{ grados, tutores, sedes, institucionId }}
        currentAnio={currentAnio}
        selectedAnio={anioParam}
      />
    </div>
  );
}
