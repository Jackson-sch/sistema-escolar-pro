"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormModal } from "@/components/modals/form-modal";
import { AreaForm } from "./area-form";
import { useComponentShortcuts } from "@/hooks/use-component-shortcuts";

interface AddAreaButtonProps {
  institucionId: string;
  niveles: { id: string; nombre: string }[];
}

export function AddAreaButton({ institucionId, niveles }: AddAreaButtonProps) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const rawNivel = searchParams.get("nivel");
  const nivelId = rawNivel && rawNivel !== "all" ? rawNivel : undefined;

  useComponentShortcuts({
    onNew: () => setOpen(true),
  });

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer"
          >
            <IconPlus className="size-4" />
            <span>Nueva Área</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Registrar Nueva Área Académica (Alt + N)</p>
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Configuración de Malla Curricular"
        description="Defina una nueva área pedagógica para organizar las asignaturas de la institución."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-md"
      >
        <AreaForm
          institucionId={institucionId}
          niveles={niveles}
          defaultNivelId={nivelId}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  );
}
