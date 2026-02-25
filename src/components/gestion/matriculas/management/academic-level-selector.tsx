"use client";

import React from "react";
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
import { IconCheck, IconSearch, IconAlertCircle } from "@tabler/icons-react";
import { UseFormReturn } from "react-hook-form";

interface AcademicLevelSelectorProps {
  form: UseFormReturn<any>;
  name: string;
  allNiveles: any[];
  filteredByLevel: any[];
  isLoading?: boolean;
  anio: number;
}

export function AcademicLevelSelector({
  form,
  name,
  allNiveles,
  filteredByLevel,
  isLoading,
  anio,
}: AcademicLevelSelectorProps) {
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
            <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Aula Asignada
            </FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between border-white/5 bg-black/20 text-sm transition-all hover:bg-black/30 hover:text-foreground focus:border-blue-500/30 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-2xl p-0 px-4",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      allNiveles.find((n: any) => n.id === field.value) ? (
                        <div className="flex items-center leading-tight text-left">
                          <span className="text-foreground/90 leading-tight">
                            {
                              allNiveles.find((n: any) => n.id === field.value)
                                .grado.nombre
                            }{" "}
                            "
                            {
                              allNiveles.find((n: any) => n.id === field.value)
                                .seccion
                            }
                            "
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-medium tracking-wider text-muted-foreground/60 uppercase ml-2">
                            <span className="text-blue-400/80">
                              {
                                allNiveles.find(
                                  (n: any) => n.id === field.value,
                                ).nivel.nombre
                              }
                            </span>
                          </span>
                        </div>
                      ) : (
                        "Sección no encontrada"
                      )
                    ) : isLoading ? (
                      <span>Cargando aulas...</span>
                    ) : (
                      <span>Seleccione aula...</span>
                    )}
                    <IconSearch className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-white/10 bg-zinc-950/95 backdrop-blur-xl">
                <Command className="bg-transparent">
                  <CommandInput placeholder="Buscar por grado o sección..." />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-6 flex flex-col items-center text-center gap-3">
                        <IconAlertCircle className="h-6 w-6 text-muted-foreground/50" />
                        <p className="text-xs text-muted-foreground">
                          No se encontraron secciones para {anio}
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
                              }}
                              className="cursor-pointer py-2 pr-2 aria-selected:bg-blue-500/10 aria-selected:text-blue-400 group"
                            >
                              <div className="flex items-start w-full gap-3">
                                <div className="flex items-center justify-center pt-1">
                                  <IconCheck
                                    className={cn(
                                      "h-4 w-4",
                                      nivel.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </div>
                                <div className="flex flex-col flex-1 gap-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-semibold text-foreground/90">
                                      {nivel.grado.nombre} "{nivel.seccion}"
                                    </span>
                                    {nivel.sede && (
                                      <span className="text-[10px] text-muted-foreground/60 font-medium">
                                        {nivel.sede.nombre}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                                      <span
                                        className={cn(
                                          "px-1.5 py-0.5 rounded-full",
                                          nivel._count?.matriculas >=
                                            nivel.capacidad
                                            ? "bg-red-500/10 text-red-400 font-bold border border-red-500/20"
                                            : nivel._count?.matriculas >
                                                nivel.capacidad * 0.8
                                              ? "bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20"
                                              : "bg-blue-500/10 text-blue-400/70 border border-blue-500/10",
                                        )}
                                      >
                                        Total Alumnos:{" "}
                                        {nivel._count?.matriculas || 0} de{" "}
                                        {nivel.capacidad}
                                      </span>
                                    </div>
                                    {nivel._count?.matriculas >=
                                      nivel.capacidad && (
                                      <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter bg-red-500/10 px-1 rounded animate-pulse">
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
