"use client";

import { UseFormReturn } from "react-hook-form";
import { IconCertificate } from "@tabler/icons-react";
import { StaffValues } from "@/lib/schemas/staff";
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
import { ESCALA_MAGISTERIAL_OPTIONS } from "@/lib/constants";
import { StaffSectionHeader } from "./staff-section-header";

interface ProfesionalSectionProps {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
}

export function ProfesionalSection({ form, disabled }: ProfesionalSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <StaffSectionHeader
        icon={IconCertificate}
        title="3. Perfil Profesional Docente"
        description="Especialidad pedagógica, colegiatura y escala magisterial."
        colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Especialidad
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Matemática, Comunicación, etc."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Título / Grado Académico
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Licenciado en Educación"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colegioProfesor"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Colegiatura CPP (Opcional)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="012345"
                  className="bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="escalaMagisterial"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Escala Magisterial
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Escala" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {ESCALA_MAGISTERIAL_OPTIONS.map((option) => (
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
      </div>
    </div>
  );
}
