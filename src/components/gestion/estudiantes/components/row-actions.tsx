"use client";

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

import { FormModal } from "@/components/modals/form-modal";
import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";

import { deleteStudentAction } from "@/actions/students";
import { StudentForm } from "@/components/gestion/estudiantes/management/student-form";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useCurrentRole } from "@/hooks/use-current-role";
import { ViewStudentSheet } from "@/components/gestion/estudiantes/management/view-student-sheet";
import { EnrollmentForm } from "@/components/gestion/matriculas/management/enrollment-form";

interface RowActionsProps {
  row: Row<StudentTableType>;
  table: Table<StudentTableType>;
}

export function RowActions({ row, table }: RowActionsProps) {
  const role = useCurrentRole();
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
    ...(!isProfessor
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

      <FormModal
        title="Editar Estudiante"
        description="Modifique los datos personales y académicos del alumno."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-4xl"
      >
        <StudentForm
          id={student.id}
          initialData={student}
          onSuccess={() => setShowEditDialog(false)}
          instituciones={metaData?.instituciones || []}
          estados={metaData?.estados || []}
        />
      </FormModal>

      <FormModal
        title={`Inscripción Académica ${year}`}
        description={`Formalice la vacante de ${student.name} ${student.apellidoPaterno} para el nuevo periodo lectivo.`}
        isOpen={showEnrollmentDialog}
        onOpenChange={setShowEnrollmentDialog}
        className="sm:max-w-2xl"
      >
        {showEnrollmentDialog && (
          <EnrollmentForm
            onSuccess={() => {
              setShowEnrollmentDialog(false);
              // Podríamos necesitar revalidar o refrescar la tabla si no es automático
            }}
            onCancel={() => setShowEnrollmentDialog(false)}
            nivelesAcademicos={metaData?.nivelesAcademicos || []}
            defaultStudentId={student.id}
          />
        )}
      </FormModal>

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
