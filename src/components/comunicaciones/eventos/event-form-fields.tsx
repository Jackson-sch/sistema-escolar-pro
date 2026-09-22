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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { TimeInput } from "@/components/ui/time-input";

interface EventFormFieldsProps {
  form: UseFormReturn<any>;
}

export function EventDateFields({ form }: EventFormFieldsProps) {
  return (
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
                    (form.getValues("fechaInicio") || new Date("1900-01-01"))
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
  );
}

export function EventTimeAndDetailsFields({ form }: EventFormFieldsProps) {
  return (
    <>
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
                  <SelectItem value="ACADEMICO" className="text-xs font-medium">
                    Académico
                  </SelectItem>
                  <SelectItem value="DEPORTIVO" className="text-xs font-medium">
                    Deportivo
                  </SelectItem>
                  <SelectItem value="CULTURAL" className="text-xs font-medium">
                    Cultural
                  </SelectItem>
                  <SelectItem value="REUNION" className="text-xs font-medium">
                    Reunión de Padres
                  </SelectItem>
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
    </>
  );
}
