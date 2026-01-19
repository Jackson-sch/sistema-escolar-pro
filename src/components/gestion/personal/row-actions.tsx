"use client"

import { useState } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconUser,
  IconBriefcase,
  IconMail,
  IconPhone,
  IconCertificate,
  IconMapPin
} from "@tabler/icons-react"
import { Row, Table } from "@tanstack/react-table"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { FormModal } from "@/components/modals/form-modal"

import { deleteStaffAction } from "@/actions/staff"
import { StaffForm } from "./staff-form"
import { StaffTableType } from "./columns"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import StaffProfile from "./staff-profile"

interface StaffRowActionsProps {
  row: Row<StaffTableType>
  table: Table<StaffTableType>
}

export function StaffRowActions({ row, table }: StaffRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showViewSheet, setShowViewSheet] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const staff = row.original

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteStaffAction(staff.id)
      if (res.success) {
        toast.success(res.success)
        setShowConfirmModal(false)
      }
      if (res.error) toast.error(res.error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Obtenemos los datos maestros del meta de la tabla
  const metaData = table.options.meta as { instituciones: any[], estados: any[], cargos: any[] }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px]">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowViewSheet(true)}>
            <IconEye className="mr-2 h-4 w-4 text-primary" />
            Perfil Profesional
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <IconEdit className="mr-2 h-4 w-4 text-blue-500" />
            Editar Datos
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Dar de Baja
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
  )
}
