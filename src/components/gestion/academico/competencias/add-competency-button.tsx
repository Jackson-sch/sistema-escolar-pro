"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/modals/form-modal";
import { CompetencyForm } from "./competency-form";

export function AddCompetencyButton({ areaId, nivelId }: { areaId?: string; nivelId?: string }) {
  const [open, setOpen] = useState(false);

  const router = useRouter();

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
        description="Defina una nueva competencia curricular asociada."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-md"
      >
        <CompetencyForm 
          defaultNivelId={nivelId}
          defaultAreaId={areaId}
          onSuccess={() => {
            setOpen(false);
            router.refresh();
          }} 
        />
      </FormModal>
    </>
  );
}
