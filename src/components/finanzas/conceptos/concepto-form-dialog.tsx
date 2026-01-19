"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormModal } from "@/components/modals/form-modal";
import { upsertConceptoAction } from "@/actions/finance";
import { ConceptoTableType } from "./concepto-columns";

interface ConceptoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  concepto?: ConceptoTableType | null;
  institucionId: string;
}

export function ConceptoFormDialog({
  open,
  onOpenChange,
  concepto,
  institucionId,
}: ConceptoFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const isEditing = !!concepto;

  const form = useForm({
    defaultValues: {
      nombre: concepto?.nombre || "",
      montoSugerido: concepto?.montoSugerido || 0,
      moneda: concepto?.moneda || "PEN",
      activo: concepto?.activo ?? true,
      moraDiaria: concepto?.moraDiaria || 0,
      institucionId,
    },
  });

  // Reset form when concepto changes
  if (open && concepto && form.getValues("nombre") !== concepto.nombre) {
    form.reset({
      nombre: concepto.nombre,
      montoSugerido: concepto.montoSugerido,
      moneda: concepto.moneda,
      activo: concepto.activo,
      moraDiaria: concepto.moraDiaria,
      institucionId,
    });
  }

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertConceptoAction({
        id: concepto?.id,
        values: {
          ...values,
          montoSugerido: Number(values.montoSugerido),
          moraDiaria: Number(values.moraDiaria),
        },
      });
      if (res.success) {
        toast.success(res.success);
        form.reset();
        onOpenChange(false);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <FormModal
      title={isEditing ? "Editar Concepto" : "Nuevo Concepto de Pago"}
      description={
        isEditing
          ? "Modifica los detalles del concepto de pago."
          : "Añade un concepto: Matrícula, Pensión, APAFA, Uniforme..."
      }
      isOpen={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) form.reset();
        onOpenChange(newOpen);
      }}
      className="sm:max-w-md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Concepto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Pensión Marzo 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="montoSugerido"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Sugerido</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-medium">
                        S/
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        className="pl-8"
                        placeholder="350.00"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moneda"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moneda</FormLabel>
                  <FormControl>
                    <Input placeholder="PEN" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="moraDiaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mora Diaria (Monto Fijo)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-medium">
                      S/
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-8"
                      placeholder="1.50"
                      {...field}
                    />
                  </div>
                </FormControl>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Monto extra que se sumará por cada día de retraso tras el
                  vencimiento.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending
              ? "Guardando..."
              : isEditing
              ? "Actualizar Concepto"
              : "Crear Concepto"}
          </Button>
        </form>
      </Form>
    </FormModal>
  );
}
