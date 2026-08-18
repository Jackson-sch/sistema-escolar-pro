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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { upsertGradoAction } from "@/actions/academic-structure";

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  orden: z.string().min(1, "El orden es requerido"),
  nivelId: z.string().min(1, "Debe seleccionar un nivel"),
});

type FormValues = z.infer<typeof formSchema>;

export function GradoForm({
  niveles,
  initialData,
  onSuccess,
}: {
  niveles: { id: string; nombre: string }[];
  initialData?: any;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: initialData?.nombre ?? "",
      codigo: initialData?.codigo ?? "",
      orden: initialData?.orden != null ? String(initialData.orden) : "1",
      nivelId: initialData?.nivelId ?? "",
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
        codigo: values.codigo.toUpperCase().trim(),
        orden: parseInt(values.orden, 10),
      };

      const res = await upsertGradoAction(formattedValues, initialData?.id);
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
          name="nivelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nivel</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel.id} value={nivel.id}>
                      {nivel.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField<FormValues>
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 3ero"
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<FormValues>
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: G3-SEC"
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField<FormValues>
          control={form.control}
          name="orden"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Orden</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-full"
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
            {isPending ? "Guardando..." : initialData ? "Guardar Cambios" : "Crear Grado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

