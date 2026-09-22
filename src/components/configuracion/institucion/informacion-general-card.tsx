"use client";

import { IconSchool } from "@tabler/icons-react";
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

interface InformacionGeneralCardProps {
  control: InstitucionFormControl;
}

export function InformacionGeneralCard({
  control,
}: InformacionGeneralCardProps) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-0 shadow-xs overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <IconSchool className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Información General
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Datos legales e identificación oficial de la institución educativa.
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
                  <Input
                    placeholder="Ej: I.E. Santa María"
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
            name="codigoModular"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Código Modular</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 1234567"
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
            name="ugel"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>UGEL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: UGEL 01"
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
            name="dre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>DRE</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: DRE LIMA"
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
            name="tipoGestion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Tipo de Gestión</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={inputStyles}>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={selectContentStyles}>
                    <SelectItem value="PUBLICA">Pública</SelectItem>
                    <SelectItem value="PRIVADA">Privada</SelectItem>
                    <SelectItem value="PARROQUIAL">Parroquial</SelectItem>
                    <SelectItem value="CONVENIO">Convenio</SelectItem>
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
                <FormLabel className={labelStyles}>
                  Modalidad Educativa
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className={inputStyles}>
                      <SelectValue placeholder="Seleccione modalidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={selectContentStyles}>
                    <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                    <SelectItem value="DISTANCIA">A Distancia</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
