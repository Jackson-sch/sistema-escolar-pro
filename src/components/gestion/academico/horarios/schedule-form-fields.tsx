"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BLOQUES_HORARIO, DIAS } from "@/lib/constants";
import { toast } from "sonner";

export interface Course {
  id: string;
  nombre: string;
  horasSemanales?: number | null;
  profesor?: {
    name: string;
    apellidoPaterno: string;
  } | null;
}

const BLOQUES_CLASE_SOLO = BLOQUES_HORARIO.filter((b) => b.tipo === "clase");

interface ScheduleCourseFieldProps {
  form: UseFormReturn<any>;
  courses: Course[];
  selectedCurso?: Course;
  limiteAlcanzado: boolean;
  horasRegistradas: number;
  nuevasHoras: number;
  totalHorasMalla: number;
}

export function ScheduleCourseField({
  form,
  courses,
  selectedCurso,
  limiteAlcanzado,
  horasRegistradas,
  nuevasHoras,
  totalHorasMalla,
}: ScheduleCourseFieldProps) {
  return (
    <FormField
      control={form.control}
      name="cursoId"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <div className="flex items-center justify-between">
            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Curso / Profesor
            </FormLabel>
            {selectedCurso && (
              <Badge
                variant={limiteAlcanzado ? "destructive" : "outline"}
                className={cn(
                  "text-[9px] h-5 transition-[color,background-color,border-color,height]",
                  !limiteAlcanzado &&
                    "bg-blue-500/10 text-blue-400 border-blue-500/20",
                )}
              >
                {limiteAlcanzado ? (
                  <IconAlertTriangle className="size-2.5 mr-1" />
                ) : (
                  <IconCheck className="size-2.5 mr-1" />
                )}
                {horasRegistradas} + {nuevasHoras} / {totalHorasMalla} Horas
              </Badge>
            )}
          </div>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="w-full rounded-full">
                <SelectValue placeholder="Seleccione un curso" />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="bg-[#09090b] border-white/10">
              {courses.map((course: Course) => (
                <SelectItem key={course.id} value={course.id}>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="font-bold">{course.nombre}</span>
                    <span className="text-[10px] opacity-50 flex items-center gap-1 uppercase">
                      <IconUser className="size-3" />{" "}
                      {course.profesor?.name ?? "Sin docente"}{" "}
                      {course.profesor?.apellidoPaterno ?? ""}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface ScheduleTimingFieldsProps {
  form: UseFormReturn<any>;
  selectedDuracion: string;
}

export function ScheduleTimingFields({
  form,
  selectedDuracion,
}: ScheduleTimingFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="diaSemana"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Día
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <SelectValue placeholder="Día" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#09090b] border-white/10">
                  {DIAS.map((dia) => (
                    <SelectItem key={dia.id} value={dia.id}>
                      {dia.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duracion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Duración
              </FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue("horaInicio", "");
                  form.setValue("horaFin", "");
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <SelectValue placeholder="Duración" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#09090b] border-white/10">
                  <SelectItem value="SIMPLE">Simple (45 min)</SelectItem>
                  <SelectItem value="DOBLE">Doble (90 min)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="horaInicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Inicio
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={(val) => {
                  field.onChange(val);
                  const bloqueActual = BLOQUES_CLASE_SOLO.find(
                    (b) => b.inicio === val,
                  );
                  if (bloqueActual) {
                    if (selectedDuracion === "SIMPLE") {
                      form.setValue("horaFin", bloqueActual.fin);
                    } else {
                      const indexSiguiente =
                        BLOQUES_CLASE_SOLO.findIndex((b) => b.inicio === val) +
                        1;
                      if (indexSiguiente < BLOQUES_CLASE_SOLO.length) {
                        form.setValue(
                          "horaFin",
                          BLOQUES_CLASE_SOLO[indexSiguiente].fin,
                        );
                      } else {
                        toast.error(
                          "No hay suficiente tiempo para un bloque doble",
                        );
                        form.setValue("horaInicio", "");
                      }
                    }
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <IconClock className="size-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-[#09090b] border-white/10">
                  {BLOQUES_CLASE_SOLO.map((b) => (
                    <SelectItem key={b.inicio} value={b.inicio}>
                      {b.inicio}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="horaFin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 opacity-40">
                Salida
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  className="w-full rounded-full disabled:opacity-50 text-center font-bold"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}
