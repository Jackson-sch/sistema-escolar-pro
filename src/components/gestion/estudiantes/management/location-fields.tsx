"use client";

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

interface LocationFieldsProps {
  form: UseFormReturn<StudentValues>;
}

export function LocationFields({ form }: LocationFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <FormField
        control={form.control}
        name="direccion"
        render={({ field }) => (
          <FormItem className="md:col-span-12">
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Dirección Exacta de Residencia
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Av. Principal 123, Depto 404"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
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
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Departamento
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
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
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Provincia
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
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
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Distrito
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
