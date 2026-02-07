"use client";

import { useTransition } from "react";
import { IconCalendarEvent, IconLoader2 } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { updateCronogramaFechaMasivoAction } from "@/actions/finance";
import { FormModal } from "@/components/modals/form-modal";

interface UpdateDueDateModalProps {
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

export function UpdateDueDateModal({
  isOpen,
  onOpenChange,
  conceptos,
  secciones,
}: UpdateDueDateModalProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm({
    defaultValues: {
      conceptoId: "",
      nuevaFecha: new Date(),
      nivelAcademicoId: "all",
    },
  });

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId,
        nuevaFecha: values.nuevaFecha.toISOString(),
        nivelAcademicoId:
          values.nivelAcademicoId === "all"
            ? undefined
            : values.nivelAcademicoId,
      };

      const res = await updateCronogramaFechaMasivoAction(payload);
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
      title="Cambiar Fecha de Vencimiento"
      description="Actualiza la fecha de vencimiento de todos los cronogramas pendientes de un concepto."
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
            name="nuevaFecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                  Nueva Fecha de Vencimiento
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal rounded-full w-full",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd 'de' MMMM, yyyy", {
                            locale: es,
                          })
                        ) : (
                          <span>Elegir fecha</span>
                        )}
                        <IconCalendarEvent className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 5}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                  Deja en "Toda la institución" para actualizar todas las
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
              disabled={isPending || !form.watch("conceptoId")}
              className="flex-1 rounded-full shadow-lg shadow-primary/20"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Fechas"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
