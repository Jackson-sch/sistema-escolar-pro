"use client";

import { useTransition, useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconCalendar, IconLoader2, IconDeviceFloppy, IconBookmark } from "@tabler/icons-react";

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
import { cn } from "@/lib/utils";
import {
  upsertEvaluacionAction,
  getCapacidadesByCursoAction,
} from "@/actions/evaluations";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface EvaluacionFormProps {
  initialData?: any;
  tipos: any[];
  periodos: any[];
  cursos: any[];
  onSuccess: () => void;
}

export function EvaluacionForm({
  initialData,
  tipos,
  periodos,
  cursos,
  onSuccess,
}: EvaluacionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [capacidades, setCapacidades] = useState<any[]>([]);
  const [loadingCapacidades, setLoadingCapacidades] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm({
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      tipoEvaluacionId: initialData?.tipoEvaluacionId || tipos[0]?.id || "",
      cursoId: initialData?.cursoId || cursos[0]?.id || "",
      periodoId: initialData?.periodoId || periodos[0]?.id || "",
      fecha: initialData?.fecha ? new Date(initialData.fecha) : new Date(),
      peso: initialData?.peso || 20,
      notaMinima: initialData?.notaMinima || 11,
      escalaCalificacion: initialData?.escalaCalificacion || "VIGESIMAL",
      capacidadId: initialData?.capacidadId || "",
      activa: initialData?.activa ?? true,
      recuperable: initialData?.recuperable ?? false,
    },
  });

  const selectedCursoId = form.watch("cursoId");

  useEffect(() => {
    let ignore = false;
    if (selectedCursoId) {
      setLoadingCapacidades(true);
      getCapacidadesByCursoAction({ cursoId: selectedCursoId })
        .then((res) => {
          if (ignore) return;
          if (res.success) setCapacidades(res.success);
        })
        .catch(() => {
          /* sin capacidades */
        })
        .finally(() => {
          if (!ignore) setLoadingCapacidades(false);
        });
    }
    return () => {
      ignore = true;
    };
  }, [selectedCursoId]);

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertEvaluacionAction({ values, id: initialData?.id });
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess();
      }
      if (res.error) toast.error(res.error);
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
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombre de la Evaluación
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej. Examen Parcial - Unidad 2"
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="cursoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Curso
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    {cursos.map((curso: any) => (
                      <SelectItem key={curso.id} value={curso.id} className="text-xs font-medium">
                        {curso.nombre} - {curso.nivelAcademico?.grado?.nombre || ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacidadId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80 flex items-center gap-1.5">
                  Capacidad Vinculada
                  {loadingCapacidades && (
                    <IconLoader2 className="animate-spin size-3 text-indigo-500" />
                  )}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
                      <SelectValue
                        placeholder={
                          loadingCapacidades
                            ? "Cargando..."
                            : "Seleccionar capacidad"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    {capacidades.length > 0 ? (
                      capacidades.map((cap) => (
                        <SelectItem
                          key={cap.id}
                          value={cap.id}
                          className="text-xs font-medium"
                        >
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1">
                            [{cap.competenciaNombre}]
                          </span>
                          {cap.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-xs">
                        Sin capacidades para este curso
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoEvaluacionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Tipo de Evaluación
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id} className="text-xs font-medium">
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="periodoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Periodo Académico
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    {periodos.map((periodo: any) => (
                      <SelectItem key={periodo.id} value={periodo.id} className="text-xs font-medium">
                        {periodo.nombre}
                      </SelectItem>
                    ))}
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
                  Fecha de Evaluación
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
                  <PopoverContent className="w-auto p-0 rounded-2xl border-border/40" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={es}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="peso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Peso (%)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notaMinima"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-foreground/80">
                    Nota Mínima
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      step="0.5"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                      className="bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{initialData ? "Guardar Cambios" : "Crear Evaluación"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
