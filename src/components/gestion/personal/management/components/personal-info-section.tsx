"use client";

import { UseFormReturn } from "react-hook-form";
import {
  IconUser,
  IconId,
  IconMail,
  IconPhone,
  IconMapPin,
} from "@tabler/icons-react";
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
import { SEXO_OPTIONS } from "@/lib/constants";
import { StaffSectionHeader } from "./staff-section-header";

interface PersonalInfoSectionProps {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
}

export function PersonalInfoSection({ form, disabled }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-4">
      <StaffSectionHeader
        icon={IconUser}
        title="1. Información Personal"
        description="Datos de identidad y contacto del colaborador. El acceso al sistema se realiza mediante su email y DNI."
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
                  disabled={disabled}
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
                  disabled={disabled}
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
                  disabled={disabled}
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
                    disabled={disabled}
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
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-5">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Correo Electrónico
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    type="email"
                    placeholder="docente@colegio.edu.pe"
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
          name="sexo"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Sexo / Género
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
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
          name="telefono"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Teléfono / WhatsApp
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="987 654 321"
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
          name="direccion"
          render={({ field }) => (
            <FormItem className="md:col-span-8">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Dirección Domiciliaria
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="Av. España 456, Trujillo"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
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
