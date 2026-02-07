"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { upsertUserStateAction } from "@/actions/user-states";
import { IconLoader2 } from "@tabler/icons-react";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

const formSchema = z.object({
  codigo: z.string().min(1, "El código es requerido").toUpperCase(),
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string(),
  color: z.string(),
  permiteLogin: z.boolean(),
  esActivo: z.boolean(),
  orden: z.number(),
});

type EstadoUsuarioFormValues = z.infer<typeof formSchema>;

interface EstadoUsuarioFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export function EstadoUsuarioForm({
  initialData,
  onSuccess,
}: EstadoUsuarioFormProps) {
  const [loading, setLoading] = useState(false);
  const { setIsDirty } = useFormModal();

  const form = useForm<EstadoUsuarioFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      codigo: initialData?.codigo ?? "",
      nombre: initialData?.nombre ?? "",
      descripcion: initialData?.descripcion ?? "",
      color: initialData?.color ?? "#3b82f6",
      permiteLogin: initialData?.permiteLogin ?? true,
      esActivo: initialData?.esActivo ?? true,
      orden: Number(initialData?.orden ?? 0),
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  async function onSubmit(values: EstadoUsuarioFormValues) {
    setLoading(true);
    try {
      const result = await upsertUserStateAction(values, initialData?.id);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setIsDirty(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="EJ: ACTIVO"
                    {...field}
                    disabled={!!initialData}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Activo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Breve descripción del estado" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="color" className="h-10 w-20 p-1" {...field} />
                  </FormControl>
                  <Input
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orden</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <FormField
            control={form.control}
            name="permiteLogin"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Permitir Login</FormLabel>
                  <FormDescription>
                    Los usuarios en este estado pueden iniciar sesión.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="esActivo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Es Activo</FormLabel>
                  <FormDescription>
                    El estado se considera operativamente "activo".
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-full px-8"
          >
            {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Actualizar Estado" : "Crear Estado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
