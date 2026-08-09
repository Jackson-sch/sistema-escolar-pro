"use client";

import { IconSchool } from "@tabler/icons-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  type InstitucionFormControl,
  inputStyles,
  labelStyles,
  selectContentStyles,
} from "./types";
import { MagicCard } from "@/components/ui/magic-card";

interface InformacionGeneralCardProps {
  control: InstitucionFormControl;
}

export function InformacionGeneralCard({ control }: InformacionGeneralCardProps) {
  return (
    <MagicCard className="rounded-2xl p-0">
      <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-b border-border/30 pt-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl">
            <IconSchool className="size-5 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Información General</CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Datos legales e identificación oficial del colegio.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="nombreInstitucion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Nombre Oficial</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: I.E. Santa María" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="codigoModular"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Código Modular</FormLabel>
                <FormControl>
                  <Input placeholder="0654321" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="ugel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>UGEL</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: UGEL 03" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="dre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>DRE</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: DRE Lima" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tipoGestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Tipo de Gestión</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar gestión" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={selectContentStyles}>
                    <SelectItem value="PUBLICA" className="text-xs">Pública</SelectItem>
                    <SelectItem value="PRIVADA" className="text-xs">Privada</SelectItem>
                    <SelectItem value="PARROQUIAL" className="text-xs">Parroquial</SelectItem>
                    <SelectItem value="CONVENIO" className="text-xs">Convenio</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="modalidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Modalidad Educativa</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                      <SelectValue placeholder="Seleccionar modalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={selectContentStyles}>
                    <SelectItem value="PRESENCIAL" className="text-xs">Presencial</SelectItem>
                    <SelectItem value="DISTANCIA" className="text-xs">A Distancia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </MagicCard>
  );
}
