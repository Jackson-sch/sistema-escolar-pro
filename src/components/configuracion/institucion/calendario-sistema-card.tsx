"use client";

import { IconCalendar } from "@tabler/icons-react";
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

interface CalendarioSistemaCardProps {
  control: InstitucionFormControl;
}

export function CalendarioSistemaCard({ control }: CalendarioSistemaCardProps) {
  return (
    <Card className="rounded-2xl border border-border/60 bg-card p-0 shadow-xs overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/40 p-4 px-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <IconCalendar className="size-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Calendario y Ciclo Escolar
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Periodo lectivo y fechas oficiales de inicio y término de clases.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="cicloEscolarActual"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelStyles}>
                  Año Académico Lectivo
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="2026"
                    className={`${inputStyles} font-mono font-bold`}
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseInt(e.target.value, 10) || "")
                    }
                  />
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
                <FormLabel className={`${labelStyles} mb-1.5`}>
                  Inicio de Clases
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          inputStyles,
                          "w-full pl-3 text-left font-normal flex items-center justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value + "T00:00:00"), "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="size-4 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value
                          ? new Date(field.value + "T00:00:00")
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                        }
                      }}
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
                <FormLabel className={`${labelStyles} mb-1.5`}>
                  Fin de Clases
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          inputStyles,
                          "w-full pl-3 text-left font-normal flex items-center justify-between",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value + "T00:00:00"), "PPP", {
                            locale: es,
                          })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <IconCalendar className="size-4 opacity-50 shrink-0" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value
                          ? new Date(field.value + "T00:00:00")
                          : undefined
                      }
                      onSelect={(date) => {
                        if (date) {
                          field.onChange(format(date, "yyyy-MM-dd"));
                        }
                      }}
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
    </Card>
  );
}
