import {
  getCurricularAreasAction,
  getCompetenciesByNivelAction,
} from "@/actions/competencies";
import { getNivelesAction } from "@/actions/academic-structure";
import { CompetencyTable } from "@/components/gestion/academico/competencias/competency-table";
import { CompetencyHeaderBar } from "@/components/gestion/academico/competencias/components/competency-header-bar";
import { CompetencyStatsBento } from "@/components/gestion/academico/competencias/components/competency-stats-bento";

interface CompetenciesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompetenciesPage({ searchParams }: CompetenciesPageProps) {
  const [params, nivelesRes] = await Promise.all([
    searchParams,
    getNivelesAction(),
  ]);
  const niveles = nivelesRes.data || [];

  const activeNivelId =
    typeof params.nivelId === "string"
      ? params.nivelId
      : niveles.length > 0
      ? niveles[0].id
      : undefined;

  const activeNivel = niveles.find((n) => n.id === activeNivelId);

  const [{ data: fetchedAreas = [] }, { data: fetchedCompetencies = [] }] =
    await Promise.all([
      getCurricularAreasAction(activeNivelId),
      getCompetenciesByNivelAction(activeNivelId),
    ]);

  const areas = fetchedAreas;
  const allCompetencies = fetchedCompetencies;

  // Calculo de métricas institucionales para el Bento KPI
  const totalCompetencias = allCompetencies.length;
  const totalCapacidades = allCompetencies.reduce(
    (acc: number, comp: any) => acc + (comp.capacidades?.length || 0),
    0
  );
  const totalAreas = areas.length;

  return (
    <div className="space-y-4 px-2">
      <CompetencyHeaderBar
        niveles={niveles}
        activeNivelId={activeNivelId}
        totalCompetencias={totalCompetencias}
      />

      <CompetencyStatsBento
        totalCompetencias={totalCompetencias}
        totalCapacidades={totalCapacidades}
        totalAreas={totalAreas}
        activeNivelName={activeNivel?.nombre}
      />

      <CompetencyTable
        data={allCompetencies}
        areas={areas.map((a: any) => ({ id: a.id, nombre: a.nombre }))}
        niveles={niveles}
      />
    </div>
  );
}
