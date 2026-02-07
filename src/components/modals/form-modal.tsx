"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ShineBorder } from "../ui/shine-border";
import { FormModalProvider, useFormModal } from "./form-modal-context";
import { toast } from "sonner";
import { useState } from "react";
import { SafeCloseDialog } from "./safe-close-dialog";

interface FormModalProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

/**
 * Componente de modal genérico para formularios.
 * Proporciona una estructura estandarizada y estética premium para todos los diálogos de la app.
 */
export function FormModal(props: FormModalProps) {
  return (
    <FormModalProvider>
      <FormModalInner {...props} />
    </FormModalProvider>
  );
}

function FormModalInner({
  title,
  description,
  isOpen,
  onOpenChange,
  children,
  className,
  headerClassName,
}: FormModalProps) {
  const { isDirty, setIsDirty } = useFormModal();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && isDirty) {
      setShowConfirm(true);
      return;
    }
    onOpenChange(open);
  };

  const onConfirmClose = () => {
    setShowConfirm(false);
    setIsDirty(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (isDirty) {
            e.preventDefault();
            toast.warning("Guarda los cambios o cancela para salir", {
              description: "Tienes cambios sin guardar en el formulario.",
              duration: 3000,
            });
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isDirty) {
            e.preventDefault();
            toast.warning("Guarda los cambios o cancela para salir");
          }
        }}
        className={cn(
          "sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-card",
          className,
        )}
      >
        <ShineBorder shineColor={["#A07CFE", "#FE8FB5", "#FFBE7B"]} />
        <DialogHeader className={cn("p-6 pb-4 border-b", headerClassName)}>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-xs mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 pt-4 text-pretty">
          {children}
        </div>
      </DialogContent>

      <SafeCloseDialog
        isOpen={showConfirm}
        onConfirm={onConfirmClose}
        onCancel={() => setShowConfirm(false)}
      />
    </Dialog>
  );
}
