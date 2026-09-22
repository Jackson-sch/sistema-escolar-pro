"use client";

import { Control } from "react-hook-form";
import { IconShieldCheck } from "@tabler/icons-react";
import { FormField, FormItem } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { FamilyValues } from "./family-form-types";
import { FormSectionHeader } from "./family-form-section-header";

export function PermisosSection({
  control,
}: {
  control: Control<FamilyValues>;
}) {
  return (
    <div className="space-y-4 pt-2">
      <FormSectionHeader
        icon={IconShieldCheck}
        iconClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="2. Configuración de Permisos y Convivencia"
        description="Designación de contacto primario, entrega escolar y residencia."
      />

      <div className="space-y-3">
        <FormField
          control={control}
          name="contactoPrimario"
          render={({ field }) => (
            <FormItem>
              <label
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                  field.value
                    ? "bg-indigo-500/10 border-indigo-500/30"
                    : "bg-background border-border/40 hover:bg-muted/40",
                )}
              >
                <div className="space-y-0.5">
                  <p
                    className={cn(
                      "text-xs font-semibold",
                      field.value
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-foreground",
                    )}
                  >
                    Contacto Primario de la Institución
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Recibirá notificaciones prioritarias, comunicados y
                    citaciones.
                  </p>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-indigo-600"
                />
              </label>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField
            control={control}
            name="autorizadoRecoger"
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
                      Autorizado a Recoger
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Retiro del alumno en puerta
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
            control={control}
            name="viveCon"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-foreground",
                      )}
                    >
                      Vive con el Alumno
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Residencia compartida
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </label>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
