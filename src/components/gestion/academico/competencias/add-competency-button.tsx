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
        className="rounded-xl h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-1.5 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
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
