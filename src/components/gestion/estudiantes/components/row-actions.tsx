"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
  IconEdit,
  IconTrash,
  IconEye,
  IconFilePlus,
  IconDownload,
} from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

import { FormDrawer } from "@/components/modals/form-drawer";
import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";

import { deleteStudentAction } from "@/actions/students";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { useCurrentRole } from "@/hooks/use-current-role";

const StudentForm = dynamic(
  () =>
    import(
      "@/components/gestion/estudiantes/management/student-form"
    ).then((m) => ({ default: m.StudentForm })),
  { ssr: false },
);
const ConfirmModal = dynamic(
  () =>
    import("@/components/modals/confirm-modal").then((m) => ({
      default: m.ConfirmModal,
    })),
  { ssr: false },
);
const ViewStudentSheet = dynamic(
  () =>
    import(
      "@/components/gestion/estudiantes/management/view-student-sheet"
    ).then((m) => ({ default: m.ViewStudentSheet })),
  { ssr: false },
);
const EnrollmentForm = dynamic(
  () =>
    import(
      "@/components/gestion/matriculas/management/enrollment-form"
    ).then((m) => ({ default: m.EnrollmentForm })),
  { ssr: false },
);

interface RowActionsProps {
  row: Row<StudentTableType>;
  table: Table<StudentTableType>;
}

export function RowActions({ row, table }: RowActionsProps) {
  const role = useCurrentRole();
  const canManage = role === "administrativo" || role === "super_admin";
  const isProfessor = role === "profesor";

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const student = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteStudentAction(student.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const metaData = table.options.meta as {
    instituciones: any[];
    estados: any[];
    nivelesAcademicos: any[];
    institucion: any;
  };

  const isEnrolled = !!student.matriculadoEsteAnio;
  const year = new Date().getFullYear();

  const actions: ActionItem[] = [
    {
      icon: IconEye,
      label: "Ver Expediente",
      onClick: () => setShowViewSheet(true),
      variant: "ghost",
      className: "rounded-full",
    },
    {
      icon: IconDownload,
      label: "Descargar Boleta",
      onClick: () => window.open(`/api/documentos/boleta?estudianteId=${student.id}&anio=${year}`, '_blank'),
      variant: "ghost",
      className: "text-violet-500 rounded-full",
    },
    ...(canManage
      ? ([
          !isEnrolled && {
            icon: IconFilePlus,
            label: "Matricular Alumno",
            onClick: () => setShowEnrollmentDialog(true),
            variant: "ghost",
            className: "text-emerald-500 rounded-full",
          },
          {
            icon: IconEdit,
            label: "Editar Datos",
            onClick: () => setShowEditDialog(true),
            variant: "ghost",
            className: "text-blue-500 rounded-full",
          },
          { isSeparator: true },
          {
            icon: IconTrash,
            label: "Dar de Baja",
            onClick: () => setShowConfirmModal(true),
            variant: "ghost",
            className: "text-red-500 rounded-full",
          },
        ].filter(Boolean) as ActionItem[])
      : []),
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Opciones" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Dar de Baja Estudiante"
        description={`¿Estás seguro de eliminar a ${student.name} ${student.apellidoPaterno}? Esta acción es irreversible y el alumno perderá su registro histórico.`}
      />

      <FormDrawer
        title="Editar Estudiante"
        description="Modifique los datos personales y académicos del alumno."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <StudentForm
          id={student.id}
          initialData={student}
          onSuccess={() => setShowEditDialog(false)}
          instituciones={metaData?.instituciones || []}
          estados={metaData?.estados || []}
        />
      </FormDrawer>

      <FormDrawer
        title={`Inscripción Académica ${year}`}
        description={`Formalice la vacante de ${student.name} ${student.apellidoPaterno} para el nuevo periodo lectivo.`}
        isOpen={showEnrollmentDialog}
        onOpenChange={setShowEnrollmentDialog}
      >
        {showEnrollmentDialog && (
          <EnrollmentForm
            onSuccess={() => {
              setShowEnrollmentDialog(false);
            }}
            onCancel={() => setShowEnrollmentDialog(false)}
            nivelesAcademicos={metaData?.nivelesAcademicos || []}
            defaultStudentId={student.id}
          />
        )}
      </FormDrawer>

      <ViewStudentSheet
        student={student}
        isOpen={showViewSheet}
        onOpenChange={setShowViewSheet}
        isProfessor={isProfessor}
        onEdit={() => setShowEditDialog(true)}
        metaData={metaData}
      />
    </>
  );
}
