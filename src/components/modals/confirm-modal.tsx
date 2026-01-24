"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle } from "@tabler/icons-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading,
  variant = "danger",
}: ConfirmModalProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-2 rounded-full ${variant === "danger" ? "bg-red-100" : "bg-primary/10"}`}
            >
              <IconAlertTriangle
                className={`size-5 ${variant === "danger" ? "text-red-600" : "text-primary"}`}
              />
            </div>
            <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            disabled={loading}
            variant="outline"
            onClick={onClose}
            className="rounded-full"
          >
            Cancelar
          </Button>
          <Button
            disabled={loading}
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            className="rounded-full"
          >
            {loading
              ? "Procesando..."
              : variant === "danger"
                ? "Eliminar"
                : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
