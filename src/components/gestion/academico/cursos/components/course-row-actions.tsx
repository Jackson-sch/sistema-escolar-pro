"use client";

import { useState, useTransition } from "react";
import { IconEdit, IconTrash, IconUserCircle } from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";
import { deleteCourseAction } from "@/actions/academic";
import { CourseForm } from "../course-form";
import { CourseTableType } from "./course-table-columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { AssignTeacherDialog } from "./assign-teacher-dialog";

interface CourseRowActionsProps {
  row: Row<CourseTableType>;
  table: Table<CourseTableType>;
}

export function CourseRowActions({ row, table }: CourseRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const course = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteCourseAction(course.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const meta = table?.options?.meta as any;

  const actions: ActionItem[] = [
    {
      icon: IconUserCircle,
      label: "Asignar Docente",
      onClick: () => setShowTeacherDialog(true),
      variant: "ghost",
      className: "text-purple-500 rounded-full",
    },
    {
      icon: IconEdit,
      label: "Editar Asignación",
      onClick: () => setShowEditDialog(true),
      variant: "ghost",
      className: "text-blue-500 rounded-full",
    },
    { isSeparator: true },
    {
      icon: IconTrash,
      label: "Eliminar Curso",
      onClick: () => setShowConfirmModal(true),
      variant: "ghost",
      className: "text-red-500 rounded-full",
    },
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Acciones" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Asignación"
        description={`¿Estás seguro de eliminar la asignación de ${course.nombre}? Esta acción no se puede deshacer.`}
      />

      <AssignTeacherDialog
        open={showTeacherDialog}
        onOpenChange={setShowTeacherDialog}
        course={course}
        teachers={meta?.profesores || []}
      />

      <FormModal
        title="Editar Asignación Académica"
        description="Modifique los detalles de la asignatura."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-xl"
      >
        <CourseForm
          id={course.id}
          initialData={course}
          onSuccess={() => setShowEditDialog(false)}
          areas={meta?.areas || []}
          nivelesAcademicos={meta?.nivelesAcademicos || []}
          profesores={meta?.profesores || []}
        />
      </FormModal>
    </>
  );
}
