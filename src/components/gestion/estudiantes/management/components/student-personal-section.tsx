"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { IconUser, IconId, IconCalendar, IconMail } from "@tabler/icons-react";
import { StudentValues } from "@/lib/schemas/student";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";
import { SEXO_OPTIONS } from "@/lib/constants";
import { SectionHeader } from "./section-header";

interface StudentPersonalSectionProps {
  form: UseFormReturn<StudentValues>;
  estados: { id: string; nombre: string }[];
  instituciones: { id: string; nombreInstitucion: string }[];
  calendarMonth: Date;
  onCalendarMonthChange: (month: Date) => void;
}

export function StudentPersonalSection({
  form,
  estados,
  instituciones,
  calendarMonth,
  onCalendarMonthChange,
}: StudentPersonalSectionProps) {
  const today = useMemo(() => new Date(), []);
  const minFechaNacimiento = useMemo(() => new Date("1900-01-01"), []);
  const inicioCalendario = useMemo(() => new Date(1900, 0), []);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={IconUser}
        title="1. Información Personal del Estudiante"
        description="Nombres, apellidos, documento de identidad y datos biográficos."
        colorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombres
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Juan Alberto"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Paterno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Pérez"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Materno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="García"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                DNI / Documento Identidad
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconId className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="76543210"
                    maxLength={8}
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Fecha de Nacimiento
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-medium rounded-xl border-border/40 bg-background h-9 text-xs justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {field.value ? (
                        formatDate(field.value, "PPP")
                      ) : (
                        <span>DD / MM / AAAA</span>
                      )}
                      <IconCalendar className="size-4 opacity-50 ml-1" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-border/40 rounded-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      if (date) onCalendarMonthChange(date);
                    }}
                    month={calendarMonth}
                    onMonthChange={onCalendarMonthChange}
                    disabled={(date) =>
                      date > today || date < minFechaNacimiento
                    }
                    startMonth={inicioCalendario}
                    endMonth={today}
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Sexo / Género
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {SEXO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs font-medium">
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nacionalidad
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="PERUANA"
                  className="bg-background border-border/40 rounded-xl text-xs h-9 uppercase"
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
              <FormLabel className="text-xs font-medium text-foreground/80">
                Correo Electrónico (Opcional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="alumno@colegio.edu.pe"
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
          name="estadoId"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Estado de Alumno
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {estados.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-xs font-medium">
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {instituciones.length > 1 && (
          <FormField
            control={form.control}
            name="institucionId"
            render={({ field }) => (
              <FormItem className="md:col-span-12">
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Institución Educativa
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar institución" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-border/40">
                    {instituciones.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id} className="text-xs font-medium">
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
    </div>
  );
}
