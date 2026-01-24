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
        className="rounded-full"
      >
        <IconPlus className="size-4" />
        <span className="hidden sm:inline">Nueva Competencia</span>
      </Button>

      <FormModal
        title="Nueva Competencia"
        description="Defina una nueva competencia curricular asociada a un área académica."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-md"
      >
        <CompetencyForm onSuccess={() => setOpen(false)} />
      </FormModal>
    </>
  );
}
