"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FormModal } from "@/components/modals/form-modal";
import { getCurricularAreasAction } from "@/actions/academic";
import { createFullSectionWizardAction } from "@/actions/academic-structure";

import {
  CreateSectionWizardProps,
  WizardCourse,
} from "./wizard/wizard-types";
import { WizardStepIndicator } from "./wizard/wizard-step-indicator";
import { StepDatosAula } from "./wizard/step-datos-aula";
import { StepMallaCursos } from "./wizard/step-malla-cursos";
import { StepProfesores } from "./wizard/step-profesores";

const EMPTY_GRADOS: any[] = [];
const EMPTY_NIVELES: any[] = [];
const EMPTY_TUTORES: any[] = [];

function CreateSectionWizardContent({
  onOpenChange,
  grados = EMPTY_GRADOS,
  niveles = EMPTY_NIVELES,
  tutores = EMPTY_TUTORES,
  institucionId,
  currentAnio,
  initialGradeId,
  selectedNivelId,
}: Omit<CreateSectionWizardProps, "open">) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Inicialización de grado
  const defaultGradoId = useMemo(() => {
    if (initialGradeId) return initialGradeId;
    if (selectedNivelId) {
      const nivelGrados = grados.filter(
        (g) => g.nivelId === selectedNivelId,
      );
      if (nivelGrados.length > 0) return nivelGrados[0].id;
    }
    return grados[0]?.id || "";
  }, [initialGradeId, selectedNivelId, grados]);

  // Paso 1: Datos de Sección
  const [gradoId, setGradoId] = useState(defaultGradoId);
  const [seccionNombre, setSeccionNombre] = useState("A");
  const [turno, setTurno] = useState("MANANA");
  const [capacidad, setCapacidad] = useState("30");
  const [aulaAsignada, setAulaAsignada] = useState("");
  const [tutorId, setTutorId] = useState<string | null>(null);

  // Paso 2 & 3: Cursos de la Malla
  const [selectedCourses, setSelectedCourses] = useState<WizardCourse[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const loadedGradoRef = useRef<string | null>(null);

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

  // Cargar áreas curriculares según el nivel del grado seleccionado
  useEffect(() => {
    if (!selectedGrado?.nivelId) return;
    if (loadedGradoRef.current === selectedGrado.nivelId) return;

    const controller = new AbortController();
    setLoadingAreas(true);
    getCurricularAreasAction(institucionId)
      .then((res) => {
        if (!controller.signal.aborted && res.data) {
          const areasNivel = res.data.filter(
            (a: any) => a.nivelId === selectedGrado?.nivelId,
          );
          const initialCourses: WizardCourse[] = areasNivel.map(
            (area: any) => ({
              areaCurricularId: area.id,
              nombre: area.nombre,
              codigo: area.codigo,
              horasSemanales: area.horasSemanales || 2,
              profesorId: null,
              selected: true,
            }),
          );
          setSelectedCourses(initialCourses);
          loadedGradoRef.current = selectedGrado?.nivelId || null;
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          toast.error("Error al cargar malla curricular");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingAreas(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedGrado?.nivelId, institucionId]);

  const handleToggleCourse = (index: number) => {
    setSelectedCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], selected: !next[index].selected };
      return next;
    });
  };

  const handleUpdateHours = (index: number, hours: number) => {
    setSelectedCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], horasSemanales: hours };
      return next;
    });
  };

  const handleUpdateTeacher = (index: number, profId: string | null) => {
    setSelectedCourses((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], profesorId: profId };
      return next;
    });
  };

  // Envío final del Wizard
  const handleFinish = async () => {
    setLoading(true);
    try {
      const activeCourses = selectedCourses.filter((c) => c.selected);
      const res = await createFullSectionWizardAction({
        seccionData: {
          gradoId,
          seccion: seccionNombre.toUpperCase(),
          capacidad: parseInt(capacidad) || 30,
          turno,
          aulaAsignada: aulaAsignada || undefined,
          tutorId: tutorId || undefined,
          anioAcademico: currentAnio,
          institucionId,
        },
        cursosData: activeCourses.map((c) => ({
          areaCurricularId: c.areaCurricularId,
          nombre: c.nombre,
          codigo: c.codigo,
          horasSemanales: c.horasSemanales,
          profesorId: c.profesorId || undefined,
        })),
      });

      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error || "Error al crear la sección y sus cursos");
      }
    } catch {
      toast.error("Ocurrió un error inesperado al procesar el asistente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <WizardStepIndicator step={step} />

      {step === 1 && (
        <StepDatosAula
          grados={grados}
          niveles={niveles}
          selectedNivelId={selectedNivelId}
          gradoId={gradoId}
          onGradoChange={(id) => {
            setGradoId(id);
            loadedGradoRef.current = null;
          }}
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
          onToggleCourse={handleToggleCourse}
          onUpdateHours={handleUpdateHours}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <StepProfesores
          selectedCourses={selectedCourses}
          seccionNombre={seccionNombre}
          tutores={tutores}
          onUpdateTeacher={handleUpdateTeacher}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
          loading={loading}
        />
      )}
    </>
  );
}

export function CreateSectionWizard(props: CreateSectionWizardProps) {
  return (
    <FormModal
      title="Asistente de Creación de Salón y Malla"
      description="Crea el aula, selecciona los cursos de la malla curricular y asigna docentes en 3 pasos."
      isOpen={props.open}
      onOpenChange={props.onOpenChange}
      className="sm:max-w-2xl"
    >
      {props.open && <CreateSectionWizardContent {...props} />}
    </FormModal>
  );
}
