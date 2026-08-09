"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
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
import { useState, useEffect, useRef } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconCalendar, IconClock, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

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
  const router = useRouter();
  const { setIsDirty, setOnSubmit } = useFormModal();

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

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setLoading(true);
    try {
      const res = await upsertEventoAction({
        ...values,
        id,
      });
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        router.refresh();
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombre del Evento
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Ceremonia de Clausura Académica"
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Descripción o Agenda del Evento
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Detalles sobre el desarrollo de la actividad..."
                  {...field}
                  className="min-h-[80px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Fecha Inicio
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-medium bg-background border-border/40 rounded-xl text-xs h-9 justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="size-4 opacity-50 ml-1" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-2xl border-border/40"
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Fecha Fin
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-medium bg-background border-border/40 rounded-xl text-xs h-9 justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="size-4 opacity-50 ml-1" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-2xl border-border/40"
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

        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Hora Inicio
                </FormLabel>
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Hora Fin
                </FormLabel>
                <FormControl>
                  <TimeInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Tipo de Evento
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    <SelectItem value="ACADEMICO" className="text-xs font-medium">Académico</SelectItem>
                    <SelectItem value="DEPORTIVO" className="text-xs font-medium">Deportivo</SelectItem>
                    <SelectItem value="CULTURAL" className="text-xs font-medium">Cultural</SelectItem>
                    <SelectItem value="REUNION" className="text-xs font-medium">Reunión de Padres</SelectItem>
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Ubicación / Aula
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Auditorio Principal"
                    {...field}
                    className="bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botón de Enviar */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{id ? "Actualizar Evento" : "Programar y Publicar"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
