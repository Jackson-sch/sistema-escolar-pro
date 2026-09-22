"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { Switch } from "@/components/ui/switch";
import {
  IconMessageReport,
  IconCalendar,
  IconStethoscope,
  IconNotes,
  IconEye,
  IconPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PsychFormFieldsProps {
  form: UseFormReturn<any>;
}

interface PsychHeaderFieldsProps extends PsychFormFieldsProps {
  categories: any[];
  onOpenCategoryModal: () => void;
}

export function PsychHeaderFields({
  form,
  categories,
  onOpenCategoryModal,
}: PsychHeaderFieldsProps) {
  return (
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
                onClick={onOpenCategoryModal}
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
  );
}

export function PsychContentFields({ form }: PsychFormFieldsProps) {
  return (
    <>
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
    </>
  );
}
