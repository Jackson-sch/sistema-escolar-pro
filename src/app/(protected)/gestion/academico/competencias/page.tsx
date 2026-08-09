import {
  getCurricularAreasAction,
  getCompetenciesByNivelAction,
} from "@/actions/competencies";
import { getNivelesAction } from "@/actions/academic-structure";
import { CompetencyTable } from "@/components/gestion/academico/competencias/competency-table";
import { AddCompetencyButton } from "@/components/gestion/academico/competencias/add-competency-button";

interface CompetenciesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompetenciesPage({ searchParams }: CompetenciesPageProps) {
  const [params, nivelesRes] = await Promise.all([
    searchParams,
    getNivelesAction(),
  ]);
  const niveles = nivelesRes.data || [];

  const activeNivelId = typeof params.nivelId === "string"
    ? params.nivelId
    : (niveles.length > 0 ? niveles[0].id : undefined);

  let allCompetencies: any[] = [];
  let areas: any[] = [];

  const [{ data: fetchedAreas = [] }, { data: fetchedCompetencies = [] }] = await Promise.all([
    getCurricularAreasAction(activeNivelId),
    getCompetenciesByNivelAction(activeNivelId),
  ]);
  areas = fetchedAreas;
  allCompetencies = fetchedCompetencies;

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Estandariza los criterios de evaluación mediante competencias y
          capacidades institucionales...
        </p>
        <AddCompetencyButton />
      </div>

      <CompetencyTable
        data={allCompetencies}
        areas={areas.map((a) => ({ id: a.id, nombre: a.nombre }))}
        niveles={niveles}
      />
    </div>
  );
}
