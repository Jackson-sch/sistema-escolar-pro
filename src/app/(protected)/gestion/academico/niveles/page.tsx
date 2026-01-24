import { getNivelesAction } from "@/actions/academic-structure";
import { getInstitucionesAction } from "@/actions/academic";
import { NivelTable } from "@/components/gestion/academico/estructura/niveles/nivel-table";
import { AddNivelButton } from "@/components/gestion/academico/estructura/niveles/add-nivel-button";

export default async function NivelesPage() {
  const [{ data: niveles = [] }, { data: instituciones = [] }] =
    await Promise.all([getNivelesAction(), getInstitucionesAction()]);

  const institucionId = instituciones[0]?.id || "";

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define las etapas educativas: Inicial, Primaria, Secundaria...
        </p>
        <AddNivelButton institucionId={institucionId} />
      </div>
      <NivelTable data={niveles} meta={{ institucionId }} />
    </div>
  );
}
