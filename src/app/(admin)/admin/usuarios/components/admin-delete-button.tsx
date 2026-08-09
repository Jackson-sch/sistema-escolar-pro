"use client";

import { useTransition } from "react";
import { deleteAdminUserAction } from "@/actions/super-admin";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

interface AdminDeleteButtonProps {
  userId: string;
  userName: string;
}

export function AdminDeleteButton({ userId, userName }: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la cuenta de ${userName}?`)) return;

    startTransition(async () => {
      const res = await deleteAdminUserAction(userId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Usuario eliminado correctamente");
      }
    });
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-[color,background-color,opacity] disabled:opacity-50"
      title="Eliminar usuario"
    >
      <IconTrash className="size-4" />
    </button>
  );
}
