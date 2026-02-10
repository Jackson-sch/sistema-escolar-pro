"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  IconBook,
  IconSettings,
  IconLoader2,
  IconPlus,
  IconUserCircle,
  IconSchool,
  IconLayoutGrid,
} from "@tabler/icons-react";

import { CourseSchema, CourseValues } from "@/lib/schemas/academic";
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
import { upsertCourseAction } from "@/actions/academic";
import { toast } from "sonner";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

interface CourseFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  areas: any[];
  nivelesAcademicos: any[];
  profesores: any[];
}

export function CourseForm({
  id,
  initialData,
  onSuccess,
  areas,
  nivelesAcademicos,
  profesores,
}: CourseFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<CourseValues>({
    resolver: zodResolver(CourseSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          descripcion: initialData.descripcion || "",
          horasSemanales: Number(initialData.horasSemanales),
          creditos: Number(initialData.creditos || 0),
          nivelAcademicoIds: [initialData.nivelAcademicoId],
        }
      : {
          nombre: "",
          codigo: "",
          descripcion: "",
          anioAcademico: new Date().getFullYear(),
          horasSemanales: 2,
          creditos: 0,
          areaCurricularId: "",
          nivelAcademicoIds: [],
          profesorId: undefined,
          activo: true,
        },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = (values: CourseValues) => {
    startTransition(() => {
      upsertCourseAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          onSuccess?.();
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <IconBook className="size-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Información General
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Datos básicos de identificación del curso en el sistema.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="md:col-span-8">
                  <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Nombre de la Asignatura
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ej: Matemática Avanzada"
                      className="bg-muted/20 border-white/5 rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Código Interno
                    </FormLabel>
                    <div className="size-3 text-muted-foreground/50 border border-current rounded-full flex items-center justify-center text-[8px] font-bold">
                      i
                    </div>
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MAT-01"
                      className="bg-muted/20 border-white/5 rounded-full"
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
                <FormItem className="md:col-span-12">
                  <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Descripción (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Breve descripción de los contenidos del curso..."
                      className="bg-muted/20 border-white/5 resize-none min-h-[70px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN 2: CONFIGURACIÓN ACADÉMICA */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <IconSettings className="size-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Configuración Académica
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Selección de grados, secciones y carga horaria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Grados y Secciones */}
            <FormField
              control={form.control}
              name="nivelAcademicoIds"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <div className="flex items-center justify-between mb-2">
                    <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      {id
                        ? "Grado y Sección"
                        : "Grados y Secciones Disponibles"}
                    </FormLabel>
                    {!id && (
                      <div className="flex items-center space-x-2 px-2 py-1 rounded-full hover:bg-white/5 transition-colors cursor-pointer group">
                        <input
                          type="checkbox"
                          id="select-all-levels"
                          checked={
                            field.value.length === nivelesAcademicos.length &&
                            nivelesAcademicos.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              field.onChange(
                                nivelesAcademicos.map((n) => n.id),
                              );
                            } else {
                              field.onChange([]);
                            }
                          }}
                          className="size-3.5 p-2 rounded border-white/10 bg-muted/20 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <label
                          htmlFor="select-all-levels"
                          className="text-[10px] p-2 rounded-full text-muted-foreground font-bold uppercase tracking-wider cursor-pointer select-none group-hover:text-foreground transition-colors"
                        >
                          Seleccionar Todos
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 max-h-[200px] overflow-y-auto p-2 border border-white/5 rounded-xl bg-muted/10">
                    {nivelesAcademicos.map((n) => {
                      const isDisabled = !!id && !field.value.includes(n.id);
                      return (
                        <div
                          key={n.id}
                          className={`flex items-center space-x-2 p-2 rounded-lg transition-all ${
                            isDisabled
                              ? "opacity-40 grayscale"
                              : "hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer"
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`nivel-${n.id}`}
                            value={n.id}
                            disabled={isDisabled}
                            checked={field.value.includes(n.id)}
                            onChange={(e) => {
                              if (id) return; // Prevent change if editing
                              const newValue = e.target.checked
                                ? [...field.value, n.id]
                                : field.value.filter((v: string) => v !== n.id);
                              field.onChange(newValue);
                            }}
                            className="size-4 rounded border-white/10 bg-muted/20 text-primary focus:ring-primary/20 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <label
                            htmlFor={`nivel-${n.id}`}
                            className="text-xs text-muted-foreground font-medium cursor-pointer disabled:cursor-not-allowed"
                          >
                            {n.nivel.nombre} - {n.grado.nombre} "{n.seccion}"
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Área Curricular */}
            <FormField
              control={form.control}
              name="areaCurricularId"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Área Curricular
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-muted/20 border-white/5 flex items-center gap-2 rounded-full w-full">
                        <IconLayoutGrid className="size-4 text-muted-foreground" />
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Datos numéricos */}
            <div className="grid grid-cols-3 gap-4 md:col-span-12 mt-2">
              <FormField
                control={form.control}
                name="horasSemanales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Horas Semanales
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-muted/20 border-white/5 text-center rounded-full"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Créditos
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-muted/20 border-white/5 text-center rounded-full"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anioAcademico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                      Año Lectivo
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        className="bg-muted/20 border-white/5 text-center rounded-full"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="w-full sm:w-auto rounded-full px-8"
          >
            {isPending ? (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <IconPlus className="mr-2 h-4 w-4" />
            )}
            {isPending
              ? "Guardando..."
              : id
                ? "Guardar Cambios"
                : "Crear Curso(s)"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
