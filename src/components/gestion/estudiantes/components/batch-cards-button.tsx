"use client";

import { useState } from "react";
import { IconId } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { BatchCardsDialog } from "./batch-cards-dialog";

interface BatchCardsButtonProps {
  nivelFilter?: string;
  gradoFilter?: string;
  nivelesAcademicos?: any[];
}

const DEFAULT_NIVELES_ACADEMICOS: any[] = [];

export function BatchCardsButton({
  nivelFilter,
  gradoFilter,
  nivelesAcademicos = DEFAULT_NIVELES_ACADEMICOS,
}: BatchCardsButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setDialogOpen(true)}
        className="rounded-full px-4 font-semibold text-xs border-border/40 gap-2 cursor-pointer hover:bg-muted/80 shadow-2xs"
        title="Generar carnets escolares en PDF para imprimir"
      >
        <IconId className="size-4 text-sky-600 dark:text-sky-400" />
        <span className="hidden sm:inline">Imprimir Carnets (Lote)</span>
      </Button>

      <BatchCardsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        nivelesAcademicos={nivelesAcademicos}
        defaultNivel={nivelFilter}
        defaultGrado={gradoFilter}
      />
    </>
  );
}
