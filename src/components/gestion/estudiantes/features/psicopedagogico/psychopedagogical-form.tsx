"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useState, useRef } from "react";
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
  IconPlus,
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
import { FormModal } from "@/components/modals/form-modal";
import { CategoryForm } from "./category-form";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

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

  const loadCategories = async () => {
    const res = await getIncidentCategoriesAction({});
    if (res.success) setCategories(res.success);
  };

  useEffect(() => {
    let ignore = false;
    getIncidentCategoriesAction({}).then((res) => {
      if (ignore) return;
      if (res.success) setCategories(res.success);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const onSubmit = (values: PsychValues) => {
    startTransition(async () => {
      const res = await upsertPsychopedagogicalAction({ values, id: initialData?.id });
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess?.();
      }
    });
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <FormField
              control={form.control}
              name="fecha"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Fecha del Registro
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-xs font-medium text-foreground/80">
                      Tipo / Categoría
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 px-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 font-semibold rounded-md gap-1"
                      onClick={() => setShowCategoryModal(true)}
                    >
                      <IconPlus className="size-3" /> Nueva
                    </Button>
                  </div>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40">
                      {categories.length > 0 ? (
                        categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-xs font-medium">
                            {cat.nombre}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled className="text-xs">
                          Sin categorías registradas
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Motivo / Título de la Incidencia
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconMessageReport className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                    <Input
                      {...field}
                      placeholder="Ej. Seguimiento conductual en aula"
                      className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Descripción del Incidente / Sesión
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconNotes className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                    <Textarea
                      {...field}
                      placeholder="Describa detalladamente los hechos u observaciones..."
                      className="pl-9 min-h-[90px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
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
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Recomendaciones / Acuerdos
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconStethoscope className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                    <Textarea
                      {...field}
                      placeholder="Pautas o acuerdos de compromiso asumidos..."
                      className="pl-9 min-h-[70px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="visibleParaPadres"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-indigo-500/10 border-indigo-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold flex items-center gap-1.5",
                        field.value
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-foreground",
                      )}
                    >
                      <IconEye className="size-4" />
                      Visible para los Apoderados
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Permite que los padres consulten esta observación en su portal.
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </label>
              </FormItem>
            )}
          />

          {/* Guía de Atajos de Teclado */}
          <FormKeyboardHelpBar />

          {/* Botón de Enviar */}
          <div className="pt-2">
            <Button
              disabled={isPending}
              type="submit"
              className="w-full rounded-xl h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" />
                  <span>{initialData ? "Guardar Cambios" : "Registrar Incidencia / Informe"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <FormModal
        title="Nueva Categoría"
        description="Agregue una nueva categoría para los registros psicopedagógicos."
        isOpen={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        className="sm:max-w-md"
      >
        <CategoryForm
          onSuccess={(category) => {
            setShowCategoryModal(false);
            loadCategories();
            form.setValue("categoriaId", category.id);
          }}
        />
      </FormModal>
    </>
  );
}
