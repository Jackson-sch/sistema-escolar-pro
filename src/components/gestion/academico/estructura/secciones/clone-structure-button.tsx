"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { cloneAcademicStructureAction } from "@/actions/academic-structure";
import { toast } from "sonner";
import { IconCopy, IconLoader2 } from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CloneStructureButton({ 
  currentAnio, 
  institucionId 
}: { 
  currentAnio: number;
  institucionId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const nextAnio = currentAnio + 1;

  const handleClone = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await cloneAcademicStructureAction(currentAnio, nextAnio, institucionId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(res.success);
        setOpen(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline"
          className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-full h-9"
        >
          <IconCopy className="mr-2 h-4 w-4" />
          Clonar a {nextAnio}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-indigo-500/20 bg-zinc-950/95 backdrop-blur-xl sm:rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 border border-indigo-500/20 rotation-glow">
            <IconCopy className="h-8 w-8 text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>
          <AlertDialogTitle className="text-center font-bold text-xl tracking-tight text-foreground">
            Clonar Estructura al {nextAnio}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center mt-2 pb-4 text-sm text-muted-foreground/90">
            ¿Confirmas que deseas copiar todas las secciones del año lectivo <strong className="text-foreground">{currentAnio}</strong> para usarlas en el año <strong className="text-indigo-400">{nextAnio}</strong>?
            <br/><br/>
            Esto preparará la institución y abrirá vacantes para el próximo periodo sin afectar a los estudiantes actuales.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-center gap-3 pt-2">
          <AlertDialogCancel disabled={isPending} className="sm:w-32 rounded-xl mt-0">
            Cancelar
          </AlertDialogCancel>
          <Button 
            onClick={handleClone} 
            disabled={isPending}
            className="sm:w-40 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
          >
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
