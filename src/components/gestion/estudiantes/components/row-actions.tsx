"use client";

import { useState } from "react";

import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { Row, Table } from "@tanstack/react-table";
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
import { FormModal } from "@/components/modals/form-modal";

import { deleteStudentAction } from "@/actions/students";
import { StudentForm } from "@/components/gestion/estudiantes/management/student-form";
import { StudentTableType } from "@/components/gestion/estudiantes/components/columns";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useCurrentRole } from "@/hooks/use-current-role";
import { ViewStudentSheet } from "@/components/gestion/estudiantes/management/view-student-sheet";

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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
            <span className="sr-only">Abrir menú</span>
            <IconDotsVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[180px] bg-background/95 backdrop-blur-xl border-border/40"
        >
          <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-2 py-1.5">
            Opciones
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => setShowViewSheet(true)}
            className="text-[13px] py-2 cursor-pointer transition-colors"
          >
            <IconEye className="mr-2 h-4 w-4 text-violet-500" />
            Ver Expediente
          </DropdownMenuItem>
          {!isProfessor && (
            <>
              <DropdownMenuItem
                onClick={() => setShowEditDialog(true)}
                className="text-[13px] py-2 cursor-pointer transition-colors"
              >
                <IconEdit className="mr-2 h-4 w-4 text-blue-500" />
                Editar Datos
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/40" />
              <DropdownMenuItem
                onClick={() => setShowConfirmModal(true)}
                className="text-[13px] py-2 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Dar de Baja
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
