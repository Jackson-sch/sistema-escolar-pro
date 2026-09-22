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
import { useEffect, useRef } from "react";
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
  const { setIsDirty, setOnSubmit } = useFormModal();

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

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Código de Estado</FormLabel>
                <FormControl>
                  <Input
                    placeholder="EJ: ACTIVO"
                    {...field}
                    disabled={!!initialData}
                    className="h-9 text-xs font-mono uppercase rounded-xl border-border/60 bg-background"
                  />
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Nombre Descriptivo</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Activo Regular"
                    {...field}
                    className="h-9 text-xs rounded-xl border-border/60 bg-background"
                  />
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Descripción</FormLabel>
              <FormControl>
                <Input
                  placeholder="Breve descripción del alcance operativo de este estado..."
                  {...field}
                  className="h-9 text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Color Identificador</FormLabel>
                <div className="flex gap-2 items-center">
                  <FormControl>
                    <Input
                      type="color"
                      className="size-9 p-0.5 rounded-xl border-border/60 cursor-pointer bg-background shrink-0"
                      {...field}
                    />
                  </FormControl>
                  <Input
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="flex-1 h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                    placeholder="#3b82f6"
                  />
                </div>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="orden"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">Orden de Prioridad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                    className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                  />
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <FormField
            control={form.control}
            name="permiteLogin"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 space-y-0 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="size-4 rounded-md border-border/60 text-primary cursor-pointer mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="text-xs font-bold text-foreground cursor-pointer">Permitir Acceso</FormLabel>
                  <FormDescription className="text-[11px] text-muted-foreground">
                    Los usuarios con este estado pueden iniciar sesión en el portal.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="esActivo"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3 space-y-0 cursor-pointer">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="size-4 rounded-md border-border/60 text-primary cursor-pointer mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 leading-none">
                  <FormLabel className="text-xs font-bold text-foreground cursor-pointer">Estado Activo</FormLabel>
                  <FormDescription className="text-[11px] text-muted-foreground">
                    Se computa en los filtros de usuarios activos institucionalmente.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
          >
            {loading && <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />}
            {initialData ? "Actualizar Estado" : "Crear Estado"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
