"use client";

import { useTransition } from "react";
import { deleteInstitucionAction } from "@/actions/super-admin";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

interface InstitucionDeleteButtonProps {
  instId: string;
  instName: string;
}

export function InstitucionDeleteButton({ instId, instName }: InstitucionDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la institución ${instName}? Esta acción no se puede deshacer si tiene datos vinculados.`)) return;

    startTransition(async () => {
      const res = await deleteInstitucionAction(instId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Institución eliminada correctamente");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-[color,background-color,opacity] disabled:opacity-50"
      title="Eliminar institución"
    >
      <IconTrash className="size-4" />
    </button>
  );
}
