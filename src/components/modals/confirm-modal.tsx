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
import { IconAlertTriangle, IconStar, IconInfoCircle, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  loading?: boolean;
  variant?: "danger" | "warning" | "primary";
  confirmText?: string;
  cancelText?: string;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

function useIsMounted() {
  return React.useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  loading,
  variant = "danger",
  confirmText,
  cancelText = "Cancelar",
}: ConfirmModalProps) {
  const isMounted = useIsMounted();

  if (!isMounted) {
    return null;
  }

  const shineColors =
    variant === "danger"
      ? ["#ef4444", "#f87171", "#dc2626"]
      : variant === "warning"
      ? ["#f59e0b", "#fbbf24", "#d97706"]
      : ["#6366f1", "#818cf8", "#4f46e5"];

  const defaultConfirmText =
    confirmText || (variant === "danger" ? "Eliminar" : "Confirmar");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-card border-border/50 rounded-2xl overflow-hidden shadow-sm p-5">
        
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2.5 rounded-xl flex items-center justify-center shrink-0",
                variant === "danger" && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
                variant === "warning" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
                variant === "primary" && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
              )}
            >
              {variant === "warning" ? (
                <IconStar className="size-5 fill-amber-500" />
              ) : variant === "danger" ? (
                <IconAlertTriangle className="size-5" />
              ) : (
                <IconInfoCircle className="size-5" />
              )}
            </div>
            <DialogTitle className="text-base font-bold text-foreground">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-normal text-muted-foreground/80 leading-relaxed pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2.5 pt-4 border-t border-border/30 mt-3">
          <Button
            disabled={loading}
            variant="outline"
            onClick={onClose}
            className="rounded-xl h-9 px-4 text-xs font-semibold border-border/40 cursor-pointer"
          >
            {cancelText}
          </Button>
          <Button
            disabled={loading}
            onClick={onConfirm}
            className={cn(
              "rounded-xl h-9 px-5 text-xs font-semibold shadow-md gap-1.5 cursor-pointer min-w-[110px]",
              variant === "danger" && "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20",
              variant === "warning" && "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20",
              variant === "primary" && "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20"
            )}
          >
            {loading ? (
              <>
                <IconLoader2 className="size-3.5 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{defaultConfirmText}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
