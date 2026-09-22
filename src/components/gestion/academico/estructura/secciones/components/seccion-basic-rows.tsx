"use client";

import { Control } from "react-hook-form";
import { IconCheck, IconSelector } from "@tabler/icons-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TURNO_OPTIONS } from "@/lib/constants";
import { SeccionFormValues } from "./seccion-form-types";

export function BasicRow({
  control,
  filteredGrados,
  sedes,
}: {
  control: Control<SeccionFormValues>;
  filteredGrados: { id: string; nombre: string }[];
  sedes: { id: string; nombre: string }[];
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <FormField<SeccionFormValues>
        control={control}
        name="gradoId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold text-foreground">
              Grado Escolar
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""} key={field.value ?? ""}>
              <FormControl>
                <SelectTrigger className="w-full h-9 text-xs font-medium rounded-xl border-border/60 bg-background">
                  <SelectValue placeholder="Seleccionar grado..." />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                {filteredGrados.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                    No hay grados para este nivel
                  </div>
                ) : (
                  filteredGrados.map((grado) => (
                    <SelectItem
                      key={grado.id}
                      value={grado.id}
                      className="text-xs"
                    >
                      {grado.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />

      <FormField<SeccionFormValues>
        control={control}
        name="sedeId"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-bold text-foreground">
              Sede Institucional
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value || "none"}
              key={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger className="w-full h-9 text-xs font-medium rounded-xl border-border/60 bg-background">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                <SelectItem value="none" className="text-xs">
                  Sin sede específica
                </SelectItem>
                {sedes.map((sede) => (
                  <SelectItem key={sede.id} value={sede.id} className="text-xs">
                    {sede.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />
    </div>
  );
}

export function DetailsRow({
  control,
  tutores,
  tutorOpen,
  onTutorOpenChange,
}: {
  control: Control<SeccionFormValues>;
  tutores: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  }[];
  tutorOpen: boolean;
  onTutorOpenChange: (open: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
      <FormField<SeccionFormValues>
        control={control}
        name="seccion"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-3">
            <FormLabel className="text-xs font-bold text-foreground">
              Sección
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: A / Única"
                {...field}
                value={field.value ?? ""}
                className="h-9 text-xs font-bold rounded-xl border-border/60 bg-background uppercase text-center"
              />
            </FormControl>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />
      <FormField<SeccionFormValues>
        control={control}
        name="anioAcademico"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-3">
            <FormLabel className="text-xs font-bold text-foreground">
              Año Lectivo
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                {...field}
                value={field.value ?? ""}
                className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
              />
            </FormControl>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />

      {/* Tutor (Combobox) */}
      <FormField<SeccionFormValues>
        control={control}
        name="tutorId"
        render={({ field }) => {
          const selectedTutor = tutores.find((t) => t.id === field.value);
          return (
            <FormItem className="col-span-2 sm:col-span-6 flex flex-col">
              <FormLabel className="text-xs font-bold text-foreground">
                Docente Tutor (Opcional)
              </FormLabel>
              <Popover open={tutorOpen} onOpenChange={onTutorOpenChange}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={tutorOpen}
                      className={cn(
                        "w-full h-9 justify-between rounded-xl text-xs font-medium border-border/60 bg-background capitalize",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      {selectedTutor
                        ? `${selectedTutor.apellidoPaterno} ${selectedTutor.apellidoMaterno || ""}, ${selectedTutor.name}`
                        : "Buscar tutor..."}
                      <IconSelector className="ml-auto size-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0 rounded-xl shadow-md border-border/60"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Buscar por nombre..."
                      className="text-xs"
                    />
                    <CommandList>
                      <CommandEmpty className="text-xs p-2 text-muted-foreground">
                        No se encontraron tutores.
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="sin-tutor"
                          onSelect={() => {
                            field.onChange("none");
                            onTutorOpenChange(false);
                          }}
                          className="text-xs"
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-3.5",
                              field.value === "none" || !field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          Sin tutor asignado
                        </CommandItem>
                        {tutores.map((tutor) => {
                          const fullName = `${tutor.apellidoPaterno} ${tutor.apellidoMaterno || ""}, ${tutor.name}`;
                          return (
                            <CommandItem
                              key={tutor.id}
                              value={fullName}
                              onSelect={() => {
                                field.onChange(tutor.id);
                                onTutorOpenChange(false);
                              }}
                              className="text-xs capitalize"
                            >
                              <IconCheck
                                className={cn(
                                  "mr-2 size-3.5",
                                  field.value === tutor.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {fullName}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage className="text-xxs" />
            </FormItem>
          );
        }}
      />
    </div>
  );
}

export function ConfigRow({
  control,
}: {
  control: Control<SeccionFormValues>;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
      <FormField<SeccionFormValues>
        control={control}
        name="turno"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-4">
            <FormLabel className="text-xs font-bold text-foreground">
              Turno
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""} key={field.value ?? ""}>
              <FormControl>
                <SelectTrigger className="w-full h-9 text-xs font-medium rounded-xl border-border/60 bg-background">
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="rounded-xl">
                {TURNO_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="text-xs"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />
      <FormField<SeccionFormValues>
        control={control}
        name="capacidad"
        render={({ field }) => (
          <FormItem className="col-span-1 sm:col-span-4">
            <FormLabel className="text-xs font-bold text-foreground">
              Capacidad Máx.
            </FormLabel>
            <FormControl>
              <Input
                type="number"
                min={1}
                {...field}
                value={field.value ?? ""}
                className="h-9 text-xs font-mono rounded-xl border-border/60 bg-background text-center"
              />
            </FormControl>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />
      {/* Aula */}
      <FormField<SeccionFormValues>
        control={control}
        name="aulaAsignada"
        render={({ field }) => (
          <FormItem className="col-span-2 sm:col-span-4">
            <FormLabel className="text-xs font-bold text-foreground">
              N° Aula / Salón
            </FormLabel>
            <FormControl>
              <Input
                placeholder="Ej: Aula 101 / Pabellón B"
                {...field}
                value={field.value ?? ""}
                className="h-9 text-xs rounded-xl border-border/60 bg-background"
              />
            </FormControl>
            <FormMessage className="text-xxs" />
          </FormItem>
        )}
      />
    </div>
  );
}
