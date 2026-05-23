"use client";

import {
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { IconCheck } from "@tabler/icons-react";
import { UseFormReturn } from "react-hook-form";
import { EnrollmentValues } from "@/lib/schemas/enrollment";

interface EnrollmentConditionsProps {
  form: UseFormReturn<EnrollmentValues>;
}

export function EnrollmentConditions({
  form,
}: EnrollmentConditionsProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-emerald-500/5 via-transparent to-transparent p-4 transition-all hover:border-emerald-500/10">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
          <IconCheck className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold tracking-widest text-foreground/90">
            Condición
          </h3>
          <p className="text-xs text-muted-foreground">
            Estado académico del alumno
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <FormField
          control={form.control}
          name="esPrimeraVez"
          render={({ field }) => (
            <FormItem>
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                  field.value
                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_-12px_rgba(16,185,129,0.5)]"
                    : "bg-black/20 border-white/5 hover:bg-black/40",
                )}
              >
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      field.value
                        ? "text-emerald-400"
                        : "text-foreground",
                    )}
                  >
                    Nuevo Ingreso
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Primer año en la institución
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-emerald-500"
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
                  "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                  field.value
                    ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_-12px_rgba(245,158,11,0.5)]"
                    : "bg-black/20 border-white/5 hover:bg-black/40",
                )}
              >
                <div className="space-y-1">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      field.value
                        ? "text-amber-400"
                        : "text-foreground",
                    )}
                  >
                    Repitencia
                  </p>
                  <p className="text-xs text-muted-foreground">
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
    </div>
  );
}
