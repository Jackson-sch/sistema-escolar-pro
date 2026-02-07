"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { EstadoUsuarioForm } from "./estado-usuario-form";

export function AddEstadoUsuarioButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full shadow-lg hover:shadow-primary/20 transition-all duration-300"
      >
        <Plus className="mr-2 h-4 w-4" />
        <span>Nuevo Estado</span>
      </Button>

      <FormModal
        title="Añadir Nuevo Estado de Usuario"
        description="Configura los parámetros del nuevo estado para el sistema."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-[500px]"
      >
        <EstadoUsuarioForm onSuccess={() => setOpen(false)} />
      </FormModal>
    </>
  );
}
