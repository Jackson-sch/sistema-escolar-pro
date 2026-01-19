"use client"

import { useState } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconBooks
} from "@tabler/icons-react"
import { Row } from "@tanstack/react-table"
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
import { FormModal } from "@/components/modals/form-modal"

import { deleteAreaAction } from "@/actions/academic"
import { AreaForm } from "./area-form"
import { AreaTableType } from "./area-table-columns"
import { ConfirmModal } from "@/components/modals/confirm-modal"

interface AreaRowActionsProps {
  row: Row<AreaTableType>
}

export function AreaRowActions({ row }: AreaRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const area = row.original
  // Acceso seguro al institucionId desde los metadatos de la tabla
  const institucionId = (row as any).table?.options?.meta?.institucionId || ""

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteAreaAction(area.id)
      if (res.success) {
        toast.success(res.success)
        setShowConfirmModal(false)
      }
      if (res.error) toast.error(res.error)
    } finally {
      setIsDeleting(false)
    }
  }

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
          <DropdownMenuLabel>Gestión</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <IconEdit className="mr-2 h-4 w-4 text-indigo-500" />
            Editar Área
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Eliminar Área
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Área Curricular"
        description={`¿Estás seguro de eliminar el área "${area.nombre}"? Esta acción no se puede deshacer y afectará a los cursos asociados.`}
      />

      <FormModal
        title="Editar Área Curricular"
        description="Actualice los datos generales, el código o el color distintivo del área académica."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-xl"
      >
        <AreaForm
          id={area.id}
          initialData={area}
          institucionId={institucionId}
          onSuccess={() => setShowEditDialog(false)}
        />
      </FormModal>
    </>
  )
}
