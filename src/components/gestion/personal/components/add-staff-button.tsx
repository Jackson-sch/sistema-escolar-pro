"use client";

import { useState } from "react";
import { IconUserPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StaffForm } from "@/components/gestion/personal/management/staff-form";
import { FormDrawer } from "@/components/modals/form-drawer";

interface AddStaffButtonProps {
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
  cargos: { id: string; nombre: string; codigo: string }[];
}

export function AddStaffButton({
  instituciones,
  estados,
  cargos,
}: AddStaffButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full sm:w-auto sm:px-4 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <IconUserPlus className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Personal</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Registrar Nuevo Personal</p>
        </TooltipContent>
      </Tooltip>

      <FormDrawer
        title="Registro de Personal"
        description="Gestión de alta para docentes, administrativos y directivos."
        isOpen={open}
        onOpenChange={setOpen}
        Icon={IconUserPlus}
      >
        <StaffForm
          onSuccess={() => setOpen(false)}
          instituciones={instituciones}
          estados={estados}
          cargos={cargos}
        />
      </FormDrawer>
    </>
  );
}
