"use client"

import { IconSchool } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  type InstitucionFormControl,
  inputStyles,
  labelStyles,
  selectContentStyles
} from "./types"

interface InformacionGeneralCardProps {
  control: InstitucionFormControl
}

export function InformacionGeneralCard({ control }: InformacionGeneralCardProps) {
  return (
    <Card className="bg-card/30 border-border/40 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl">
            <IconSchool className="size-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Información General</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground/70 font-medium">
              Datos legales y básicos de la institución
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
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
                <FormLabel className={labelStyles}>Gestión</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tipo" />
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
        </div>
        <FormField
          control={control}
          name="modalidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Modalidad</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tipo" />
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
      </CardContent>
    </Card>
  )
}
