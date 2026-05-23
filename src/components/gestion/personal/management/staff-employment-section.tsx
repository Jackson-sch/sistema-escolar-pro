"use client";

import { useEffect, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
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
import { IconBriefcase, IconCalendar } from "@tabler/icons-react";
import { STAFF_ROLE_OPTIONS } from "@/lib/constants";

const ROLE_CARGOS_MAPPING: Record<string, string[]> = {
  profesor: [
    "DOCENTE",
    "AUXILIAR",
    "COORD_ACAD",
    "COORD_NIVEL",
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
  ],
  administrativo: [
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
    "TESORERO",
    "SECRETARIA",
    "PSICOLOGO",
    "ENFERMERIA",
    "SISTEMAS",
    "BIBLIOTECARIO",
    "MANTENIMIENTO",
    "VIGILANCIA",
  ],
};

interface StaffEmploymentSectionProps {
  form: UseFormReturn<StaffValues>;
  cargos: { id: string; nombre: string; codigo: string }[];
  isRootAdmin: boolean;
}

export function StaffEmploymentSection({
  form,
  cargos,
  isRootAdmin,
}: StaffEmploymentSectionProps) {
  const selectedRole = form.watch("role");

  const filteredCargos = useMemo(() => {
    const allowedCodes = ROLE_CARGOS_MAPPING[selectedRole] || [];
    return cargos.filter((c) => allowedCodes.includes(c.codigo));
  }, [cargos, selectedRole]);

  useEffect(() => {
    const currentCargoId = form.getValues("cargoId");
    if (
      currentCargoId &&
      !filteredCargos.some((c) => c.id === currentCargoId)
    ) {
      form.setValue("cargoId", filteredCargos[0]?.id || "");
    }
  }, [selectedRole, filteredCargos, form]);

  return (
    <div className="p-6 rounded-[2rem] border space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
          <IconBriefcase className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Vínculo Laboral
          </h3>
          <p className="text-xxs text-muted-foreground font-medium">
            Asignación y cargo institucional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Rol en el Sistema
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isRootAdmin}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full transition-all px-5">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {STAFF_ROLE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="rounded-xl"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cargoId"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Cargo Específico
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={isRootAdmin}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full transition-all px-5">
                    <SelectValue placeholder="Seleccionar Cargo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {filteredCargos.map((cargo) => (
                    <SelectItem
                      key={cargo.id}
                      value={cargo.id}
                      className="rounded-xl"
                    >
                      {cargo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Área / Departamento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="Ejem: Académica, Administración"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fechaIngreso"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Fecha de Ingreso
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={isRootAdmin}
                      variant="outline"
                      className={cn(
                        "w-full rounded-full transition-all px-5 text-left font-normal",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </span>
                      <IconCalendar className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
