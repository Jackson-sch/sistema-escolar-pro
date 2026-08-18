"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FormModal } from "@/components/modals/form-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherSelector } from "@/components/common/teacher-selector";
import { getCurricularAreasAction } from "@/actions/academic";
import { createFullSectionWizardAction } from "@/actions/academic-structure";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconChevronRight,
  IconChevronLeft,
  IconLoader2,
} from "@tabler/icons-react";

interface CreateSectionWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grados: any[];
  niveles: any[];
  tutores: any[];
  institucionId: string;
  currentAnio: number;
  initialGradeId?: string;
  selectedNivelId?: string;
}

interface WizardCourse {
  areaCurricularId: string;
  nombre: string;
  codigo: string;
  horasSemanales: number;
  profesorId: string | null;
  selected: boolean;
}

// ─── Subcomponentes presentacionales ─────────────────────────────────────────

const WIZARD_STEPS = [
  { n: 1, label: "Datos del Aula" },
  { n: 2, label: "Malla y Cursos" },
  { n: 3, label: "Docentes & Final" },
] as const;

function WizardStepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-6">
      {WIZARD_STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center gap-2">
          {i > 0 && (
            <IconChevronRight size={16} className="text-muted-foreground/40 mr-2" />
          )}
          <div
            className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
              step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {s.n}
          </div>
          <span
            className={`text-xs font-bold ${step === s.n ? "text-primary" : "text-muted-foreground"}`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface StepDatosAulaProps {
  grados: any[];
  niveles: any[];
  selectedNivelId?: string;
  gradoId: string;
  onGradoChange: (id: string) => void;
  seccionNombre: string;
  onSeccionNombreChange: (v: string) => void;
  turno: string;
  onTurnoChange: (v: string) => void;
  capacidad: string;
  onCapacidadChange: (v: string) => void;
  aulaAsignada: string;
  onAulaAsignadaChange: (v: string) => void;
  tutores: any[];
  tutorId: string | null;
  onTutorChange: (id: string | null) => void;
  selectedTutor: any;
  onNext: () => void;
}

function StepDatosAula({
  grados,
  niveles,
  selectedNivelId,
  gradoId,
  onGradoChange,
  seccionNombre,
  onSeccionNombreChange,
  turno,
  onTurnoChange,
  capacidad,
  onCapacidadChange,
  aulaAsignada,
  onAulaAsignadaChange,
  tutores,
  tutorId,
  onTutorChange,
  selectedTutor,
  onNext,
}: StepDatosAulaProps) {
  const filteredGrados = useMemo(() => {
    if (!selectedNivelId) return grados;
    const match = grados.filter((g) => g.nivelId === selectedNivelId);
    return match.length > 0 ? match : grados;
  }, [grados, selectedNivelId]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Grado Académico *</Label>
          <Select value={gradoId} onValueChange={onGradoChange}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl">
              <SelectValue placeholder="Selecciona grado..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-48 z-[80]">
              {filteredGrados.map((g) => {
                const nivelObj = niveles.find((n) => n.id === g.nivelId);
                const showPrefix = !selectedNivelId || filteredGrados.length === grados.length;
                const label = showPrefix && nivelObj?.nombre ? `${nivelObj.nombre} - ${g.nombre}` : g.nombre;
                return (
                  <SelectItem key={g.id} value={g.id} className="text-xs font-medium">
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Letra / Sección *</Label>
          <Input
            value={seccionNombre}
            onChange={(e) => onSeccionNombreChange(e.target.value)}
            placeholder="Ej: A, B, Única..."
            className="h-9 text-xs rounded-xl uppercase font-bold"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Turno</Label>
          <Select value={turno} onValueChange={onTurnoChange}>
            <SelectTrigger className="w-full h-9 text-xs rounded-xl">
              <SelectValue placeholder="Turno" />
            </SelectTrigger>
            <SelectContent className="rounded-xl z-[80]">
              <SelectItem value="MANANA" className="text-xs">Mañana</SelectItem>
              <SelectItem value="TARDE" className="text-xs">Tarde</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Capacidad Alumnos</Label>
          <Input
            type="number"
            value={capacidad}
            onChange={(e) => onCapacidadChange(e.target.value)}
            className="h-9 text-xs rounded-xl"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-bold">Aula Física</Label>
          <Input
            value={aulaAsignada}
            onChange={(e) => onAulaAsignadaChange(e.target.value)}
            placeholder="Aula 101"
            className="h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-1.5 pt-2">
        <Label className="text-xs font-bold flex items-center justify-between">
          <span>Tutor Responsable del Salón (Opcional)</span>
          {selectedTutor && (
            <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
              {selectedTutor.name} {selectedTutor.apellidoPaterno || ""}
            </Badge>
          )}
        </Label>
        <div className="p-3 rounded-2xl border border-border/40 bg-muted/20">
          <TeacherSelector
            teachers={tutores}
            onSelect={(id) => onTutorChange(id)}
            selectedTeacherId={tutorId}
            currentTeacher={selectedTutor}
            searchPlaceholder="Buscar tutor por nombre o apellido..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={onNext}
          disabled={!gradoId || !seccionNombre}
          className="rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-primary/10"
        >
          Siguiente: Malla y Cursos
          <IconChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

interface StepMallaCursosProps {
  selectedGrado: any;
  seccionNombre: string;
  selectedNivel: any;
  selectedCourses: WizardCourse[];
  loadingAreas: boolean;
  onToggleCourse: (index: number) => void;
  onUpdateHours: (index: number, hours: number) => void;
  onBack: () => void;
  onNext: () => void;
}

function StepMallaCursos({
  selectedGrado,
  seccionNombre,
  selectedNivel,
  selectedCourses,
  loadingAreas,
  onToggleCourse,
  onUpdateHours,
  onBack,
  onNext,
}: StepMallaCursosProps) {
  const selectedCount = selectedCourses.filter((c) => c.selected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-primary/5 p-3 rounded-2xl border border-primary/20">
        <div>
          <p className="text-xs font-bold text-foreground">
            Cursos de la Malla — {selectedGrado?.nombre} Sección &quot;{seccionNombre}&quot;
          </p>
          <p className="text-[11px] text-muted-foreground">
            {selectedCount} de {selectedCourses.length} cursos seleccionados
          </p>
        </div>
        <Badge className="bg-primary/20 text-primary border-none text-xs font-bold">
          {selectedNivel?.nombre || "Nivel"}
        </Badge>
      </div>

      {loadingAreas ? (
        <div className="py-12 text-center">
          <IconLoader2 className="size-6 mx-auto animate-spin text-primary mb-2" />
          <p className="text-xs text-muted-foreground">Cargando malla curricular del nivel...</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {selectedCourses.map((curso, idx) => (
            <div
              key={curso.codigo ?? curso.nombre}
              className={`flex items-center justify-between p-3 rounded-xl border transition-[background-color,border-color,box-shadow,opacity] ${
                curso.selected
                  ? "border-primary/30 bg-card shadow-sm"
                  : "border-border/30 bg-muted/20 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Checkbox
                  checked={curso.selected}
                  onCheckedChange={() => onToggleCourse(idx)}
                  className="size-4"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate text-foreground">
                    {curso.nombre}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Código: {curso.codigo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Label className="text-[10px] text-muted-foreground">Hrs/sem:</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={curso.horasSemanales}
                  onChange={(e) => onUpdateHours(idx, parseInt(e.target.value) || 2)}
                  disabled={!curso.selected}
                  className="h-7 w-16 text-xs text-center rounded-lg"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl text-xs gap-1.5"
        >
          <IconChevronLeft size={14} />
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={selectedCount === 0}
          className="rounded-xl text-xs font-bold gap-1.5 px-5 shadow-md shadow-primary/10"
        >
          Siguiente: Asignar Profesores
          <IconChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}

interface StepProfesoresProps {
  selectedCourses: WizardCourse[];
  seccionNombre: string;
  tutores: any[];
  onUpdateTeacher: (index: number, profId: string | null) => void;
  onBack: () => void;
  onFinish: () => void;
  loading: boolean;
}

function StepProfesores({
  selectedCourses,
  seccionNombre,
  tutores,
  onUpdateTeacher,
  onBack,
  onFinish,
  loading,
}: StepProfesoresProps) {
  const activeCourses = selectedCourses.filter((c) => c.selected);

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
        ✨ Salón listo para crearse: Se configurarán <strong>{activeCourses.length} cursos</strong> para la Sección <strong>&quot;{seccionNombre}&quot;</strong>.
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {activeCourses.map((curso) => {
          const courseIndex = selectedCourses.indexOf(curso);
          return (
            <div
              key={curso.codigo ?? curso.nombre}
              className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase truncate text-foreground">
                  {curso.nombre}
                </p>
                <p className="text-[10px] text-muted-foreground font-semibold">
                  {curso.horasSemanales} hrs/semana
                </p>
              </div>

              <div className="w-56 shrink-0">
                <Select
                  value={curso.profesorId || "NONE"}
                  onValueChange={(val) =>
                    onUpdateTeacher(courseIndex, val === "NONE" ? null : val)
                  }
                >
                  <SelectTrigger className="h-8 text-xs rounded-xl bg-muted/30">
                    <SelectValue placeholder="Seleccionar docente..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-48 z-[80]">
                    <SelectItem value="NONE" className="text-xs italic text-muted-foreground">
                      Sin Docente Específico
                    </SelectItem>
                    {tutores.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-xs font-medium">
                        {t.name} {t.apellidoPaterno || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="rounded-xl text-xs gap-1.5"
        >
          <IconChevronLeft size={14} />
          Atrás
        </Button>
        <Button
          type="button"
          onClick={onFinish}
          disabled={loading}
          className="rounded-xl text-xs font-bold gap-1.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconCheck className="size-4" />
          )}
          Crear y Configurar Salón Completo
        </Button>
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

const EMPTY_GRADOS: any[] = [];
const EMPTY_NIVELES: any[] = [];
const EMPTY_TUTORES: any[] = [];

export function CreateSectionWizard({
  open,
  onOpenChange,
  grados = EMPTY_GRADOS,
  niveles = EMPTY_NIVELES,
  tutores = EMPTY_TUTORES,
  institucionId,
  currentAnio,
  initialGradeId,
  selectedNivelId,
}: CreateSectionWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // ── Paso 1: Datos de Sección ──
  const [gradoId, setGradoId] = useState(initialGradeId || grados[0]?.id || "");
  const [seccionNombre, setSeccionNombre] = useState("A");
  const [turno, setTurno] = useState("MANANA");
  const [capacidad, setCapacidad] = useState("30");
  const [aulaAsignada, setAulaAsignada] = useState("");
  const [tutorId, setTutorId] = useState<string | null>(null);

  // Auto-detectar/seleccionar el grado adecuado al abrir el wizard
  useEffect(() => {
    if (open) {
      setStep(1);
      setSeccionNombre("A");
      setTurno("MANANA");
      setCapacidad("30");
      setAulaAsignada("");
      setTutorId(null);

      if (initialGradeId) {
        setGradoId(initialGradeId);
      } else if (selectedNivelId) {
        const nivelGrados = grados.filter((g) => g.nivelId === selectedNivelId);
        if (nivelGrados.length > 0) {
          setGradoId(nivelGrados[0].id);
        } else if (grados.length > 0) {
          setGradoId(grados[0].id);
        }
      } else if (grados.length > 0) {
        setGradoId(grados[0].id);
      }
    }
  }, [open, initialGradeId, selectedNivelId, grados]);

  // ── Paso 2: Cursos y Áreas ──
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<WizardCourse[]>([]);

  const selectedGrado = useMemo(
    () => grados.find((g) => g.id === gradoId),
    [grados, gradoId],
  );
  const selectedNivel = useMemo(
    () => niveles.find((n) => n.id === selectedGrado?.nivelId),
    [niveles, selectedGrado],
  );
  const selectedTutor = useMemo(
    () => tutores.find((t) => t.id === tutorId),
    [tutores, tutorId],
  );

  // Refs para leer valores actuales dentro del efecto de carga (evita re-ejecución)
  const seccionNombreRef = useRef(seccionNombre);
  const tutorIdRef = useRef(tutorId);
  useEffect(() => {
    seccionNombreRef.current = seccionNombre;
    tutorIdRef.current = tutorId;
  }, [seccionNombre, tutorId]);

  // Cargar áreas según el nivel del grado seleccionado
  useEffect(() => {
    if (open && selectedGrado?.nivelId) {
      setLoadingAreas(true);
      getCurricularAreasAction(selectedGrado.nivelId)
        .then((res) => {
          if (res.data) {
            // Generar cursos sugeridos por defecto
            const initialList = res.data.map((area: any) => ({
              areaCurricularId: area.id,
              nombre: area.nombre,
              codigo: `${area.codigo || "CUR"}-${seccionNombreRef.current}`,
              horasSemanales: 3,
              profesorId: tutorIdRef.current,
              selected: true,
            }));
            setSelectedCourses(initialList);
          }
        })
        .catch((err) => console.error("Error loading areas:", err))
        .finally(() => setLoadingAreas(false));
    }
  }, [open, selectedGrado?.nivelId]);

  // Actualizar tutor por defecto en cursos al cambiar tutor
  useEffect(() => {
    if (tutorId) {
      setSelectedCourses((prev) =>
        prev.map((c) => ({
          ...c,
          profesorId: c.profesorId || tutorId,
        })),
      );
    }
  }, [tutorId]);

  const toggleCourseSelection = (index: number) => {
    setSelectedCourses((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, selected: !item.selected } : item,
      ),
    );
  };

  const updateCourseHours = (index: number, hours: number) => {
    setSelectedCourses((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, horasSemanales: hours } : item,
      ),
    );
  };

  const updateCourseTeacher = (index: number, profId: string | null) => {
    setSelectedCourses((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, profesorId: profId } : item,
      ),
    );
  };

  const handleFinishWizard = async () => {
    const activeCourses = selectedCourses.filter((c) => c.selected);
    if (!gradoId || !seccionNombre) {
      toast.error("Por favor completa los datos del aula");
      return;
    }
    if (activeCourses.length === 0) {
      toast.error("Selecciona al menos 1 curso para el salón");
      return;
    }

    setLoading(true);
    try {
      const res = await createFullSectionWizardAction({
        seccionData: {
          gradoId,
          seccion: seccionNombre.toUpperCase(),
          turno,
          capacidad: parseInt(capacidad) || 30,
          aulaAsignada: aulaAsignada || undefined,
          tutorId: tutorId || null,
          anioAcademico: currentAnio,
          institucionId,
        },
        cursosData: activeCourses.map((c) => ({
          nombre: c.nombre,
          codigo: `${c.codigo}`.toUpperCase(),
          areaCurricularId: c.areaCurricularId,
          horasSemanales: c.horasSemanales || 3,
          profesorId: c.profesorId || tutorId || null,
        })),
      });

      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
        setStep(1);
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al crear el salón completo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      title="Asistente: Crear Nuevo Salón de Clases"
      description="Configura el aula, sus asignaturas y sus profesores en 3 pasos sencillos."
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-2xl p-6"
    >
      <WizardStepIndicator step={step} />

      {step === 1 && (
        <StepDatosAula
          grados={grados}
          niveles={niveles}
          selectedNivelId={selectedNivelId}
          gradoId={gradoId}
          onGradoChange={setGradoId}
          seccionNombre={seccionNombre}
          onSeccionNombreChange={setSeccionNombre}
          turno={turno}
          onTurnoChange={setTurno}
          capacidad={capacidad}
          onCapacidadChange={setCapacidad}
          aulaAsignada={aulaAsignada}
          onAulaAsignadaChange={setAulaAsignada}
          tutores={tutores}
          tutorId={tutorId}
          onTutorChange={setTutorId}
          selectedTutor={selectedTutor}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepMallaCursos
          selectedGrado={selectedGrado}
          seccionNombre={seccionNombre}
          selectedNivel={selectedNivel}
          selectedCourses={selectedCourses}
          loadingAreas={loadingAreas}
          onToggleCourse={toggleCourseSelection}
          onUpdateHours={updateCourseHours}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepProfesores
          selectedCourses={selectedCourses}
          seccionNombre={seccionNombre}
          tutores={tutores}
          onUpdateTeacher={updateCourseTeacher}
          onBack={() => setStep(2)}
          onFinish={handleFinishWizard}
          loading={loading}
        />
      )}
    </FormModal>
  );
}
