"use client"

import { useState } from "react"
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconBook
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
import { FormModal } from "@/components/modals/form-modal"

import { deleteCourseAction } from "@/actions/academic"
import { CourseForm } from "./course-form"
import { CourseTableType } from "./course-table-columns"
import { ConfirmModal } from "@/components/modals/confirm-modal"

interface CourseRowActionsProps {
  row: Row<CourseTableType>
  table: Table<CourseTableType>
}

export function CourseRowActions({ row, table }: CourseRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const course = row.original

  const onDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteCourseAction(course.id)
      if (res.success) {
        toast.success(res.success)
        setShowConfirmModal(false)
      }
      if (res.error) toast.error(res.error)
    } finally {
      setIsDeleting(false)
    }
  }

  const meta = table?.options?.meta as any

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
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <IconEdit className="mr-2 h-4 w-4 text-blue-500" />
            Editar Asignación
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowConfirmModal(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Eliminar Curso
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={onDelete}
        loading={isDeleting}
        title="Eliminar Asignación"
        description={`¿Estás seguro de eliminar la asignación de ${course.nombre}? Esta acción no se puede deshacer.`}
      />

      <FormModal
        title="Editar Asignación Académica"
        description="Modifique los detalles de la asignatura o cambie el docente responsable."
        isOpen={showEditDialog}
        onOpenChange={setShowEditDialog}
        className="sm:max-w-3xl"
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
  )
}
