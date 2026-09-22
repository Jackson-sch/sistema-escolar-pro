"use client";

import { useRouter } from "next/navigation";
import { FormModal } from "@/components/modals/form-modal";
import { NivelForm } from "../niveles/add-nivel-button";
import { GradoForm } from "../grados/add-grado-button";
import { SeccionForm } from "../secciones/seccion-form";
import { AssignTutorDialog } from "./assign-tutor-dialog";
import { AssignCourseModal } from "./assign-course-modal";
import { CreateSectionWizard } from "./create-section-wizard";

interface StructureFormModalsProps {
  institucionId: string;
  selectedYear: number;
  selectedNivelId: string;
  initialNiveles: any[];
  initialGrados: any[];
  initialSecciones: any[];
  tutores: any[];
  sedes: any[];
  nivelModal: { open: boolean; data?: any };
  setNivelModal: (m: { open: boolean; data?: any }) => void;
  gradoModal: { open: boolean; data?: any };
  setGradoModal: (m: { open: boolean; data?: any }) => void;
  seccionModal: { open: boolean; data?: any; gradeId?: string };
  setSeccionModal: (m: { open: boolean; data?: any; gradeId?: string }) => void;
  tutorModal: { open: boolean; seccion?: any };
  setTutorModal: (m: { open: boolean; seccion?: any }) => void;
  courseModal: { open: boolean; seccion?: any };
  setCourseModal: (m: { open: boolean; seccion?: any }) => void;
  wizardModal: { open: boolean; gradeId?: string };
  setWizardModal: (m: { open: boolean; gradeId?: string }) => void;
  getSectionsForGrade: (gradeId: string) => any[];
}

export function StructureFormModals({
  institucionId,
  selectedYear,
  selectedNivelId,
  initialNiveles,
  initialGrados,
  initialSecciones,
  tutores,
  sedes,
  nivelModal,
  setNivelModal,
  gradoModal,
  setGradoModal,
  seccionModal,
  setSeccionModal,
  tutorModal,
  setTutorModal,
  courseModal,
  setCourseModal,
  wizardModal,
  setWizardModal,
  getSectionsForGrade,
}: StructureFormModalsProps) {
  const router = useRouter();

  return (
    <>
      <FormModal
        title={nivelModal.data ? "Editar Nivel" : "Nuevo Nivel"}
        description={
          nivelModal.data
            ? "Actualiza el nombre del nivel educativo."
            : "Crea un nuevo nivel para la institución."
        }
        isOpen={nivelModal.open}
        onOpenChange={(open) => setNivelModal({ open })}
        className="sm:max-w-xs"
      >
        <NivelForm
          institucionId={institucionId}
          initialData={nivelModal.data}
          onSuccess={() => {
            setNivelModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      <FormModal
        title={gradoModal.data ? "Editar Grado" : "Nuevo Grado"}
        description={
          gradoModal.data
            ? "Cambia los detalles del grado académico."
            : "Añade un año escolar al nivel seleccionado."
        }
        isOpen={gradoModal.open}
        onOpenChange={(open) => setGradoModal({ open })}
        className="sm:max-w-sm"
      >
        <GradoForm
          niveles={initialNiveles}
          initialData={gradoModal.data ?? { nivelId: selectedNivelId }}
          onSuccess={() => {
            setGradoModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      <FormModal
        title={seccionModal.data ? "Editar Sección" : "Nueva Sección"}
        description={
          seccionModal.data
            ? "Modifica los datos de la sección."
            : "Registra un aula y tutor para el grado seleccionado."
        }
        isOpen={seccionModal.open}
        onOpenChange={(open) => setSeccionModal({ open })}
        className="sm:max-w-xl"
      >
        <SeccionForm
          grados={initialGrados.map((g) => ({
            ...g,
            nivel: initialNiveles.find((n) => n.id === g.nivelId),
          }))}
          tutores={tutores}
          sedes={sedes}
          institucionId={institucionId}
          currentAnio={selectedYear}
          initialData={
            seccionModal.data ?? {
              gradoId: seccionModal.gradeId,
              anioAcademico: selectedYear,
              institucionId,
            }
          }
          onSuccess={() => {
            setSeccionModal({ open: false });
            router.refresh();
          }}
        />
      </FormModal>

      {/* Quick Tutor Assignment Dialog */}
      <AssignTutorDialog
        open={tutorModal.open}
        onOpenChange={(open) => setTutorModal({ open })}
        seccion={tutorModal.seccion}
        tutores={tutores}
      />

      {/* Quick Course Assignment Dialog */}
      <AssignCourseModal
        open={courseModal.open}
        onOpenChange={(open) => setCourseModal({ open })}
        seccion={courseModal.seccion}
        nivelId={selectedNivelId}
        tutores={tutores}
        allSeccionesInGrade={
          courseModal.seccion
            ? getSectionsForGrade(courseModal.seccion.gradoId)
            : []
        }
      />

      {/* Wizard para Crear Salón Completo */}
      <CreateSectionWizard
        open={wizardModal.open}
        onOpenChange={(open) => setWizardModal({ open })}
        grados={initialGrados}
        niveles={initialNiveles}
        tutores={tutores}
        institucionId={institucionId}
        currentAnio={selectedYear}
        initialGradeId={wizardModal.gradeId}
        selectedNivelId={selectedNivelId}
      />
    </>
  );
}
