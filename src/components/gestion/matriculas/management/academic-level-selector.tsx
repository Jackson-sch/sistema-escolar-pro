"use client";

import React, { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconCheck, IconSearch, IconAlertCircle, IconLock } from "@tabler/icons-react";
import { UseFormReturn } from "react-hook-form";

interface AcademicLevelSelectorProps {
  form: UseFormReturn<any>;
  name: string;
  allNiveles: any[];
  filteredByLevel: any[];
  selectedLevel?: string | null;
  isLoading?: boolean;
  anio: number;
}

export function AcademicLevelSelector({
  form,
  name,
  allNiveles,
  filteredByLevel,
  selectedLevel,
  isLoading,
  anio,
}: AcademicLevelSelectorProps) {
  const [open, setOpen] = useState(false);
  const isLevelSelected = Boolean(selectedLevel);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const levelsWithData = Array.from(
          new Set(allNiveles.map((n: any) => n.nivel.nombre)),
        ).sort();

        return (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground/80">
              Aula / Sección Asignada
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    disabled={!isLevelSelected || isLoading}
                    className={cn(
                      "h-10 w-full justify-between bg-background border-border/40 text-xs font-medium transition-[color,background-color,opacity] rounded-xl px-3",
                      !isLevelSelected && "opacity-60 bg-muted/20 cursor-not-allowed",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      allNiveles.find((n: any) => n.id === field.value) ? (
                        <div className="flex items-center leading-tight text-left gap-2">
                          <span className="font-semibold text-foreground">
                            {
                              allNiveles.find((n: any) => n.id === field.value)
                                .grado.nombre
                            }{" "}
                            &quot;
                            {
                              allNiveles.find((n: any) => n.id === field.value)
                                .seccion
                            }
                            &quot;
                          </span>
                          <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase">
                            ({
                              allNiveles.find(
                                (n: any) => n.id === field.value,
                              ).nivel.nombre
                            })
                          </span>
                        </div>
                      ) : (
                        "Sección no encontrada"
                      )
                    ) : isLoading ? (
                      <span>Cargando aulas...</span>
                    ) : !isLevelSelected ? (
                      <span className="flex items-center gap-1.5 text-muted-foreground/70">
                        <IconLock className="size-3.5" />
                        Primero seleccione un nivel educativo...
                      </span>
                    ) : (
                      <span>Seleccionar aula disponible...</span>
                    )}
                    <IconSearch className="size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 bg-background/95 rounded-2xl shadow-xl">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Buscar por grado o sección..." className="text-xs" />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-5 flex flex-col items-center text-center gap-2">
                        <IconAlertCircle className="size-5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          No se encontraron secciones disponibles para {selectedLevel || "el nivel seleccionado"} en {anio}.
                        </p>
                      </div>
                    </CommandEmpty>
                    {levelsWithData.map((levelName: any) => {
                      const sectionsInLevel = filteredByLevel.filter(
                        (n: any) => n.nivel.nombre === levelName,
                      );
                      if (sectionsInLevel.length === 0) return null;
                      return (
                        <CommandGroup
                          key={levelName as string}
                          heading={levelName as string}
                        >
                          {sectionsInLevel.map((nivel: any) => (
                            <CommandItem
                              key={nivel.id}
                              value={`${nivel.grado.nombre} ${nivel.seccion} ${nivel.nivel.nombre} ${nivel.sede?.nombre || ""}`}
                              onSelect={() => {
                                form.setValue(name, nivel.id, {
                                  shouldDirty: true,
                                });
                                setOpen(false);
                              }}
                              className="cursor-pointer py-2 px-3 text-xs aria-selected:bg-blue-500/10 aria-selected:text-blue-500 rounded-lg"
                            >
                              <div className="flex items-start w-full gap-2.5">
                                <div className="flex items-center justify-center pt-0.5">
                                  <IconCheck
                                    className={cn(
                                      "size-4 text-blue-600",
                                      nivel.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </div>
                                <div className="flex flex-col flex-1 gap-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-foreground">
                                      {nivel.grado.nombre} &quot;{nivel.seccion}&quot;
                                    </span>
                                    {nivel.sede && (
                                      <span className="text-[10px] text-muted-foreground">
                                        {nivel.sede.nombre}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={cn(
                                        "text-[10px] px-1.5 py-0.2 rounded-md font-medium",
                                        nivel._count?.matriculas >= nivel.capacidad
                                          ? "bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20"
                                          : nivel._count?.matriculas > nivel.capacidad * 0.8
                                            ? "bg-amber-500/10 text-amber-600 font-semibold"
                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                      )}
                                    >
                                      Capacidad: {nivel._count?.matriculas || 0} / {nivel.capacidad}
                                    </span>
                                    {nivel._count?.matriculas >= nivel.capacidad && (
                                      <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider bg-rose-500/10 px-1.5 rounded">
                                        LLENO
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
