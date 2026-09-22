"use client";

import { UseFormReturn } from "react-hook-form";
import { IconChecklist, IconDiscount2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { EnrollmentValues } from "@/lib/schemas/enrollment";
import { EnrollmentSectionHeader } from "./enrollment-section-header";

interface BenefitsConditionSectionProps {
  form: UseFormReturn<EnrollmentValues>;
}

export function BenefitsConditionSection({
  form,
}: BenefitsConditionSectionProps) {
  const tipoBeca = form.watch("tipoBeca");

  return (
    <div className="space-y-4 pt-2">
      <EnrollmentSectionHeader
        icon={IconChecklist}
        iconClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="3. Beneficios y Condición del Alumno"
        description="Configuración de ingreso, repitencia y asignación de becas."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Condición Académica */}
        <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
          <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">
            Condición del Alumno
          </h4>

          <FormField
            control={form.control}
            name="esPrimeraVez"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      Nuevo Ingreso
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Primer año en la institución
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </label>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="esRepitente"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground",
                      )}
                    >
                      Repitencia
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Cursando el grado nuevamente
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </label>
              </FormItem>
            )}
          />
        </div>

        {/* Becas y Descuentos */}
        <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
          <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
            <IconDiscount2 className="size-4 text-pink-500" />
            Becas y Beneficios
          </h4>

          <FormField
            control={form.control}
            name="tipoBeca"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Tipo de Beca
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full rounded-xl border-border/40 bg-background font-medium text-xs">
                      <SelectValue placeholder="Seleccione beca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 rounded-xl">
                    <SelectItem value="ninguna" className="text-xs font-medium">
                      Sin Beca
                    </SelectItem>
                    <SelectItem
                      value="socioeconomica"
                      className="text-xs font-medium"
                    >
                      Socioeconómica (20%)
                    </SelectItem>
                    <SelectItem
                      value="excelencia"
                      className="text-xs font-medium"
                    >
                      Excelencia Académica (50%)
                    </SelectItem>
                    <SelectItem
                      value="deportiva"
                      className="text-xs font-medium"
                    >
                      Talento Deportivo (30%)
                    </SelectItem>
                    <SelectItem
                      value="hermandad"
                      className="text-xs font-medium"
                    >
                      Hermandad (15%)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoBeca !== "ninguna" && (
            <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                  Descuento Aplicado
                </span>
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                  {tipoBeca === "socioeconomica"
                    ? "20%"
                    : tipoBeca === "excelencia"
                      ? "50%"
                      : tipoBeca === "deportiva"
                        ? "30%"
                        : "15%"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground/80">
              Observaciones Adicionales (Opcional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas o comentarios sobre el proceso de matrícula..."
                className="min-h-[60px] resize-none border-border/40 bg-background p-3 text-xs rounded-xl"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
