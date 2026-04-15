"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignTeacherAction } from "@/actions/academic";
import { TeacherSelector } from "@/components/common/teacher-selector";

interface AssignTeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: any;
  teachers: any[];
}

export function AssignTeacherDialog({
  open,
  onOpenChange,
  course,
  teachers,
}: AssignTeacherDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleAssign = (teacherId: string | null) => {
    startTransition(() => {
      // Si teacherId es null, enviamos string vacía o null según lo que espere la acción
      // La acción assignTeacherAction actualmente espera un profesorId: string.
      // Vamos a asumir que si es null, queremos desasignar.
      assignTeacherAction(course.id, teacherId || "").then((res) => {
        if (res.success) {
          toast.success(res.success);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Error al asignar profesor");
        }
      });
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-none shadow-2xl bg-card overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <DialogTitle className="text-base font-bold tracking-tight">
            Asignar Docente
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Curso: {course?.nombre} · {course?.nivelAcademico?.grado?.nombre} "{course?.nivelAcademico?.seccion}"
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <TeacherSelector
            teachers={teachers}
            onSelect={handleAssign}
            selectedTeacherId={course?.profesor?.id}
            currentTeacher={course?.profesor}
            isLoading={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
