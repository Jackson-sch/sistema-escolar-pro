import {
  getGradosAction,
  getNivelesAction,
} from "@/actions/academic-structure";
import { GradoTable } from "@/components/gestion/academico/estructura/grados/grado-table";
import { AddGradoButton } from "@/components/gestion/academico/estructura/grados/add-grado-button";

export default async function GradosPage() {
  const [{ data: grados = [] }, { data: niveles = [] }] = await Promise.all([
    getGradosAction(),
    getNivelesAction(),
  ]);

  return (
    <div className="space-y-4 px-2">
      <div className="flex justify-between items-center px-2">
        <p className="text-xs sm:text-sm text-muted-foreground">
          Define los años escolares dentro de cada nivel.
        </p>
        <AddGradoButton niveles={niveles} />
      </div>
      <GradoTable data={grados} meta={{ niveles }} />
    </div>
  );
}
