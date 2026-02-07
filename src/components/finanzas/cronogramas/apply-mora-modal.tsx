"use client";

import { useTransition } from "react";
import {
  IconAlertTriangle,
  IconLoader2,
  IconPercentage,
} from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { applyBulkMoraAction } from "@/actions/finance";
import { FormModal } from "@/components/modals/form-modal";

interface ApplyMoraModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conceptos: { id: string; nombre: string }[];
  secciones: {
    id: string;
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
  }[];
}

export function ApplyMoraModal({
  isOpen,
  onOpenChange,
  conceptos,
  secciones,
}: ApplyMoraModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      conceptoId: "all",
      nivelAcademicoId: "all",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId === "all" ? undefined : values.conceptoId,
        nivelAcademicoId:
          values.nivelAcademicoId === "all"
            ? undefined
            : values.nivelAcademicoId,
      };

      const res = await applyBulkMoraAction(payload);
      if (res.success) {
        toast.success(res.success);
        onOpenChange(false);
      }
      if (res.error) toast.error(res.error);
    });
  };

  return (
    <FormModal
      title="Generación de Mora"
      description="Calcula y aplica el interés diario acumulado a todos los cronogramas que han superado su fecha de vencimiento."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="conceptoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                  Concepto de Pago
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-full w-full">
                      <SelectValue placeholder="Todos los conceptos" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-xl">
                      Todos los conceptos
                    </SelectItem>
                    {conceptos.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={c.id}
                        className="rounded-xl"
                      >
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-[10px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nivelAcademicoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                  Alcance / Sección
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="rounded-full w-full">
                      <SelectValue placeholder="Toda la institución" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all" className="rounded-xl">
                      Toda la institución
                    </SelectItem>
                    {secciones.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                        className="rounded-xl"
                      >
                        {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription className="text-xs ml-1">
                  Puedes filtrar por una sección específica para procesar la
                  mora.
                </FormDescription>
              </FormItem>
            )}
          />

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600">
            <IconAlertTriangle className="size-5 shrink-0" />
            <p className="text-[10px] leading-relaxed font-medium">
              Esta acción actualizará el campo de{" "}
              <strong>mora acumulada</strong> en base a los días de retraso y la
              regla de interés definida en cada concepto.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="flex-1 rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-full shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <IconPercentage className="size-4" />
                  Ejecutar Cálculo
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
