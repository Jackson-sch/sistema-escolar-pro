"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  IconUser,
  IconSearch,
  IconAlertCircle,
  IconCheck,
  IconId,
  IconCalendarEvent,
  IconCalendarFilled,
  IconMapPin,
} from "@tabler/icons-react";
import { cn, calculateAge } from "@/lib/utils";
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
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EnrollmentValues } from "@/lib/schemas/enrollment";
import { EnrollmentSectionHeader } from "./enrollment-section-header";

export interface EstudianteOpcion {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string | null;
  fechaNacimiento?: Date | string | null;
  direccion?: string | null;
}

interface StudentSelectionSectionProps {
  form: UseFormReturn<EnrollmentValues>;
  students: EstudianteOpcion[];
  isLoadingStudents: boolean;
}

export function StudentSelectionSection({
  form,
  students,
  isLoadingStudents,
}: StudentSelectionSectionProps) {
  const [openStudentPopover, setOpenStudentPopover] = useState(false);

  return (
    <div className="space-y-4">
      <EnrollmentSectionHeader
        icon={IconUser}
        iconClassName="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Selección del Estudiante"
        description="Alumnos sin matrícula activa en el periodo lectivo seleccionado."
      />

      <FormField
        control={form.control}
        name="estudianteId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Popover
              open={openStudentPopover}
              onOpenChange={setOpenStudentPopover}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "h-10 w-full justify-between bg-background border-border/40 text-xs font-medium transition-[background-color,box-shadow] hover:bg-muted/40 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      students.find((s) => s.id === field.value) ? (
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 font-semibold text-xs">
                            <IconUser className="size-3.5" />
                          </div>
                          <span className="font-semibold text-foreground capitalize">
                            {
                              students.find((s) => s.id === field.value)
                                ?.apellidoPaterno
                            }{" "}
                            {
                              students.find((s) => s.id === field.value)
                                ?.apellidoMaterno
                            }
                            {", "}
                            {students.find((s) => s.id === field.value)?.name}
                          </span>
                        </div>
                      ) : (
                        "Estudiante seleccionado no encontrado"
                      )
                    ) : isLoadingStudents ? (
                      "Cargando lista de estudiantes..."
                    ) : (
                      "Buscar o seleccionar un estudiante..."
                    )}
                    <IconSearch className="size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 bg-background/95 rounded-2xl shadow-xl">
                <Command className="bg-transparent">
                  <CommandInput
                    placeholder="Buscar por nombre o DNI..."
                    className="text-xs"
                  />
                  <CommandList className="max-h-[260px]">
                    <CommandEmpty>
                      <div className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted border border-border/40">
                          <IconAlertCircle className="size-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-foreground">
                            Sin resultados
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            No se encontraron alumnos pendientes de matrícula.
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
                            setOpenStudentPopover(false);
                          }}
                          className="cursor-pointer py-2 px-3 text-xs aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 capitalize rounded-lg"
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-4 text-indigo-600",
                              student.id === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground">
                              {student.apellidoPaterno}{" "}
                              {student.apellidoMaterno}, {student.name}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1 font-mono">
                                <IconId className="size-3.5" />
                                DNI: {student.dni || "-"}
                              </span>
                              <span className="flex items-center gap-1 text-indigo-500 font-medium">
                                <IconCalendarEvent className="size-3.5" />
                                {calculateAge(student.fechaNacimiento ?? "")} años
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

      {/* Vista Previa de la Ficha del Estudiante */}
      {form.watch("estudianteId") && (
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden">
          {(() => {
            const s = students.find((s) => s.id === form.watch("estudianteId"));
            if (!s) return null;
            return (
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-md shadow-indigo-500/20 shrink-0">
                  {s.name[0]}
                  {s.apellidoPaterno[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate capitalize">
                    {s.name} {s.apellidoPaterno} {s.apellidoMaterno}
                  </h4>
                  <div className="flex flex-wrap gap-y-1.5 gap-x-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <IconId className="size-3.5 text-indigo-500" />
                      DNI: {s.dni || "-"}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <IconCalendarFilled className="size-3.5 text-indigo-500" />
                      {calculateAge(s.fechaNacimiento ?? "")} años
                    </span>
                    {s.direccion && (
                      <span className="flex items-center gap-1 truncate font-medium">
                        <IconMapPin className="size-3.5 text-indigo-500" />
                        {s.direccion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
