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
import { upsertHorarioAction } from "@/actions/schedules";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Course,
  ScheduleCourseField,
  ScheduleTimingFields,
} from "./schedule-form-fields";

const formSchema = z.object({
  cursoId: z.string().min(1, "Debe seleccionar un curso"),
  diaSemana: z.string().min(1, "Debe seleccionar un día"),
  duracion: z.enum(["SIMPLE", "DOBLE"]),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  aula: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Schedule {
  id: string;
  cursoId: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  aula?: string | null;
}

interface AddScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courses: Course[];
  existingSchedules: Schedule[];
  onSuccess: () => void;
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function AddScheduleDialog({
  isOpen,
  onOpenChange,
  courses,
  existingSchedules = [],
  onSuccess,
}: AddScheduleDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
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

  const selectedCursoId = form.watch("cursoId");
  const selectedDuracion = form.watch("duracion");
  const selectedCurso = courses.find((c) => c.id === selectedCursoId);

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

  const onSubmit = async (values: FormValues) => {
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
          <ScheduleCourseField
            form={form}
            courses={courses}
            selectedCurso={selectedCurso}
            limiteAlcanzado={limiteAlcanzado}
            horasRegistradas={horasRegistradas}
            nuevasHoras={nuevasHoras}
            totalHorasMalla={totalHorasMalla}
          />

          <ScheduleTimingFields
            form={form}
            selectedDuracion={selectedDuracion}
          />

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
                    className="w-full rounded-full transition-colors focus:bg-white/10"
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
                "w-full rounded-full transition-transform duration-300 shadow-lg hover:scale-105",
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
