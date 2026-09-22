"use client";

import { useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconLoader2, IconDeviceFloppy, IconCheck } from "@tabler/icons-react";

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
import { Switch } from "@/components/ui/switch";
import { FormModal } from "@/components/modals/form-modal";
import { upsertConceptoAction } from "@/actions/finance";
import { ConceptoTableType } from "./concepto-columns";
import { useFormModal } from "@/components/modals/form-modal-context";

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
  const isEditing = !!concepto;

  return (
    <FormModal
      title={isEditing ? "Editar Concepto" : "Nuevo Concepto de Pago"}
      description={
        isEditing
          ? "Modifica los detalles, tarifa o estado del concepto."
          : "Añade un concepto: Matrícula, Pensión, APAFA, Uniforme..."
      }
      isOpen={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <ConceptoFormContent
        concepto={concepto}
        institucionId={institucionId}
        onSuccess={() => onOpenChange(false)}
      />
    </FormModal>
  );
}

function ConceptoFormContent({
  concepto,
  institucionId,
  onSuccess,
}: {
  concepto?: ConceptoTableType | null;
  institucionId: string;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm({
    defaultValues: {
      nombre: concepto?.nombre || "",
      montoSugerido: concepto?.montoSugerido || 0,
      moneda: concepto?.moneda || "PEN",
      activo: concepto?.activo ?? true,
      moraDiaria: concepto?.moraDiaria || 0,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  // Reset form when concepto changes
  useEffect(() => {
    if (concepto) {
      form.reset({
        nombre: concepto.nombre,
        montoSugerido: concepto.montoSugerido,
        moneda: concepto.moneda || "PEN",
        activo: concepto.activo ?? true,
        moraDiaria: concepto.moraDiaria || 0,
      });
    } else {
      form.reset({
        nombre: "",
        montoSugerido: 0,
        moneda: "PEN",
        activo: true,
        moraDiaria: 0,
      });
    }
  }, [concepto, form]);

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertConceptoAction({
        id: concepto?.id,
        values: {
          nombre: values.nombre,
          descripcion: values.descripcion || undefined,
          montoSugerido: Number(values.montoSugerido || 0),
          moraDiaria: Number(values.moraDiaria || 0),
          moneda: values.moneda || "PEN",
          activo: values.activo ?? true,
        },
      });
      if (res.success) {
        toast.success(res.success as string);
        form.reset();
        setIsDirty(false);
        router.refresh();
        onSuccess();
      }
      if (res.error) toast.error(res.error);
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
              <FormLabel className="text-xs font-bold text-foreground">
                Nombre del Concepto
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Pensión Mensual / Matrícula Ordinaria"
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
            name="montoSugerido"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">
                  Monto Sugerido
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                      S/
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      className="pl-8 h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                      placeholder="350.00"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="moneda"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">
                  Moneda
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="PEN"
                    {...field}
                    className="h-9 text-xs font-mono uppercase rounded-xl border-border/60 bg-background"
                  />
                </FormControl>
                <FormMessage className="text-xxs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="moraDiaria"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-bold text-foreground">
                Mora Diaria (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">
                    S/
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    className="pl-8 h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                    placeholder="1.50"
                    {...field}
                  />
                </div>
              </FormControl>
              <p className="text-[11px] text-muted-foreground mt-1">
                Recargo fijo que se sumará por cada día de retraso tras la fecha de vencimiento.
              </p>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        {/* Interruptor de Estado (Activo / Inactivo) */}
        <FormField
          control={form.control}
          name="activo"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between p-3.5 rounded-xl border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <FormLabel className="text-xs font-bold text-foreground cursor-pointer">
                  Estado del Concepto
                </FormLabel>
                <p className="text-[11px] text-muted-foreground">
                  {field.value
                    ? "Activo (Disponible para cronogramas y cobro en caja)"
                    : "Inactivo (Oculto para nuevos cobros)"}
                </p>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="cursor-pointer"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-3.5 animate-spin mr-1.5" />
                Guardando...
              </>
            ) : concepto ? (
              <>
                <IconDeviceFloppy className="size-3.5 mr-1.5" />
                Actualizar Concepto
              </>
            ) : (
              <>
                <IconCheck className="size-3.5 mr-1.5" />
                Crear Concepto
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
