"use client";

import { useState } from "react";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
  IconBook,
  IconUserCircle,
} from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
import { toast } from "sonner";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormModal } from "@/components/modals/form-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { deleteCourseAction, assignTeacherAction } from "@/actions/academic";
import { CourseForm } from "../course-form";
import { CourseTableType } from "./course-table-columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface CourseRowActionsProps {
  row: Row<CourseTableType>;
  table: Table<CourseTableType>;
}

export function CourseRowActions({ row, table }: CourseRowActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTeacherDialog, setShowTeacherDialog] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedProfesor, setSelectedProfesor] = useState<string | undefined>(
    row.original.profesor?.id,
  );

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

  const onAssignTeacher = () => {
    if (!selectedProfesor) return;

    startTransition(() => {
      assignTeacherAction(course.id, selectedProfesor).then((res) => {
        if (res.success) {
          toast.success(res.success);
          setShowTeacherDialog(false);
        } else {
          toast.error(res.error || "Error al asignar profesor");
        }
      });
    });
  };

  const meta = table?.options?.meta as any;

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
          <DropdownMenuItem onClick={() => setShowTeacherDialog(true)}>
            <IconUserCircle className="mr-2 h-4 w-4 text-purple-500" />
            Asignar Docente
          </DropdownMenuItem>
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

      {/* Modal Asignar Docente */}
      <FormModal
        title="Asignar Docente Responsable"
        description={`Seleccione el docente que se encargará del curso de ${course.nombre}.`}
        isOpen={showTeacherDialog}
        onOpenChange={setShowTeacherDialog}
        className="sm:max-w-md"
      >
        <div className="space-y-6 pt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Docente
            </label>
            <Select
              value={selectedProfesor}
              onValueChange={setSelectedProfesor}
            >
              <SelectTrigger className="bg-muted/20 border-white/5 flex items-center gap-2 rounded-full w-full h-11">
                <IconUserCircle className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Seleccionar Docente" />
              </SelectTrigger>
              <SelectContent>
                {meta?.profesores?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="capitalize">
                    {p.apellidoPaterno} {p.apellidoMaterno}, {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              variant="outline"
              onClick={() => setShowTeacherDialog(false)}
              className="rounded-full"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={onAssignTeacher}
              disabled={isPending || !selectedProfesor}
              className="rounded-full px-8"
            >
              {isPending ? "Asignando..." : "Asignar Docente"}
            </Button>
          </div>
        </div>
      </FormModal>

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
