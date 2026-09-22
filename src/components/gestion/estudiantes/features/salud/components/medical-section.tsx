"use client";

import { Control } from "react-hook-form";
import { IconHeartbeat } from "@tabler/icons-react";
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
import { HealthAndInfoValues } from "@/lib/schemas/student";
import { SectionHeader } from "./health-section-header";

export function MedicalSection({
  control,
}: {
  control: Control<HealthAndInfoValues>;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<IconHeartbeat className="size-4" />}
        colorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Ficha Médica y Condiciones de Salud"
        subtitle="Registro sobre tipo de sangre, alergias, peso, talla y seguros médicos."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={control}
          name="tipoSangre"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Tipo de Sangre
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                    (t) => (
                      <SelectItem key={t} value={t} className="text-xs">
                        {t}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="peso"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Peso (kg)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="talla"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Talla (cm)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="1"
                  placeholder="0"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="seguroMedico"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Seguro Médico / SIS
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="EsSalud / SIS / Privado"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="alergias"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Alergias
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Medicamentos, alimentos, polen..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="restriccionesAlimenticias"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Restricciones Alimenticias
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Sin lactosa, celíaco..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="condicionesMedicas"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Condiciones Médicas
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Asma, Diabetes..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="discapacidades"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Discapacidades
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ninguna / Describir"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="carnetConadis"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Carnet CONADIS
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="N° de carnet"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="centroSaludPreferido"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Centro de Salud Preferido
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Clínica / Hospital de preferencia"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="medicamentos"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Medicamentos Frecuentes
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Medicamentos o tratamiento actual"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
