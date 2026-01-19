"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  IconLoader2,
  IconCheck,
  IconEye,
  IconEyeOff,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/actions/auth";

export function ChangePasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const result = await changePasswordAction(form.newPassword);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Contraseña actualizada correctamente");
        router.push("/portal");
      }
    } catch (error) {
      toast.error("Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Nueva contraseña</Label>
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            placeholder="Mínimo 6 caracteres"
            className="h-12 rounded-xl pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <IconEyeOff className="size-5" />
            ) : (
              <IconEye className="size-5" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Confirmar contraseña</Label>
        <Input
          type={showPassword ? "text" : "password"}
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          placeholder="Repite la contraseña"
          className="h-12 rounded-xl"
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-xl gap-2 font-bold text-base"
      >
        {loading ? (
          <>
            <IconLoader2 className="size-5 animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <IconCheck className="size-5" />
            Guardar y Continuar
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Tu nueva contraseña será requerida para futuros inicios de sesión.
      </p>
    </form>
  );
}
