"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useRef } from "react";
import {
  IconTrophy,
  IconCalendar,
  IconBookmark,
  IconBuildingCommunity,
  IconFileDescription,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  achievementSchema,
  AchievementValues,
} from "@/lib/validations/achievement";
import { createAchievementAction } from "@/actions/achievement";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface AchievementFormProps {
  studentId: string;
  onSuccess?: () => void;
}

export function AchievementForm({
  studentId,
  onSuccess,
}: AchievementFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<AchievementValues>({
    resolver: zodResolver(achievementSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      fecha: new Date(),
      categoria: "ACADEMICO",
      institucion: "",
      adjunto: "",
    },
  });

  const onSubmit = (values: AchievementValues) => {
    startTransition(async () => {
      try {
        const res = await createAchievementAction(studentId, values);
        if (res.success) {
          toast.success(res.success);
          setIsDirty(false);
          onSuccess?.();
        } else {
          toast.error(res.error);
        }
      } catch (error) {
        toast.error("Ocurrió un error al guardar el reconocimiento");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Título del Logro / Reconocimiento
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconTrophy className="absolute left-3 top-2.5 size-4 text-amber-500" />
                  <Input
                    {...field}
                    placeholder="Ej. Primer Puesto en Olimpiada de Matemáticas"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="categoria"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Categoría
                </FormLabel>
                <Select
                  disabled={isPending}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                      <div className="flex items-center gap-2">
                        <IconBookmark className="size-4 text-indigo-500" />
                        <SelectValue placeholder="Seleccionar" />
                      </div>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    <SelectItem value="ACADEMICO" className="text-xs font-medium">Académico</SelectItem>
                    <SelectItem value="DEPORTIVO" className="text-xs font-medium">Deportivo</SelectItem>
                    <SelectItem value="CULTURAL" className="text-xs font-medium">Cultural</SelectItem>
                    <SelectItem value="VALORES" className="text-xs font-medium">Valores & Conducta</SelectItem>
                    <SelectItem value="OTROS" className="text-xs font-medium">Otros Reconocimientos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Fecha de Obtención
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
        </div>

        <FormField
          control={form.control}
          name="institucion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Institución u Organizador
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconBuildingCommunity className="absolute left-3 top-2.5 size-4 text-emerald-500" />
                  <Input
                    {...field}
                    placeholder="Ej. Ministerio de Educación / UGEL"
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
                Descripción o Méritos Destacados (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconFileDescription className="absolute left-3 top-3 size-4 text-muted-foreground/60" />
                  <Textarea
                    {...field}
                    placeholder="Detalles sobre el desempeño destacado del alumno..."
                    className="pl-9 min-h-[90px] bg-background border-border/40 rounded-xl text-xs p-3 resize-none"
                  />
                </div>
              </FormControl>
              <FormMessage />
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
            className="w-full rounded-xl h-10 font-semibold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20 gap-2"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Registrar Logro Destacado</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
