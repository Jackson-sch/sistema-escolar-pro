"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignTeacherAction } from "@/actions/academic";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TeacherSelector } from "@/components/common/teacher-selector";

interface AssignCourseTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  curso: any;
  tutores: any[];
}

export function AssignCourseTeacherDialog({
  open,
  onOpenChange,
  curso,
  tutores,
}: AssignCourseTeacherDialogProps) {
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (profesorId: string | null) => {
    if (!curso) return;
    setAssigning(true);
    try {
      const res = await assignTeacherAction(curso.id, profesorId);
      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error || "Error al asignar docente");
      }
    } catch {
      toast.error("Error al asignar docente del curso");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-none shadow-lg bg-card overflow-hidden z-[60]">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <DialogTitle className="text-base font-bold tracking-tight">
            Asignar Docente al Curso
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground uppercase font-bold text-primary">
            {curso?.nombre} ({curso?.horasSemanales || 2} hrs/semana)
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <TeacherSelector
            teachers={tutores}
            onSelect={handleAssign}
            selectedTeacherId={curso?.profesorId}
            currentTeacher={curso?.profesor}
            isLoading={assigning}
            searchPlaceholder="Buscar docente por nombre o apellido..."
            emptyMessage="No se encontraron profesores disponibles"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
