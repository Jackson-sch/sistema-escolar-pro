"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, calculateAge } from "@/lib/utils";
import {
  IconUser,
  IconSearch,
  IconAlertCircle,
  IconCheck,
  IconId,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { UseFormReturn } from "react-hook-form";
import { EnrollmentValues } from "@/lib/schemas/enrollment";

interface StudentSearchComboboxProps {
  form: UseFormReturn<EnrollmentValues>;
  students: any[];
  isLoading: boolean;
}

export function StudentSearchCombobox({
  form,
  students,
  isLoading,
}: StudentSearchComboboxProps) {
  return (
    <FormField
      control={form.control}
      name="estudianteId"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-violet-500" />
            Estudiante
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "h-12 w-full justify-between border-white/5 bg-black/20 text-sm transition-all hover:bg-black/30 hover:text-foreground focus:border-violet-500/30 focus:bg-black/40 focus:ring-4 focus:ring-violet-500/10 rounded-2xl p-0 px-4",
                    !field.value && "text-muted-foreground",
                  )}
                >
                  {field.value ? (
                    students.find((s) => s.id === field.value) ? (
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                          <IconUser className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-foreground/90 capitalize">
                          {
                            students.find((s) => s.id === field.value)
                              ?.apellidoPaterno
                          }{" "}
                          {
                            students.find((s) => s.id === field.value)
                              ?.apellidoMaterno
                          }
                          {", "}
                          {
                            students.find((s) => s.id === field.value)?.name
                          }
                        </span>
                      </div>
                    ) : (
                      "Estudiante seleccionado no encontrado"
                    )
                  ) : isLoading ? (
                    "Cargando lista ..."
                  ) : (
                    "Busca o selecciona un estudiante..."
                  )}
                  <IconSearch className="h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-white/10 bg-zinc-950/95 backdrop-blur-xl">
              <Command className="bg-transparent">
                <CommandInput placeholder="Buscar por nombre o DNI..." />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>
                    <div className="p-6 flex flex-col items-center text-center gap-3">
                      <div className="flex w-12 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-white/5">
                        <IconAlertCircle className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-semibold text-sm text-foreground">
                          No encontrado
                        </p>
                        <p className="text-xs text-muted-foreground">
                          No hay alumnos que coincidan con la búsqueda
                        </p>
                      </div>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {students.map((student) => (
                      <CommandItem
                        value={`${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno} ${student.dni}`}
                        key={student.id}
                        onSelect={() => {
                          form.setValue("estudianteId", student.id, {
                            shouldDirty: true,
                          });
                        }}
                        className="cursor-pointer py-2 aria-selected:bg-violet-500/10 aria-selected:text-violet-400 capitalize"
                      >
                        <IconCheck
                          className={cn(
                            "mr-2 h-4 w-4",
                            student.id === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-foreground/90">
                            {student.apellidoPaterno} {student.apellidoMaterno},{" "}
                            {student.name}
                          </span>
                          <div className="flex items-center gap-3 text-xxs font-medium tracking-wider text-muted-foreground/70">
                            <span className="flex items-center gap-1">
                              <IconId className="h-3 w-3" />
                              {student.dni}
                            </span>
                            <span className="flex items-center gap-1 text-violet-400/90 font-bold">
                              <IconCalendarEvent className="h-3 w-3 text-violet-500" />
                              {calculateAge(student.fechaNacimiento)} años
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
