"use client";

import { UseFormReturn } from "react-hook-form";
import { IconMapPin } from "@tabler/icons-react";
import { StudentValues } from "@/lib/schemas/student";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "./section-header";

interface StudentAddressSectionProps {
  form: UseFormReturn<StudentValues>;
}

export function StudentAddressSection({ form }: StudentAddressSectionProps) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconMapPin}
        title="2. Domicilio y Ubicación Geográfica"
        description="Dirección de residencia, distrito, provincia y departamento."
        colorClass="bg-blue-500/10 border-blue-500/20 text-blue-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem className="md:col-span-12">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Dirección Exacta de Residencia
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Av. Mansiche 123, Urb. San Andrés"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departamento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Departamento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="uppercase bg-background border-border/40 rounded-xl text-xs h-9 font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="provincia"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Provincia
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="uppercase bg-background border-border/40 rounded-xl text-xs h-9 font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="distrito"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Distrito
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="uppercase bg-background border-border/40 rounded-xl text-xs h-9 font-medium"
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
