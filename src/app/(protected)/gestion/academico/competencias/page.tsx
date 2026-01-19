import {
  getCurricularAreasAction,
  getCompetenciesByAreaAction,
} from "@/actions/competencies";
import { CompetencyTable } from "@/components/gestion/academico/competency-table";
import { AddCompetencyButton } from "@/components/gestion/academico/add-competency-button";

export default async function CompetenciesPage() {
  const { data: areas = [] } = await getCurricularAreasAction();

  // Fetch competencies for all areas to show in a unified table (standard design)
  const allCompetenciesPromises = areas.map((area) =>
    getCompetenciesByAreaAction(area.id)
  );
  const results = await Promise.all(allCompetenciesPromises);

  const allCompetencies = results.flatMap((res, index) =>
    (res.data || []).map((comp) => ({
      ...comp,
      areaCurricularId: areas[index].id,
      areaCurricular: {
        nombre: areas[index].nombre,
        color: areas[index].color,
      },
    }))
  );

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
        data={allCompetencies as any}
        areas={areas.map((a) => ({ id: a.id, nombre: a.nombre }))}
      />
    </div>
  );
}
