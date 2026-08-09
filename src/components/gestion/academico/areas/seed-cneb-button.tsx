"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { seedCnebTemplateAction } from "@/actions/seed-cneb";
import { toast } from "sonner";
import { useConfirm } from "@/hooks/use-confirm";
import { useRouter } from "next/navigation";

interface SeedCnebButtonProps {
  nivelId?: string;
}

export function SeedCnebButton({ nivelId }: SeedCnebButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm(
    "Cargar Malla Oficial CNEB MINEDU",
    "Esta acción creará automáticamente las Áreas Curriculares Oficiales y sus competencias estándar de acuerdo a la norma del CNEB de Perú. ¿Deseas continuar?",
  );

  const handleSeed = async () => {
    const ok = await confirm();
    if (!ok) return;

    startTransition(async () => {
      const res = await seedCnebTemplateAction({ nivelId });
      if (res.success) {
        toast.success(res.success);
        router.refresh();
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  return (
    <>
      <ConfirmDialog />
      <Button
        variant="outline"
        size="sm"
        onClick={handleSeed}
        disabled={isPending}
        className="rounded-xl h-9 px-3.5 text-xs font-semibold gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors shadow-xs cursor-pointer"
      >
        {isPending ? (
          <IconLoader2 className="size-4 animate-spin" />
        ) : (
          <IconSparkles className="size-4 text-indigo-500" />
        )}
        <span>Cargar Malla CNEB MINEDU</span>
      </Button>
    </>
  );
}
