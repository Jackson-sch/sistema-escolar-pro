"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { IconLoader2, IconCircleCheck } from "@tabler/icons-react";
import { toast } from "sonner";

import { CapacitySchema, CapacityValues } from "@/lib/schemas/competencies";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { upsertCapacityAction } from "@/actions/competencies";

interface CapacityFormProps {
  id?: string;
  competenciaId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function CapacityForm({
  id,
  competenciaId,
  initialData,
  onSuccess,
}: CapacityFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CapacityValues>({
    resolver: zodResolver(CapacitySchema),
    defaultValues: initialData
      ? {
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          competenciaId: initialData.competenciaId || competenciaId,
        }
      : {
          nombre: "",
          descripcion: "",
          competenciaId: competenciaId,
        },
  });

  const onSubmit = (values: CapacityValues) => {
    startTransition(() => {
      upsertCapacityAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          onSuccess?.();
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Nombre de la Capacidad</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconCircleCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600" />
                  <Input
                    {...field}
                    placeholder="Ej: Obtiene información del texto escrito"
                    className="pl-9 h-9 text-xs rounded-xl border-border/60 bg-background"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">Descripción / Indicadores de Logro (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Detalle los indicadores o desempeños de esta capacidad..."
                  rows={3}
                  className="resize-none text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          {onSuccess && (
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
              disabled={isPending}
            >
              Cancelar
            </Button>
          )}
          <Button
            disabled={isPending}
            type="submit"
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
          >
            {isPending && <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />}
            {id ? "Guardar Cambios" : "Añadir Capacidad"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
