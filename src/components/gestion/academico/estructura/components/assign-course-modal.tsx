"use client";

import { useState, useEffect } from "react";
import { FormModal } from "@/components/modals/form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurricularAreasAction, upsertCourseAction } from "@/actions/academic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { IconLoader2, IconPlus } from "@tabler/icons-react";

interface AssignCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seccion: any;
  nivelId?: string;
  tutores: any[];
  allSeccionesInGrade?: any[];
}

export function AssignCourseModal({
  open,
  onOpenChange,
  seccion,
  nivelId,
  tutores,
  allSeccionesInGrade = [],
}: AssignCourseModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<any[]>([]);
  const [aplicarATodas, setAplicarATodas] = useState(true);

  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [areaCurricularId, setAreaCurricularId] = useState("");
  const [profesorId, setProfesorId] = useState("");
  const [horasSemanales, setHorasSemanales] = useState("3");

  // Valor efectivo del docente: si no hay elección explícita, se usa el tutor
  // de la sección como valor por defecto (derivado durante el render, sin
  // ajustar estado cuando cambian las props).
  const effectiveProfesorId =
    profesorId || (open ? seccion?.tutorId ?? "" : "");

  useEffect(() => {
    if (open) {
      const targetNivelId = nivelId || seccion?.grado?.nivelId || seccion?.nivelId;
      getCurricularAreasAction(targetNivelId)
        .then((res) => {
          if (res.data) setAreas(res.data);
        })
        .catch((err) => console.error("Error loading areas:", err));
    }
  }, [open, nivelId, seccion]);

  const handleAreaChange = (areaId: string) => {
    setAreaCurricularId(areaId);
    const selectedArea = areas.find((a) => a.id === areaId);
    if (selectedArea && seccion) {
      const suggestedName = selectedArea.nombre;
      setNombre(suggestedName);
      const cleanCode = `${selectedArea.codigo || "CUR"}-${seccion.seccion || "1A"}`;
      setCodigo(cleanCode.toUpperCase());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaCurricularId || !nombre || !seccion?.id) {
      toast.error("Por favor completa los campos requeridos.");
      return;
    }

    const targetSectionIds =
      aplicarATodas && allSeccionesInGrade.length > 0
        ? allSeccionesInGrade.map((s) => s.id)
        : [seccion.id];

    setLoading(true);
    try {
      const isTutorDefault = !profesorId || profesorId === seccion?.tutorId;

      const res = await upsertCourseAction({
        nombre,
        codigo: codigo || `CUR-${Date.now().toString().slice(-4)}`,
        areaCurricularId,
        nivelAcademicoIds: targetSectionIds,
        anioAcademico: seccion.anioAcademico || new Date().getFullYear(),
        horasSemanales: parseInt(horasSemanales) || 3,
        profesorId: effectiveProfesorId || null,
        originTutorId: seccion?.tutorId || null,
        isTutorDefault,
      });

      if (res.success) {
        toast.success(
          targetSectionIds.length > 1
            ? `Curso asignado exitosamente a las ${targetSectionIds.length} secciones del grado`
            : "Curso asignado a la sección correctamente",
        );
        setNombre("");
        setCodigo("");
        setAreaCurricularId("");
        setProfesorId("");
        onOpenChange(false);
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al asignar curso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      title={`Asignar Curso a Sección "${seccion?.seccion || ""}"`}
      description="Agrega un curso de la malla curricular a este salón y asigna su docente."
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {/* Aplicar a todas las secciones del grado */}
        {allSeccionesInGrade.length > 1 && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-primary/20 bg-primary/5">
            <input
              type="checkbox"
              id="aplicarATodas"
              checked={aplicarATodas}
              onChange={(e) => setAplicarATodas(e.target.checked)}
              className="size-4 rounded text-primary accent-primary cursor-pointer"
            />
            <label
              htmlFor="aplicarATodas"
              className="text-xs font-semibold text-foreground cursor-pointer select-none"
            >
              Asignar también a todas las {allSeccionesInGrade.length} secciones de este grado
            </label>
          </div>
        )}
        {/* Área Curricular */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Área Curricular *</Label>
          <Select value={areaCurricularId} onValueChange={handleAreaChange}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Selecciona un área curricular..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {areas.map((area) => (
                <SelectItem key={area.id} value={area.id} className="text-xs">
                  {area.nombre} ({area.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nombre del Curso */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Nombre del Curso *</Label>
          <Input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Matemática, Álgebra, Comunicación..."
            className="h-9 text-xs rounded-xl"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Código */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Código del Curso</Label>
            <Input
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="MAT-1A"
              className="h-9 text-xs rounded-xl"
            />
          </div>

          {/* Horas Semanales */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Horas Semanales</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={horasSemanales}
              onChange={(e) => setHorasSemanales(e.target.value)}
              className="h-9 text-xs rounded-xl"
            />
          </div>
        </div>

        {/* Docente Asignado */}
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Docente Responsable (Opcional)</Label>
          <Select value={effectiveProfesorId} onValueChange={setProfesorId}>
            <SelectTrigger className="h-9 text-xs rounded-xl">
              <SelectValue placeholder="Seleccionar profesor..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-48">
              <SelectItem value="NONE" className="text-xs italic text-muted-foreground">
                Sin Docente (Asignar después)
              </SelectItem>
              {tutores.map((t) => (
                <SelectItem key={t.id} value={t.id} className="text-xs">
                  {t.name} {t.apellidoPaterno || ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="rounded-xl text-xs font-bold gap-1.5 px-4"
          >
            {loading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconPlus className="size-4" />
            )}
            Asignar Curso
          </Button>
        </div>
      </form>
    </FormModal>
  );
}
