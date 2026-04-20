"use client";

import { useTransition } from "react";
import { createAdminUserAction } from "@/actions/super-admin";
import { toast } from "sonner";
import { IconUserPlus } from "@tabler/icons-react";

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
        toast.success("Administrador creado exitosamente");
        const form = document.getElementById("admin-create-form") as HTMLFormElement;
        form?.reset();
      }
    });
  };

  return (
    <form id="admin-create-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre Completo</label>
        <input 
          name="name"
          required
          placeholder="Ej: Juan Pérez"
          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700" 
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Correo Electrónico</label>
        <input 
          name="email"
          type="email"
          required
          placeholder="director@colegio.edu.pe"
          className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700" 
        />
      </div>
      
      <button 
        type="submit"
        disabled={isPending}
        className="w-full py-3 bg-zinc-100 text-zinc-950 rounded-xl text-sm font-bold hover:bg-white active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
      >
        {isPending ? (
          "Procesando..."
        ) : (
          <>
            <IconUserPlus className="size-4" />
            Crear Director
          </>
        )}
      </button>
    </form>
  )
}
