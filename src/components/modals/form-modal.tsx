"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ShineBorder } from "@/components/ui/shine-border";
import { FormModalProvider, useFormModal } from "@/components/modals/form-modal-context";
import { toast } from "sonner";
import { SafeCloseDialog } from "@/components/modals/safe-close-dialog";
import { useFormShortcuts } from "@/hooks/use-form-shortcuts";

interface FormModalProps {
  title: string;
  titleSpan?: string;
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
  titleSpan,
  description,
  isOpen,
  onOpenChange,
  children,
  className,
  headerClassName,
}: FormModalProps) {
  const { isDirty, setIsDirty, triggerSubmit } = useFormModal();
  const [showConfirm, setShowConfirm] = useState(false);

  useFormShortcuts({
    onSubmit: triggerSubmit,
    isLoading: false, // El modal no sabe si está cargando, pero el submit handler del form hijo sí
  });

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
          <div className="flex items-center gap-3">
           <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle> 
            {titleSpan && <span className="hidden sm:inline-flex items-center text-[10px] font-mono bg-white/5 text-zinc-500 border border-white/[0.07] px-2 py-1 rounded-md shrink-0">{titleSpan}</span>}
          </div>
          
          {description && (
            <DialogDescription className="text-xs mt-1">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-6 pt-4 text-pretty">{children}</div>
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
