"use client";

import { useEffect } from "react";
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
import { IconId } from "@tabler/icons-react";
import { toast } from "sonner";
import { getGuardianByDniAction } from "@/actions/students";
import { PARENTESCO_OPTIONS } from "@/lib/constants";

interface GuardianFieldsProps {
  form: UseFormReturn<StudentValues>;
}

export function GuardianFields({ form }: GuardianFieldsProps) {
  const dniApoderado = form.watch("dniApoderado");

  useEffect(() => {
    if (dniApoderado && dniApoderado.length === 8) {
      const searchGuardian = async () => {
        try {
          const res = await getGuardianByDniAction(dniApoderado);
          if (res?.data) {
            const fullName = `${res.data.name} ${res.data.apellidoPaterno} ${res.data.apellidoMaterno}`;
            form.setValue("nombreApoderado", fullName, {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("telefonoApoderado", res.data.telefono || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            toast.success(
              "Apoderado encontrado, datos cargados automáticamente.",
            );
          }
        } catch (error) {
          console.error("Error searching guardian:", error);
        }
      };
      searchGuardian();
    } else if (!dniApoderado) {
      form.setValue("nombreApoderado", "");
      form.setValue("telefonoApoderado", "");
    }
  }, [dniApoderado, form]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="dniApoderado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              DNI del Apoderado
            </FormLabel>
            <FormControl>
              <div className="relative">
                <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  placeholder="DNI"
                  maxLength={8}
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
        name="nombreApoderado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Nombre Completo Apoderado
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Nombre y apellidos"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="telefonoApoderado"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Teléfono / WhatsApp
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="999 999 999"
                className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
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
          <FormItem>
            <FormLabel className="text-micro font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              Parentesco con el Alumno
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
                {PARENTESCO_OPTIONS.map((option) => (
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
    </div>
  );
}
