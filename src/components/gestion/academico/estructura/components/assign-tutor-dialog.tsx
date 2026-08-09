"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignTutorAction } from "@/actions/academic-structure";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TeacherSelector } from "@/components/common/teacher-selector";

interface AssignTutorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seccion: any;
  tutores: any[];
}

export function AssignTutorDialog({ open, onOpenChange, seccion, tutores }: AssignTutorDialogProps) {
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async (tutorId: string | null) => {
    if (!seccion) return;
    setAssigning(true);
    try {
      const res = await assignTutorAction(seccion.id, tutorId);
      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al asignar tutor");
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 border-none shadow-lg bg-card overflow-hidden">
        <DialogHeader className="p-5 pb-3 border-b border-border/40">
          <DialogTitle className="text-base font-bold tracking-tight">
            Asignar Tutor
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sección {seccion?.seccion} · {seccion?.grado?.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4">
          <TeacherSelector
            teachers={tutores}
            onSelect={handleAssign}
            selectedTeacherId={seccion?.tutor?.id}
            currentTeacher={seccion?.tutor}
            isLoading={assigning}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
