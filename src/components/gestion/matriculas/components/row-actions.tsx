"use client";

import { useState } from "react";
import {
  IconTrash,
  IconEye,
  IconReceipt,
  IconCheck,
} from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";

import { deleteEnrollmentAction, ratificarMatriculaAction } from "@/actions/enrollments";
import { EnrollmentTableType } from "@/components/gestion/matriculas/components/columns";
import { EnrollmentViewSheet } from "@/components/gestion/matriculas/management/enrollment-view-sheet";
import { EnrollmentPaymentsSheet } from "@/components/gestion/matriculas/payments/enrollment-payments-sheet";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface EnrollmentRowActionsProps {
  row: Row<EnrollmentTableType>;
  institucion?: any;
}

export function EnrollmentRowActions({
  row,
  institucion,
}: EnrollmentRowActionsProps) {
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showPaymentsSheet, setShowPaymentsSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRatifying, setIsRatifying] = useState(false);
  const enrollment = row.original;

  const onRatify = async () => {
    setIsRatifying(true);
    try {
      const res = await ratificarMatriculaAction(enrollment.id);
      if (res.success) {
        toast.success(res.success);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsRatifying(false);
    }
  };

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteEnrollmentAction(enrollment.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const actions: ActionItem[] = [];

  if (enrollment.estado === "pendiente") {
    actions.push(
      {
        icon: IconCheck,
        label: isRatifying ? "Ratificando..." : "Ratificar Matrícula",
        onClick: onRatify,
        disabled: isRatifying,
        variant: "ghost",
        className: "text-amber-600 dark:text-amber-400 font-bold rounded-full hover:bg-amber-500/10",
      },
      { isSeparator: true },
    );
  }

  actions.push(
    {
      icon: IconEye,
      label: "Ver Constancia",
      onClick: () => setShowViewSheet(true),
      variant: "ghost",
      className: "rounded-full",
    },
    {
      icon: IconReceipt,
      label: "Pagos Asociados",
      onClick: () => setShowPaymentsSheet(true),
      variant: "ghost",
      className: "text-green-500 rounded-full",
    },
    { isSeparator: true },
    {
      icon: IconTrash,
      label: "Anular Inscripción",
      onClick: () => setShowConfirmModal(true),
      className: "text-red-500 rounded-full",
    },
  );

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Gestión de Matrícula" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Anular Matrícula"
        description={`¿Estás seguro de anular la matrícula de ${enrollment.estudiante.name}? Esta acción es irreversible y se liberará la vacante.`}
      />

      <EnrollmentViewSheet
        open={showViewSheet}
        onOpenChange={setShowViewSheet}
        enrollment={enrollment}
        institucion={institucion}
      />

      <EnrollmentPaymentsSheet
        open={showPaymentsSheet}
        onOpenChange={setShowPaymentsSheet}
        enrollment={enrollment}
      />
    </>
  );
}
