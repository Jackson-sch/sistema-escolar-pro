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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Capacidad</FormLabel>
              <FormControl>
                <div className="relative">
                  <IconCircleCheck className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
                  <Input
                    {...field}
                    placeholder="Ej: Obtiene información..."
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Detalle los indicadores de esta capacidad..."
                  className="resize-none min-h-[100px] rounded-xl"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          disabled={isPending}
          type="submit"
          className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl mt-4"
        >
          {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
          {id ? "Guardar Cambios" : "Añadir Capacidad"}
        </Button>
      </form>
    </Form>
  );
}
