"use client";

import { IconCalendar } from "@tabler/icons-react";
import {
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type InstitucionFormControl, inputStyles, labelStyles } from "./types";
import { MagicCard } from "@/components/ui/magic-card";

interface CalendarioSistemaCardProps {
  control: InstitucionFormControl;
}

export function CalendarioSistemaCard({ control }: CalendarioSistemaCardProps) {
  return (
    <MagicCard className="rounded-2xl p-0">
      <CardHeader className="bg-linear-to-r from-blue-500/5 to-transparent border-b border-border/30 pt-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <IconCalendar className="size-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Calendario y Sistema
            </CardTitle>
            <CardDescription className="text-[11px] text-muted-foreground/70 font-medium">
              Fechas clave para el ciclo escolar
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={control}
            name="cicloEscolarActual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>
                  Año Académico Actual
                </FormLabel>
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
              <FormItem className="flex flex-col">
                <FormLabel className={labelStyles}>Inicio de Clases</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          inputStyles,
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      disabled={(date) =>
                        date < new Date("1900-01-01") ||
                        date > new Date("2100-12-31")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="fechaFinClases"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className={labelStyles}>Fin de Clases</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          inputStyles,
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) =>
                        field.onChange(date ? date.toISOString() : "")
                      }
                      disabled={(date) =>
                        date < new Date("1900-01-01") ||
                        date > new Date("2100-12-31")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </MagicCard>
  );
}
