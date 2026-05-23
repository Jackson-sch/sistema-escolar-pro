"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { StudentValues } from "@/lib/schemas/student";
import {
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";
import {
  IconUser,
  IconId,
  IconMail,
  IconCalendar,
} from "@tabler/icons-react";
import { SEXO_OPTIONS } from "@/lib/constants";

interface PersonalInfoFieldsProps {
  form: UseFormReturn<StudentValues>;
  estados: { id: string; nombre: string }[];
  instituciones?: { id: string; nombreInstitucion: string }[];
}

export function PersonalInfoFields({
  form,
  estados,
  instituciones,
}: PersonalInfoFieldsProps) {
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    form.getValues("fechaNacimiento") || new Date(),
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Nombres
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Juan Alberto"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="apellidoPaterno"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Apellido Paterno
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Pérez"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="apellidoMaterno"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Apellido Materno
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="García"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator className="md:col-span-12 my-1" />

      <FormField
        control={form.control}
        name="dni"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              DNI / Documento de Identidad
            </FormLabel>
            <FormControl>
              <div className="relative">
                <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="00000000"
                  className="pl-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                  maxLength={8}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="fechaNacimiento"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Fecha de Nacimiento
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal rounded-full border-border/40 hover:bg-muted/50 transition-all",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      formatDate(field.value, "PPP")
                    ) : (
                      <span>DD / MM / AAAA</span>
                    )}
                    <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(date) => {
                    field.onChange(date);
                    if (date) setCalendarMonth(date);
                  }}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  startMonth={new Date(1900, 0)}
                  endMonth={new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sexo"
        render={({ field }) => (
          <FormItem className="md:col-span-4">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Género / Sexo
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full rounded-full bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SEXO_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
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
        name="nacionalidad"
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Nacionalidad
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="PERUANA"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem className="md:col-span-6">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Correo Electrónico (Opcional)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="pl-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="estadoId"
        render={({ field }) => (
          <FormItem className="md:col-span-3">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Estado de Alumno
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full rounded-full bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {estados.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator
        className={cn(
          "md:col-span-12 my-1",
          (!instituciones || instituciones.length === 1) && "hidden",
        )}
      />

      {instituciones && instituciones.length > 1 && (
        <FormField
          control={form.control}
          name="institucionId"
          render={({ field }) => (
            <FormItem className="md:col-span-12">
              <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                Institución
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                    <SelectValue placeholder="Seleccionar institución" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {instituciones.map((inst) => (
                    <SelectItem key={inst.id} value={inst.id}>
                      {inst.nombreInstitucion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}
