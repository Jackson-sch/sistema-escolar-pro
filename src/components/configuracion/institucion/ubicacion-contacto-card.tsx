"use client";

import { IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { type InstitucionFormControl, inputStyles, labelStyles } from "./types";

interface UbicacionContactoCardProps {
  control: InstitucionFormControl;
}

export function UbicacionContactoCard({ control }: UbicacionContactoCardProps) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-0 shadow-xs overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <IconMapPin className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Ubicación y Contacto
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Dirección geográfica y canales de comunicación oficiales.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <FormField
          control={control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Dirección</FormLabel>
              <FormControl>
                <Input
                  placeholder="Av. Los Tulipanes 123"
                  className={inputStyles}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="departamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Departamento</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Lima"
                    className={inputStyles}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="provincia"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Provincia</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Lima"
                    className={inputStyles}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="distrito"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Distrito</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Miraflores"
                    className={inputStyles}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Teléfono / Celular</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="(01) 234-5678"
                      className={`${inputStyles} pl-8`}
                      {...field}
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
                <FormLabel className={labelStyles}>Correo Electrónico</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="contacto@colegio.edu.pe"
                      className={`${inputStyles} pl-8`}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
