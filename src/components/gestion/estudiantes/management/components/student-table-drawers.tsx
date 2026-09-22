"use client";

import dynamic from "next/dynamic";
import { ViewStudentSheet } from "@/components/gestion/estudiantes/management/view-student-sheet";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { StudentTableMeta } from "./student-table-types";

const FormDrawer = dynamic(
  () =>
    import("@/components/modals/form-drawer").then((m) => ({
      default: m.FormDrawer,
    })),
  { ssr: false },
);

const StudentForm = dynamic(
  () =>
    import("@/components/gestion/estudiantes/management/student-form").then(
      (m) => ({ default: m.StudentForm }),
    ),
  { ssr: false },
);

const EnrollmentForm = dynamic(
  () =>
    import(
      "@/components/gestion/matriculas/management/enrollment-form"
    ).then((m) => ({ default: m.EnrollmentForm })),
  { ssr: false },
);

interface StudentTableDrawersProps {
  selectedStudent: StudentTableType | null;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  isEnrollmentOpen: boolean;
  setIsEnrollmentOpen: (open: boolean) => void;
  isProfessor: boolean;
  meta?: StudentTableMeta;
  currentYear?: number;
}

export function StudentTableDrawers(props: StudentTableDrawersProps) {
  const {
    selectedStudent,
    isDrawerOpen,
    setIsDrawerOpen,
    isEditOpen,
    setIsEditOpen,
    isEnrollmentOpen,
    setIsEnrollmentOpen,
    isProfessor,
    meta,
    currentYear,
  } = props;
  if (!selectedStudent) return null;

  return (
    <>
      {/* QUICK PEEK DRAWER / EXPEDIENTE LATERAL */}
      <ViewStudentSheet
        student={selectedStudent}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        isProfessor={isProfessor}
        onEdit={() => setIsEditOpen(true)}
        metaData={meta}
      />

      {/* DRAWER DE EDICIÓN RÁPIDA (Ctrl + E / E) */}
      {isEditOpen && (
        <FormDrawer
          title="Editar Estudiante"
          description="Modifique los datos personales y académicos del alumno seleccionado."
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
        >
          <StudentForm
            id={selectedStudent.id}
            initialData={selectedStudent as any}
            onSuccess={() => setIsEditOpen(false)}
            instituciones={(meta?.instituciones || []) as any}
            estados={(meta?.estados || []) as any}
          />
        </FormDrawer>
      )}

      {/* DRAWER DE MATRÍCULA RÁPIDA (Ctrl + M / M) */}
      {isEnrollmentOpen && (
        <FormDrawer
          title={`Inscripción Académica ${currentYear || new Date().getFullYear()}`}
          description={`Formalice la vacante de ${selectedStudent.name} ${selectedStudent.apellidoPaterno} para el nuevo ciclo lectivo.`}
          isOpen={isEnrollmentOpen}
          onOpenChange={setIsEnrollmentOpen}
        >
          <EnrollmentForm
            onSuccess={() => setIsEnrollmentOpen(false)}
            onCancel={() => setIsEnrollmentOpen(false)}
            nivelesAcademicos={meta?.nivelesAcademicos || []}
            defaultStudentId={selectedStudent.id}
          />
        </FormDrawer>
      )}
    </>
  );
}
