"use client";

import { UseFormReturn } from "react-hook-form";
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
import { IconCertificate } from "@tabler/icons-react";
import { ESCALA_MAGISTERIAL_OPTIONS } from "@/lib/constants";

interface StaffProfessionalProfileProps {
  form: UseFormReturn<StaffValues>;
  isRootAdmin: boolean;
}

export function StaffProfessionalProfile({
  form,
  isRootAdmin,
}: StaffProfessionalProfileProps) {
  return (
    <div className="p-6 rounded-[2rem] border space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
          <IconCertificate className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Perfil Profesional Docente
          </h3>
          <p className="text-xxs text-muted-foreground font-medium">
            Información académica y magisterial
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Especialidad
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="Ejem: Matemática y Física"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Título / Grado Académico
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="Licenciado en Educación"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="colegioProfesor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                N° Colegiatura (CPP)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="000000"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="escalaMagisterial"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Escala Magisterial
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="w-full rounded-full transition-all px-5"
                    disabled={isRootAdmin}
                  >
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl">
                  {ESCALA_MAGISTERIAL_OPTIONS.map((option) => (
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
      </div>
    </div>
  );
}
