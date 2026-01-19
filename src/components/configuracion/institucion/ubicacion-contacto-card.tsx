"use client"

import { IconMapPin, IconPhone, IconMail } from "@tabler/icons-react"
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

interface UbicacionContactoCardProps {
  control: InstitucionFormControl
}

export function UbicacionContactoCard({ control }: UbicacionContactoCardProps) {
  return (
    <Card className="bg-card/30 border-border/40 shadow-sm">
      <CardHeader className="bg-linear-to-r from-violet-500/5 to-transparent border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl">
            <IconMapPin className="size-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Ubicación y Contacto</CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground/70 font-medium">
              Donde encontrarte y como contactarte
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <FormField
          control={control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelStyles}>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Av. Los Tulipanes 123" className={inputStyles} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={control}
            name="departamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Dpto.</FormLabel>
                <FormControl>
                  <Input className={inputStyles} {...field} />
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
                <FormLabel className={labelStyles}>Prov.</FormLabel>
                <FormControl>
                  <Input className={inputStyles} {...field} />
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
                <FormLabel className={labelStyles}>Dist.</FormLabel>
                <FormControl>
                  <Input className={inputStyles} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>Teléfono</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input className={`pl-9 ${inputStyles}`} {...field} />
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
                <FormLabel className={labelStyles}>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input className={`pl-9 ${inputStyles}`} {...field} />
                  </div>
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
