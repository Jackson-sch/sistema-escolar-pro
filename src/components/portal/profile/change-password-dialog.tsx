"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconLoader2,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePasswordAction } from "@/actions/auth";
import { toast } from "sonner";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const newPassword = watch("newPassword");

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await changePasswordAction(data.newPassword);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Contraseña actualizada correctamente");
        reset();
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
            <IconLock size={24} className="text-primary" />
          </div>
          <DialogTitle className="text-center text-xl font-black">
            Cambiar Contraseña
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Ingresa una nueva contraseña segura para tu cuenta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-xs font-bold uppercase tracking-wider">
              Nueva Contraseña
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                className="pr-10 rounded-xl"
                {...register("newPassword", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "Mínimo 6 caracteres",
                  },
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 hover:scale-105"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </Button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider">
              Confirmar Contraseña
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repite la contraseña"
                className="pr-10 rounded-xl"
                {...register("confirmPassword", {
                  required: "Confirma tu contraseña",
                  validate: (val) =>
                    val === newPassword || "Las contraseñas no coinciden",
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 hover:scale-105"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <IconEyeOff size={16} /> : <IconEye size={16} />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl font-bold hover:scale-105"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl font-bold gap-2 hover:scale-105"
            >
              {isPending ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconCheck size={16} />
              )}
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
