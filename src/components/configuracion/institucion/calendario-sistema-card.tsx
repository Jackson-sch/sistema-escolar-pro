"use client"

import { IconCalendar } from "@tabler/icons-react"
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
  type InstitucionFormControl,
  inputStyles,
  labelStyles
} from "./types"

interface CalendarioSistemaCardProps {
  control: InstitucionFormControl
}

export function CalendarioSistemaCard({ control }: CalendarioSistemaCardProps) {
  return (
    <Card className="bg-card/30 border-border/40 shadow-sm md:col-span-2">
      <CardHeader className="bg-linear-to-r from-blue-500/5 to-transparent border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <IconCalendar className="size-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Calendario y Sistema</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground/70 font-medium">
              Fechas clave para el ciclo escolar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="cicloEscolarActual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Año Académico Actual</FormLabel>
                <FormControl>
                  <Input type="number" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fechaInicioClases"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Inicio de Clases</FormLabel>
                <FormControl>
                  <Input type="date" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fechaFinClases"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Fin de Clases</FormLabel>
                <FormControl>
                  <Input type="date" className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
