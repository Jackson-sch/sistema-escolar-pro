"use client";

import { useState } from "react";
import { IconUserPlus, IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StudentForm } from "./student-form";
import { FormModal } from "@/components/modals/form-modal";

interface AddStudentButtonProps {
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
}

export function AddStudentButton({
  instituciones,
  estados,
}: AddStudentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 shadow-lg shadow-primary/20 transition-all active:scale-95 px-4"
            >
              <IconPlus className="mr-2 size-4" />
              <span className="hidden sm:inline">Nuevo Estudiante</span>
              <IconUserPlus className="sm:hidden size-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-[11px] font-medium">
            Registrar Nuevo Alumno
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FormModal
        title="Registro de Estudiante"
        description={`Gestión de alta para el periodo académico ${new Date().getFullYear()}.`}
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-4xl"
      >
        <StudentForm
          onSuccess={() => setOpen(false)}
          instituciones={instituciones}
          estados={estados}
        />
      </FormModal>
    </>
  );
}
