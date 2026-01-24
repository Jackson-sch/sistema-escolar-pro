import { IconBook } from "@tabler/icons-react";
import {
  getCurricularAreasAction,
  getInstitucionesAction,
} from "@/actions/academic";
import { columns } from "@/components/gestion/academico/areas/components/area-table-columns";
import { AreaTable } from "@/components/gestion/academico/areas/area-table";
import { AddAreaButton } from "@/components/gestion/academico/areas/add-area-button";

export default async function AreasPage() {
  const [{ data: areas = [] }, { data: instituciones = [] }] =
    await Promise.all([getCurricularAreasAction(), getInstitucionesAction()]);

  // Obtener la primera institución disponible (usualmente solo hay una)
  const mainInstitucionId = instituciones[0]?.id || "";

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define las áreas curriculares para cada institución...
        </p>
        <AddAreaButton institucionId={mainInstitucionId} />
      </div>

      <AreaTable
        columns={columns}
        data={areas as any}
        meta={{ institucionId: mainInstitucionId }}
      />
    </div>
  );
}
