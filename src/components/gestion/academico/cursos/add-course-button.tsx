"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { CourseForm } from "./course-form";

interface AddCourseButtonProps {
  areas: any[];
  nivelesAcademicos: any[];
  profesores: any[];
}

export function AddCourseButton({
  areas,
  nivelesAcademicos,
  profesores,
}: AddCourseButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full shadow-lg">
        <IconPlus className="mr-2 h-5 w-5" />
        Nueva Asignación
      </Button>

      <FormModal
        isOpen={open}
        onOpenChange={setOpen}
        title={`Carga Académica ${new Date().getFullYear()}`}
        description="Asigne un docente y un ambiente de aprendizaje a una nueva asignatura de la malla."
        headerClassName="bg-card/50 backdrop-blur-sm"
        className="sm:max-w-xl"
      >
        <CourseForm
          onSuccess={() => setOpen(false)}
          areas={areas}
          nivelesAcademicos={nivelesAcademicos}
          profesores={profesores}
        />
      </FormModal>
    </>
  );
}
