import {
  getCurricularAreasAction,
  getInstitucionesAction,
} from "@/actions/academic";
import { getNivelesAction } from "@/actions/academic-structure";
import { getCompetenciesByNivelAction } from "@/actions/competencies";
import { MallaDashboard } from "@/components/gestion/academico/areas/malla-dashboard";

export default async function AreasPage({
  searchParams,
}: {
  searchParams: Promise<{ nivel?: string; [key: string]: string | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const [
    { data: instituciones = [] },
    { data: niveles = [] }
  ] = await Promise.all([
    getInstitucionesAction(),
    getNivelesAction()
  ]);

  // Obtener la primera institución disponible
  const mainInstitucionId = instituciones[0]?.id || "";
  
  // Determinar qué nivel cargar por defecto
  const activeNivelId = resolvedSearchParams.nivel || (niveles.length > 0 ? niveles[0].id : undefined);

  // Cargar áreas y competencias sólo si hay un nivel seleccionado
  let areas: any[] = [];
  let competencies: any[] = [];
  
  if (activeNivelId) {
    const [areasResult, competenciesResult] = await Promise.all([
      getCurricularAreasAction(activeNivelId),
      getCompetenciesByNivelAction(activeNivelId)
    ]);
    areas = areasResult.data || [];
    competencies = competenciesResult.data || [];
  }

  return (
    <div className="w-full h-full max-h-screen">
      <MallaDashboard 
        niveles={niveles}
        areas={areas}
        competencies={competencies}
        institucionId={mainInstitucionId}
      />
    </div>
  );
}
