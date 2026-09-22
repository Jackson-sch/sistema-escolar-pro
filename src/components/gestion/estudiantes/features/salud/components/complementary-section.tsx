"use client";

import { Control } from "react-hook-form";
import { IconFileDescription, IconAlertCircle } from "@tabler/icons-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HealthAndInfoValues } from "@/lib/schemas/student";
import { SectionHeader } from "./health-section-header";

export function ComplementarySection({
  control,
}: {
  control: Control<HealthAndInfoValues>;
}) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={<IconFileDescription className="size-4" />}
        colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="2. Datos Complementarios y Contacto Secundario"
        subtitle="Origen, información personal adicional y teléfono de emergencia secundario."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={control}
          name="paisNacimiento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                País de Nacimiento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lugarNacimiento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Lugar de Nacimiento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ciudad / Departamento"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lenguaMaterna"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Lengua Materna
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="religion"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Religión
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Católica, Evangélica..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="numeroHermanos"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                N° de Hermanos
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Subsección: Contacto de Emergencia Secundario */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 mt-2">
        <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <IconAlertCircle className="size-4 shrink-0" />
          Contacto de Emergencia Secundario
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <FormField
            control={control}
            name="nombreContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-5">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nombres y apellidos"
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="telefonoContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-4">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Teléfono / Celular
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="987 654 321"
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="parentescoContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Parentesco
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Tío, Abuelo..."
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
