"use client";

import { UseFormReturn } from "react-hook-form";
import { IconBook, IconSettings } from "@tabler/icons-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseValues } from "@/lib/schemas/academic";
import { cn } from "@/lib/utils";

interface CourseFormSectionsProps {
  form: UseFormReturn<CourseValues>;
}

export function CourseGeneralInfoSection({ form }: CourseFormSectionsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <IconBook className="size-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground">
          Información de la Asignatura
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem className="md:col-span-8">
              <FormLabel className="text-xs font-bold text-foreground">
                Nombre del Curso
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ej: Matemática / Razonamiento Matemático"
                  className="h-9 text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="codigo"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-bold text-foreground">
                Código Interno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="MAT-01"
                  className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem className="md:col-span-12">
              <FormLabel className="text-xs font-bold text-foreground">
                Descripción / Sumilla (Opcional)
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder="Breve descripción de los contenidos del curso..."
                  rows={2}
                  className="resize-none text-xs rounded-xl border-border/60 bg-background"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

interface CourseAcademicConfigSectionProps {
  form: UseFormReturn<CourseValues>;
  id?: string;
  areas: any[];
  nivelesAcademicos: any[];
}

export function CourseAcademicConfigSection({
  form,
  id,
  areas,
  nivelesAcademicos,
}: CourseAcademicConfigSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pb-1 border-b border-border/40">
        <IconSettings className="size-4 text-primary" />
        <h3 className="text-xs font-bold text-foreground">
          Configuración y Asignación
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Grados y Secciones */}
        <FormField
          control={form.control}
          name="nivelAcademicoIds"
          render={({ field }) => (
            <FormItem className="md:col-span-12">
              <div className="flex items-center justify-between mb-1">
                <FormLabel className="text-xs font-bold text-foreground">
                  {id
                    ? "Grado y Sección"
                    : "Grados y Secciones donde se Imparte"}
                </FormLabel>
                {!id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (field.value.length === nivelesAcademicos.length) {
                        field.onChange([]);
                      } else {
                        field.onChange(nivelesAcademicos.map((n) => n.id));
                      }
                    }}
                    className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    {field.value.length === nivelesAcademicos.length
                      ? "Deseleccionar Todos"
                      : "Seleccionar Todos"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[160px] overflow-y-auto p-2 border border-border/60 rounded-xl bg-muted/20 custom-scrollbar">
                {nivelesAcademicos.map((n) => {
                  const isChecked = field.value.includes(n.id);
                  const isDisabled = !!id && !isChecked;
                  return (
                    <label
                      key={n.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border text-xs font-medium cursor-pointer transition-all",
                        isChecked
                          ? "bg-primary/10 border-primary/40 text-foreground font-bold shadow-2xs"
                          : "bg-background border-border/50 text-muted-foreground hover:bg-muted/40",
                        isDisabled && "opacity-40 cursor-not-allowed",
                      )}
                    >
                      <input
                        type="checkbox"
                        disabled={isDisabled}
                        checked={isChecked}
                        onChange={(e) => {
                          if (id) return;
                          const newValue = e.target.checked
                            ? [...field.value, n.id]
                            : field.value.filter((v: string) => v !== n.id);
                          field.onChange(newValue);
                        }}
                        className="size-3.5 rounded border-border/60 text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span className="truncate text-[11px]">
                        {n.grado.nombre} &quot;{n.seccion}&quot;
                      </span>
                    </label>
                  );
                })}
              </div>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        {/* Área Curricular */}
        <FormField
          control={form.control}
          name="areaCurricularId"
          render={({ field }) => (
            <FormItem className="md:col-span-12">
              <FormLabel className="text-xs font-bold text-foreground">
                Área Curricular Oficial
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="h-9 text-xs rounded-xl border-border/60 bg-background">
                    <SelectValue placeholder="Seleccionar área curricular..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">
                      {a.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        {/* Horas Semanales */}
        <FormField
          control={form.control}
          name="horasSemanales"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-bold text-foreground">
                Horas Semanales
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        {/* Créditos */}
        <FormField
          control={form.control}
          name="creditos"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-bold text-foreground">
                Créditos Académicos
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        {/* Año Lectivo */}
        <FormField
          control={form.control}
          name="anioAcademico"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-bold text-foreground">
                Año Lectivo
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
