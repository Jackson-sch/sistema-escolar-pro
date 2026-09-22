"use client";

import { UseFormReturn } from "react-hook-form";
import { IconUsers, IconId, IconPhone, IconSparkles } from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/badge";
import { PARENTESCO_OPTIONS } from "@/lib/constants";
import { SectionHeader } from "./section-header";

interface StudentGuardianSectionProps {
  form: UseFormReturn<StudentValues>;
  guardianAutofilled: boolean;
}

export function StudentGuardianSection({
  form,
  guardianAutofilled,
}: StudentGuardianSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconUsers}
        title="3. Datos del Apoderado Principal"
        description="Padre, madre o tutor legal responsable de la matrícula."
        colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        action={
          guardianAutofilled ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold gap-1 rounded-md px-2 py-0.5">
              <IconSparkles className="size-3" />
              Auto-completado por DNI
            </Badge>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="dniApoderado"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                DNI del Apoderado
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconId className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="01234567"
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
          name="nombreApoderado"
          render={({ field }) => (
            <FormItem className="md:col-span-5">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombre Completo del Apoderado
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nombres y apellidos completos"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentescoApoderado"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Parentesco
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
                  {PARENTESCO_OPTIONS.map((option) => (
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
          name="telefonoApoderado"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Teléfono / Celular de Contacto
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="987 654 321"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
