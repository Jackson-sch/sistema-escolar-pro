import {
  getSeccionesAction,
  getGradosAction,
  getTutoresAction,
} from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { getSedesAction } from "@/actions/sedes";
import { SeccionTable } from "@/components/gestion/academico/estructura/secciones/seccion-table";
import { AddSeccionButton } from "@/components/gestion/academico/estructura/secciones/add-seccion-button";

export default async function SeccionesPage() {
  const { data: instituciones = [] } = await getInstitucionesAction();
  const institucionId = instituciones[0]?.id || "";
  const currentAnio = instituciones[0]?.cicloEscolarActual || 2026;

  const [
    { data: secciones = [] },
    { data: grados = [] },
    { data: tutores = [] },
    { data: sedes = [] },
  ] = await Promise.all([
    getSeccionesAction({ anioAcademico: currentAnio }),
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
        <AddSeccionButton
          grados={grados}
          tutores={tutores}
          sedes={sedes}
          institucionId={institucionId}
        />
      </div>
      <SeccionTable
        data={secciones}
        meta={{ grados, tutores, sedes, institucionId }}
      />
    </div>
  );
}
