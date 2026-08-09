"use client";

import { useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertNivelAction } from "@/actions/academic-structure";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre del nivel es requerido"),
  institucionId: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

export function NivelForm({
  institucionId,
  initialData,
  onSuccess,
}: {
  institucionId: string;
  initialData?: any;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData 
      ? {
          nombre: initialData.nombre,
          institucionId: initialData.institucionId,
        }
      : {
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
      const res = await upsertNivelAction(formattedValues, initialData?.id);
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
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50 hover:scale-105"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-full px-8 hover:scale-105"
            disabled={isPending}
          >
            {isPending ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Nivel"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

