"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconTrash,
  IconEye,
  IconReceipt,
} from "@tabler/icons-react";
import { Row } from "@tanstack/react-table";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { deleteEnrollmentAction } from "@/actions/enrollments";
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
  const enrollment = row.original;

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Gestión de Matrícula</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowViewSheet(true)}>
            <IconEye className="mr-2 h-4 w-4 text-primary" />
            Ver Constancia
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPaymentsSheet(true)}>
            <IconReceipt className="mr-2 h-4 w-4 text-green-500" />
            Pagos Asociados
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Anular Inscripción
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
