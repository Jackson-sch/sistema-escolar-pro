"use client";

import { Control } from "react-hook-form";
import {
  IconId,
  IconPhone,
  IconMail,
  IconSparkles,
  IconUser,
  IconKey,
} from "@tabler/icons-react";
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
import { Badge } from "@/components/ui/badge";
import { PARENTESCO_OPTIONS } from "@/lib/constants";
import { FamilyValues } from "./family-form-types";
import { FormSectionHeader } from "./family-form-section-header";

export function IdentificacionSection({
  control,
  isAutofilled,
  readOnlyDni = false,
}: {
  control: Control<FamilyValues>;
  isAutofilled: boolean;
  readOnlyDni?: boolean;
}) {
  return (
    <div className="space-y-4">
      <FormSectionHeader
        icon={IconUser}
        iconClassName="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Identificación y Contacto"
        description="Datos de identidad, parentesco e información de comunicación."
        badge={
          isAutofilled && (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold gap-1 rounded-md px-2 py-0.5">
              <IconSparkles className="size-3" />
              Cargado por DNI
            </Badge>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="dni"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                DNI / Documento Identidad <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconId className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    placeholder="01234567"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                    maxLength={15}
                    disabled={readOnlyDni}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="parentesco"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Parentesco con el Alumno
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar parentesco" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {PARENTESCO_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="text-xs font-medium"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombres
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Juan Alberto"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="apellidoPaterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Paterno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Pérez"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="apellidoMaterno"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Materno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="García"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <FormField
          control={control}
          name="telefono"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Teléfono / WhatsApp
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
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
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Correo Electrónico <span className="text-rose-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    type="email"
                    placeholder="padre@ejemplo.com (acceso al portal)"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Aviso informativo de acceso al portal */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
        <IconKey className="size-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed text-[11px]">
          <p className="font-semibold text-indigo-600 dark:text-indigo-400">
            Acceso al Portal Familiar
          </p>
          <p className="text-muted-foreground">
            El apoderado ingresará con su <strong>Correo Electrónico</strong> (usuario) y su <strong>DNI</strong> como contraseña inicial (deberá cambiarla al iniciar sesión).
          </p>
        </div>
      </div>
    </div>
  );
}
