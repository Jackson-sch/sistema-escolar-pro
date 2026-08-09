"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { ProspectoForm } from "@/components/gestion/admisiones/management/prospecto-form";
import { FormModal } from "@/components/modals/form-modal";

interface AddProspectoButtonProps {
  grados: any[];
  instituciones: any[];
}

export function AddProspectoButton({
  grados,
  instituciones,
}: AddProspectoButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        className="rounded-xl h-10 px-4 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <IconUserPlus className="size-4" />
        Registrar Interesado
      </Button>

      <FormModal
        title="Nuevo Prospecto"
        description="Registre los datos básicos del interesado para iniciar el seguimiento."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-lg"
      >
        <ProspectoForm
          grados={grados}
          instituciones={instituciones}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  );
}
