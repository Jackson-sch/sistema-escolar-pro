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
import { IconUser, IconId, IconMail } from "@tabler/icons-react";

interface StaffPersonalInfoProps {
  form: UseFormReturn<StaffValues>;
  isRootAdmin: boolean;
}

export function StaffPersonalInfo({
  form,
  isRootAdmin,
}: StaffPersonalInfoProps) {
  return (
    <div className="p-6 rounded-[2rem] border space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b border-white/5">
        <div className="p-2 rounded-xl bg-primary/10 text-primary">
          <IconUser className="size-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
            Información Personal
          </h3>
          <p className="text-xxs text-muted-foreground font-medium">
            Datos básicos de identificación del colaborador.
            <span className="text-primary/80 ml-1">
              (El acceso al sistema será con su email y su DNI como contraseña)
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Nombres
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="Ejem: Juan Alberto"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apellidoPaterno"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Apellido Paterno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="Pérez"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apellidoMaterno"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Apellido Materno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isRootAdmin}
                  placeholder="García"
                  className="rounded-full transition-all px-5"
                />
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                DNI
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <IconId className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    {...field}
                    disabled={isRootAdmin}
                    placeholder="00000000"
                    maxLength={8}
                    className="rounded-full transition-all pl-10 pr-5"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xxs font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                Correo Electrónico
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <IconMail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    {...field}
                    disabled={isRootAdmin}
                    type="email"
                    placeholder="nombre@colegio.edu.pe"
                    className="rounded-full transition-all pl-10 pr-5"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xxs" />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
