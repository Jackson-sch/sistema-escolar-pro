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
        className="rounded-full font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        onClick={() => setOpen(true)}
      >
        <IconUserPlus className="mr-2 h-4 w-4" />
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
