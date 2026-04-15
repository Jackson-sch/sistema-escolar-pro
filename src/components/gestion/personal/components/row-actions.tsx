"use client";

import { useState } from "react";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";

import {
  ResponsiveRowActions,
  ActionItem,
} from "@/components/common/responsive-row-actions";
import { FormModal } from "@/components/modals/form-modal";

import { deleteStaffAction } from "@/actions/staff";
import { StaffForm } from "@/components/gestion/personal/management/staff-form";
import { StaffTableType } from "@/components/gestion/personal/components/columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import StaffProfile from "@/components/gestion/personal/management/staff-profile";

interface StaffRowActionsProps {
  row: Row<StaffTableType>;
  table: Table<StaffTableType>;
}

export function StaffRowActions({ row, table }: StaffRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const staff = row.original;

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteStaffAction(staff.id);
      if (res.success) {
        toast.success(res.success);
        setShowConfirmModal(false);
      }
      if (res.error) toast.error(res.error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Obtenemos los datos maestros del meta de la tabla
  const metaData = table.options.meta as {
    instituciones: any[];
    estados: any[];
    cargos: any[];
  };

  const isAdminGlobal = staff.cargo?.codigo === "ADMIN_GLOBAL" || staff.email === "admin@colegio.edu.pe";

  const actions: ActionItem[] = [
    {
      icon: IconEye,
      label: "Perfil Profesional",
      onClick: () => setShowViewSheet(true),
      variant: "ghost",
      className: "rounded-full",
    },
    // Hide Edit and Delete for admin global
    ...(!isAdminGlobal
      ? [
          {
            icon: IconEdit,
            label: "Editar Datos",
            onClick: () => setShowEditDialog(true),
            variant: "ghost" as const,
            className: "rounded-full text-blue-500",
          },
          { isSeparator: true as const },
          {
            icon: IconTrash,
            label: "Dar de Baja",
            onClick: () => setShowConfirmModal(true),
            variant: "ghost" as const,
            className: "rounded-full text-red-500",
          },
        ]
      : []),
  ];

  return (
    <>
      <ResponsiveRowActions actions={actions} label="Acciones" />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Dar de Baja Personal"
        description={`¿Estás seguro de eliminar a ${staff.name} ${staff.apellidoPaterno}? Esta acción no se puede deshacer y el usuario perderá el acceso al sistema.`}
      />

      <FormModal
        title="Editar Personal"
        description={`Personaliza el expediente laboral de ${staff.name}.`}
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <StaffForm
          id={staff.id}
          initialData={staff}
          onSuccess={() => setShowEditDialog(false)}
          instituciones={metaData?.instituciones || []}
          estados={metaData?.estados || []}
          cargos={metaData?.cargos || []}
        />
      </FormModal>

      {/* Sheet de Perfil Profesional (Expediente) */}
      <StaffProfile
        staff={staff}
        showViewSheet={showViewSheet}
        setShowViewSheet={setShowViewSheet}
        setShowEditDialog={setShowEditDialog}
      />
    </>
  );
}
