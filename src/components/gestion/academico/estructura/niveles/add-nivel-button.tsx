"use client";

import { useState, useTransition } from "react";
import { IconSchool } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FormModal } from "@/components/modals/form-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { upsertNivelAction } from "@/actions/academic-structure";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre del nivel es requerido"),
  institucionId: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

interface AddNivelButtonProps {
  institucionId: string;
}

export function AddNivelButton({ institucionId }: AddNivelButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setOpen(true)}
              className="h-9 w-9 sm:w-auto sm:px-4 rounded-full"
            >
              <IconSchool className="sm:mr-2 size-4" />
              <span className="hidden sm:inline">Nuevo Nivel</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Registrar Nuevo Nivel Educativo</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <FormModal
        title="Nuevo Nivel Educativo"
        description="Añade una etapa educativa: Inicial, Primaria, Secundaria..."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-xs"
      >
        <NivelForm
          institucionId={institucionId}
          onSuccess={() => setOpen(false)}
        />
      </FormModal>
    </>
  );
}

function NivelForm({
  institucionId,
  onSuccess,
}: {
  institucionId: string;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: "",
      institucionId,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formattedValues = {
        ...values,
        nombre: values.nombre.toUpperCase().trim(),
      };
      const res = await upsertNivelAction(formattedValues);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        form.reset();
        onSuccess();
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField<FormValues>
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Nivel</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: SECUNDARIA"
                  {...field}
                  className="rounded-full placeholder:text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-full px-8"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : "Crear Nivel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
