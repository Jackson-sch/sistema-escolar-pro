"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnnouncementAudienceFieldsProps {
  form: UseFormReturn<any>;
  grados: any[];
}

export function AnnouncementAudienceFields({
  form,
  grados,
}: AnnouncementAudienceFieldsProps) {
  const dirigidoA = form.watch("dirigidoA");

  return (
    <>
      <FormField
        control={form.control}
        name="dirigidoA"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground/80">
              Dirigido A
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                  <SelectValue placeholder="Seleccione destinatario" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl border-border/40">
                <SelectItem value="TODOS" className="text-xs font-medium">
                  Toda la comunidad
                </SelectItem>
                <SelectItem value="ESTUDIANTES" className="text-xs font-medium">
                  Solo Estudiantes
                </SelectItem>
                <SelectItem value="PROFESORES" className="text-xs font-medium">
                  Solo Profesores
                </SelectItem>
                <SelectItem value="PADRES" className="text-xs font-medium">
                  Solo Padres
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {(dirigidoA === "ESTUDIANTES" || dirigidoA === "PADRES") && (
        <FormField
          control={form.control}
          name="grados"
          render={() => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Seleccionar Grados Específicos
              </FormLabel>
              <ScrollArea className="h-[100px] rounded-xl border border-border/40 bg-background/60 p-2">
                <div className="grid grid-cols-2 gap-2">
                  {grados.map((grado) => (
                    <FormField
                      key={grado.id}
                      control={form.control}
                      name="grados"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={grado.id}
                            className="flex flex-row items-center space-x-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(grado.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, grado.id]);
                                  } else {
                                    field.onChange(
                                      current.filter(
                                        (v: string) => v !== grado.id,
                                      ),
                                    );
                                  }
                                }}
                                className="rounded-md border-border/40"
                              />
                            </FormControl>
                            <FormLabel className="text-xs font-normal cursor-pointer">
                              {grado.nombre}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </>
  );
}

interface AnnouncementSwitchFieldsProps {
  form: UseFormReturn<any>;
}

export function AnnouncementSwitchFields({
  form,
}: AnnouncementSwitchFieldsProps) {
  return (
    <div className="flex flex-wrap items-center justify-around gap-4 p-3 rounded-xl bg-background/50 border border-border/40">
      <FormField
        control={form.control}
        name="importante"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
            <FormLabel className="text-xs font-medium cursor-pointer">
              Importante
            </FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="urgente"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
            <FormLabel className="text-xs font-medium cursor-pointer text-rose-600 dark:text-rose-400">
              Urgente
            </FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="fijado"
        render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0 cursor-pointer">
            <FormLabel className="text-xs font-medium cursor-pointer">
              Fijar Arriba
            </FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
