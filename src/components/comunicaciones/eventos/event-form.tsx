"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertEventoAction } from "@/actions/communications";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconCalendar, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";
import { useFormModal } from "@/components/modals/form-modal-context";

const eventSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().optional(),
  fechaInicio: z.date({ message: "Fecha de inicio requerida" }),
  fechaFin: z.date({ message: "Fecha de fin requerida" }),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  ubicacion: z.string().optional(),
  tipo: z.string().min(1, "Seleccione el tipo de evento"),
  modalidad: z.string().optional(),
  publico: z.boolean().default(true),
});

interface EventFormProps {
  onSuccess: () => void;
  initialData?: any;
  id?: string;
}

export function EventForm({ onSuccess, initialData, id }: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const { setIsDirty } = useFormModal();

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      titulo: initialData?.titulo || "",
      descripcion: initialData?.descripcion || "",
      fechaInicio: initialData?.fechaInicio
        ? new Date(initialData.fechaInicio)
        : new Date(),
      fechaFin: initialData?.fechaFin
        ? new Date(initialData.fechaFin)
        : new Date(),
      horaInicio: initialData?.horaInicio || "08:00",
      horaFin: initialData?.horaFin || "10:00",
      ubicacion: initialData?.ubicacion || "",
      tipo: initialData?.tipo || "ACADEMICO",
      modalidad: initialData?.modalidad || "PRESENCIAL",
      publico: initialData?.publico ?? true,
    },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setLoading(true);
    try {
      const res = await upsertEventoAction(
        {
          ...values,
          fechaInicio: values.fechaInicio,
          fechaFin: values.fechaFin,
        },
        id,
      );
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Evento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Ceremonia de Clausura"
                  {...field}
                  className="rounded-full border-border/40 bg-background/50"
                />
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
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles del evento..."
                  {...field}
                  className="min-h-[80px] border-border/40 bg-background/50 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-full border-border/40 bg-background/50 h-10 px-4",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-border/40 bg-background/95 backdrop-blur-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaFin"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal rounded-full border-border/40 bg-background/50 h-10 px-4",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 border-border/40 bg-background/95 backdrop-blur-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date <
                        (form.getValues("fechaInicio") ||
                          new Date("1900-01-01"))
                      }
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Inicio</FormLabel>
                <FormControl>
                  <TimeInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora Fin</FormLabel>
                <FormControl>
                  <TimeInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-full w-full border-border/40 bg-background/50 h-10">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                    <SelectItem value="ACADEMICO">Académico</SelectItem>
                    <SelectItem value="DEPORTIVO">Deportivo</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="REUNION">Reunión</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ubicación / Aula</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Auditorio Principal"
                    {...field}
                    className="rounded-full border-border/40 bg-background/50"
                  />
                </FormControl>
                <FormMessage />
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
            variant="default"
            className="w-full sm:w-auto rounded-full transition-all active:scale-[0.98] px-8"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : id
                ? "Actualizar Evento"
                : "Programar Evento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
