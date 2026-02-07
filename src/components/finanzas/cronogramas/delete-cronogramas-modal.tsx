"use client";

import { useTransition } from "react";
import { IconTrash, IconAlertTriangle, IconLoader2 } from "@tabler/icons-react";
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteCronogramaMasivoAction } from "@/actions/finance";
import { FormModal } from "@/components/modals/form-modal";

interface DeleteCronogramasModalProps {
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

export function DeleteCronogramasModal({
  isOpen,
  onOpenChange,
  conceptos,
  secciones,
}: DeleteCronogramasModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      conceptoId: "",
      nivelAcademicoId: "all",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId,
        nivelAcademicoId:
          values.nivelAcademicoId === "all"
            ? undefined
            : values.nivelAcademicoId,
      };

      const res = await deleteCronogramaMasivoAction(payload);
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
      title="Eliminar Cronogramas"
      description="Elimina cronogramas pendientes que no tengan pagos registrados. Esta acción no se puede deshacer."
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
    >
      <div className="flex items-center gap-2 text-destructive mb-4">
        <IconAlertTriangle className="size-5" />
        <span className="text-sm font-semibold uppercase tracking-wider">
          Zona de Peligro
        </span>
      </div>

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
                      <SelectValue placeholder="Seleccionar concepto..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl">
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
                  Alcance (Opcional)
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
                  Deja en "Toda la institución" para eliminar de todas las
                  secciones.
                </FormDescription>
              </FormItem>
            )}
          />

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
              variant="destructive"
              disabled={isPending || !form.watch("conceptoId")}
              className="flex-1 rounded-full shadow-lg shadow-destructive/10"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <IconTrash className="mr-2 h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
