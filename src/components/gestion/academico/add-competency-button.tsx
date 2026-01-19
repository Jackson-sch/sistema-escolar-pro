"use client";

import { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { CompetencyForm } from "./competency-form";

export function AddCompetencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg shadow-violet-500/20 gap-2"
      >
        <IconPlus className="size-4" />
        <span className="hidden sm:inline">Nueva Competencia</span>
      </Button>

      <FormModal
        title="Nueva Competencia"
        description="Defina una nueva competencia curricular asociada a un área académica."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-xl"
      >
        <CompetencyForm onSuccess={() => setOpen(false)} />
      </FormModal>
    </>
  );
}
