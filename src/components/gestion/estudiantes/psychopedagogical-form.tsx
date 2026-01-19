"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useState } from "react";
import {
  IconMessageReport,
  IconCalendar,
  IconCategory,
  IconCheck,
  IconLoader2,
  IconDeviceFloppy,
  IconStethoscope,
  IconNotes,
  IconEye,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  upsertPsychopedagogicalAction,
  getIncidentCategoriesAction,
} from "@/actions/discipline";
import { Switch } from "@/components/ui/switch";

const psychSchema = z.object({
  estudianteId: z.string().min(1, "Estudiante es requerido"),
  categoriaId: z.string().min(1, "Seleccione una categoría"),
  motivo: z.string().min(5, "Motivo debe tener al menos 5 caracteres"),
  descripcion: z.string().min(10, "Descripción detallada es requerida"),
  recomendaciones: z.string().optional(),
  fecha: z.date(),
  visibleParaPadres: z.boolean(),
});

type PsychValues = z.infer<typeof psychSchema>;

interface PsychopedagogicalFormProps {
  studentId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function PsychopedagogicalForm({
  studentId,
  initialData,
  onSuccess,
}: PsychopedagogicalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<any[]>([]);

  const form = useForm<PsychValues>({
    resolver: zodResolver(psychSchema),
    defaultValues: {
      estudianteId: studentId,
      categoriaId: initialData?.categoriaId || "",
      motivo: initialData?.motivo || "",
      descripcion: initialData?.descripcion || "",
      recomendaciones: initialData?.recomendaciones || "",
      fecha: initialData?.fecha ? new Date(initialData.fecha) : new Date(),
      visibleParaPadres: initialData?.visibleParaPadres || false,
    },
  });

  useEffect(() => {
    const loadCategories = async () => {
      const res = await getIncidentCategoriesAction();
      if (res.data) setCategories(res.data);
    };
    loadCategories();
  }, []);

  const onSubmit = (values: PsychValues) => {
    startTransition(async () => {
      const res = await upsertPsychopedagogicalAction(values, initialData?.id);
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        onSuccess?.();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                  Fecha del Evento
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal h-11 bg-muted/5 border-border/40 rounded-xl",
                          !field.value && "text-muted-foreground"
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
                    className="w-auto p-0 rounded-xl border-border/40"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
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

          <FormField
            control={form.control}
            name="categoriaId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                  Tipo de Registro
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 bg-muted/5 border-border/40 rounded-xl">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No hay categorías
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="motivo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                Motivo / Título
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMessageReport className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    placeholder="Ej. Seguimiento conductual"
                    className="pl-10 h-11 bg-muted/5 border-border/40 rounded-xl"
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
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                Descripción del Incidente / Sesión
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconNotes className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    {...field}
                    placeholder="Detalle lo ocurrido o lo conversado en la sesión..."
                    className="pl-10 min-h-32 bg-muted/5 border-border/40 rounded-xl resize-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="recomendaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/70 ml-1">
                Recomendaciones / Acuerdos
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconStethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    {...field}
                    placeholder="Acciones a seguir o acuerdos rectificativos..."
                    className="pl-10 min-h-24 bg-muted/5 border-border/40 rounded-xl resize-none"
                  />
                </div>
              </FormControl>
              <FormDescription className="text-[10px] ml-1">
                Opcional. Ayuda al seguimiento preventivo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="visibleParaPadres"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/40 p-4 bg-muted/5 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel className="text-sm font-semibold flex items-center gap-2">
                  <IconEye className="size-4 text-primary" />
                  Visible para los padres
                </FormLabel>
                <FormDescription className="text-xs">
                  Si se activa, el padre/tutor podrá ver este registro en su
                  portal.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button
          disabled={isPending}
          type="submit"
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/20 rounded-xl"
        >
          {isPending ? (
            <IconLoader2 className="animate-spin" />
          ) : (
            <>
              <IconDeviceFloppy className="mr-2" /> Guardar Registro
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
