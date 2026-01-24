"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconUserPlus } from "@tabler/icons-react";
import { ProspectoForm } from "@/components/gestion/admisiones/management/prospecto-form";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-full">
          <IconUserPlus className="mr-2 h-4 w-4" />
          Registrar Interesado
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Nuevo Prospecto
          </DialogTitle>
          <DialogDescription>
            Registre los datos básicos del interesado para iniciar el
            seguimiento.
          </DialogDescription>
        </DialogHeader>
        <ProspectoForm
          grados={grados}
          instituciones={instituciones}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
