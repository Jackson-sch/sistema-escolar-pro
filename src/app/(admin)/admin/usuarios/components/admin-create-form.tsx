"use client";

import { useTransition } from "react";
import { createAdminUserAction } from "@/actions/super-admin";
import { toast } from "sonner";
import { IconUserPlus, IconLoader2 } from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminCreateForm() {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;

    startTransition(async () => {
      const res = await createAdminUserAction(email, name);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Cuenta directiva creada exitosamente.");
        const form = document.getElementById(
          "admin-create-form",
        ) as HTMLFormElement;
        form?.reset();
      }
    });
  };

  return (
    <form id="admin-create-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="admin-name"
          className="text-xs font-bold text-foreground block"
        >
          Nombre Completo
        </label>
        <Input
          id="admin-name"
          name="name"
          required
          placeholder="Ej: Lic. Carlos Mendoza"
          className="h-9 rounded-xl border-border/60 bg-background text-xs"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="admin-email"
          className="text-xs font-bold text-foreground block"
        >
          Correo Institucional
        </label>
        <Input
          id="admin-email"
          name="email"
          type="email"
          required
          placeholder="director@colegio.edu.pe"
          className="h-9 rounded-xl border-border/60 bg-background text-xs"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-10 rounded-xl text-xs font-bold gap-2 bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            <span>Creando cuenta...</span>
          </>
        ) : (
          <>
            <IconUserPlus className="size-4" />
            <span>Crear e Invitar Director</span>
          </>
        )}
      </Button>
    </form>
  );
}
