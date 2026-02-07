"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormModal } from "@/components/modals/form-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertHorarioAction } from "@/actions/schedules";
import { toast } from "sonner";
import { useState } from "react";
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconUser,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BLOQUES_HORARIO, DIAS } from "@/lib/constants";

const formSchema = z.object({
  cursoId: z.string().min(1, "Debe seleccionar un curso"),
  diaSemana: z.string().min(1, "Debe seleccionar un día"),
  duracion: z.enum(["SIMPLE", "DOBLE"]).default("SIMPLE"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  aula: z.string().optional(),
});

interface AddScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: any[];
  existingSchedules: any[];
  onSuccess: () => void;
}

const BLOQUES_CLASE_SOLO = BLOQUES_HORARIO.filter((b) => b.tipo === "clase");

export function AddScheduleDialog({
  isOpen,
  onOpenChange,
  courses,
  existingSchedules = [],
  onSuccess,
}: AddScheduleDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cursoId: "",
      diaSemana: "",
      duracion: "SIMPLE",
      horaInicio: "",
      horaFin: "",
      aula: "",
    },
  });

  // Lógica para carga horaria
  const selectedCursoId = form.watch("cursoId");
  const selectedDuracion = form.watch("duracion");
  const selectedCurso = courses.find((c) => c.id === selectedCursoId);

  // Función para convertir HH:MM a minutos totales
  const toMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Calcular horas pedagógicas reales registradas (cada 45 min = 1 hora pedagógica)
  const horasRegistradas = existingSchedules
    .filter((h) => h.cursoId === selectedCursoId)
    .reduce((acc, curr) => {
      const duracionMin = toMin(curr.horaFin) - toMin(curr.horaInicio);
      return acc + Math.round(duracionMin / 45);
    }, 0);

  const totalHorasMalla = selectedCurso?.horasSemanales || 0;
  const nuevasHoras = selectedDuracion === "DOBLE" ? 2 : 1;
  const limiteAlcanzado =
    totalHorasMalla > 0 && horasRegistradas + nuevasHoras > totalHorasMalla;

  const onSubmit = async (values: any) => {
    if (limiteAlcanzado) {
      toast.warning("Esta asignación superará la carga académica sugerida");
    }

    setLoading(true);
    try {
      const { duracion, ...data } = values;
      const res = await upsertHorarioAction({
        ...data,
        diaSemana: parseInt(values.diaSemana),
      });

      if (res.success) {
        toast.success(res.success);
        onSuccess();
        onOpenChange(false);
        form.reset();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Asignar Hora de Clase"
      description="Selecciona el curso, duración y horario."
      className="sm:max-w-[480px]"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
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
                        "text-[9px] h-5 transition-all",
                        !limiteAlcanzado &&
                          "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      )}
                    >
                      {limiteAlcanzado ? (
                        <IconAlertTriangle className="size-2.5 mr-1" />
                      ) : (
                        <IconCheck className="size-2.5 mr-1" />
                      )}
                      {horasRegistradas} + {nuevasHoras} / {totalHorasMalla}{" "}
                      Horas
                    </Badge>
                  )}
                </div>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full w-full rounded-full">
                      <SelectValue placeholder="Seleccione un curso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-[#09090b] border-white/10">
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-bold">{course.nombre}</span>
                          <span className="text-[10px] opacity-50 flex items-center gap-1 uppercase">
                            <IconUser className="size-3" />{" "}
                            {course.profesor.name}{" "}
                            {course.profesor.apellidoPaterno}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="diaSemana"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                    Día
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
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
                      // Reset hora inicio al cambiar duración para forzar re-cálculo
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
                        (b: any) => b.inicio === val,
                      );
                      if (bloqueActual) {
                        if (selectedDuracion === "SIMPLE") {
                          form.setValue("horaFin", bloqueActual.fin);
                        } else {
                          // Bloque Doble: Siguiente bloque de clase
                          const indexSiguiente =
                            BLOQUES_CLASE_SOLO.findIndex(
                              (b: any) => b.inicio === val,
                            ) + 1;
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
                      {BLOQUES_CLASE_SOLO.map((b: any) => (
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

          <FormField
            control={form.control}
            name="aula"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  Aula (Opcional)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej. Aula 102"
                    {...field}
                    className="w-full rounded-full transition-all focus:bg-white/10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className={cn(
                "w-full rounded-full transition-all duration-300 shadow-lg",
                limiteAlcanzado
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20",
              )}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Guardar Horario"}
            </Button>
          </div>
        </form>
      </Form>
    </FormModal>
  );
}
