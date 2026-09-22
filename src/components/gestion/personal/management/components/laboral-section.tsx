"use client";

import { UseFormReturn } from "react-hook-form";
import { IconBriefcase, IconCalendar } from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StaffValues } from "@/lib/schemas/staff";
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
import { STAFF_ROLE_OPTIONS } from "@/lib/constants";
import { StaffSectionHeader } from "./staff-section-header";

export interface CargoOption {
  id: string;
  nombre: string;
  codigo: string;
}

interface LaboralSectionProps {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
  isPending: boolean;
  cargos: CargoOption[];
  estados: { id: string; nombre: string }[];
}

export function LaboralSection({
  form,
  disabled,
  isPending,
  cargos,
  estados,
}: LaboralSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <StaffSectionHeader
        icon={IconBriefcase}
        title="2. Vínculo Laboral y Cargo"
        description="Asignación de rol en el sistema, cargo específico y área de trabajo."
        colorClass="bg-blue-500/10 border-blue-500/20 text-blue-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Rol en el Sistema
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {STAFF_ROLE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs font-medium"
                    >
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
          name="cargoId"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Cargo Específico
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Cargo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {cargos.map((cargo) => (
                    <SelectItem
                      key={cargo.id}
                      value={cargo.id}
                      className="text-xs font-medium"
                    >
                      {cargo.nombre}
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
          name="area"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Área / Departamento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Académica, Ciencias, etc."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaIngreso"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Fecha de Ingreso
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={disabled || isPending}
                      variant="outline"
                      className={cn(
                        "w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span>
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </span>
                      <IconCalendar className="size-4 opacity-50 shrink-0 ml-1" />
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
          name="estadoId"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Estado del Personal
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar estado" />
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
      </div>
    </div>
  );
}
