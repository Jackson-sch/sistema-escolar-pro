"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formats";
import {
  updateAdmisionResultAction,
  convertProspectoToAdmisionAction,
  convertProspectoToEstudianteAction,
} from "@/actions/admissions";
import { toast } from "sonner";
import {
  IconCalendarEvent,
  IconClipboardCheck,
  IconAlertCircle,
  IconLoader2,
  IconUserPlus,
  IconId,
  IconPhone,
  IconMail,
  IconUser,
  IconCheck,
} from "@tabler/icons-react";
import { es } from "date-fns/locale";

const flowSchema = z.object({
  fechaEntrevista: z.date().optional().nullable(),
  resultadoExamen: z.string().optional(),
  observaciones: z.string().optional(),
  estadoFinal: z.enum(["INTERESADO", "EVALUANDO", "ADMITIDO", "RECHAZADO"]),
});

const STATUS_BADGE_STYLES: Record<string, string> = {
  INTERESADO: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  EVALUANDO: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  ADMITIDO: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  RECHAZADO: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  MATRICULADO: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

interface AdmisionFlowProps {
  prospecto: any;
  onSuccess: () => void;
}

function getAdmisionFlowDefaults(admision: any, currentStatus: string) {
  return {
    fechaEntrevista: admision.fechaEntrevista ? new Date(admision.fechaEntrevista) : null,
    resultadoExamen: admision.resultadoExamen || "",
    observaciones: admision.observaciones || "",
    estadoFinal: currentStatus === "MATRICULADO" ? ("ADMITIDO" as const) : (currentStatus as any),
  };
}

function PostulanteHeader({ prospecto, currentStatus }: { prospecto: any; currentStatus: string }) {
  const fullName = `${prospecto?.nombre || ""} ${prospecto?.apellidoPaterno || ""} ${prospecto?.apellidoMaterno || ""}`.trim();

  return (
    <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            <IconUser size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-foreground leading-tight">
              {fullName}
            </h3>
            <p className="text-xxs font-mono text-muted-foreground">
              DNI: {prospecto?.dni || "No registrado"}
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn("text-[10px] font-bold uppercase", STATUS_BADGE_STYLES[currentStatus])}
        >
          {currentStatus}
        </Badge>
      </div>

      <div className="pt-2 border-t border-border/30 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {prospecto?.telefono && (
          <span className="flex items-center gap-1">
            <IconPhone size={13} className="text-emerald-500" />
            {prospecto.telefono}
          </span>
        )}
        {prospecto?.email && (
          <span className="flex items-center gap-1">
            <IconMail size={13} className="text-primary" />
            {prospecto.email}
          </span>
        )}
      </div>
    </div>
  );
}

function MatricularBanner({
  isGenerating,
  onGenerateStudent,
}: {
  isGenerating: boolean;
  onGenerateStudent: () => void;
}) {
  return (
    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
      <div className="size-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-600 mx-auto">
        <IconUserPlus size={20} />
      </div>
      <div>
        <h4 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-300">
          ¡Postulante Aprobado para Matrícula!
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Genera automáticamente el expediente y la matrícula oficial en el sistema.
        </p>
      </div>

      <Button
        onClick={onGenerateStudent}
        disabled={isGenerating}
        className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
      >
        {isGenerating ? (
          <>
            <IconLoader2 className="mr-2 size-4 animate-spin" />
            Matriculando en el sistema...
          </>
        ) : (
          <>
            <IconUserPlus className="mr-1.5 size-4" />
            Matricular Oficialmente (Convertir a Alumno)
          </>
        )}
      </Button>
    </div>
  );
}

export function AdmisionFlow({ prospecto, onSuccess }: AdmisionFlowProps) {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const admision = prospecto?.admision || {};
  const currentStatus = prospecto?.estado || "INTERESADO";

  const form = useForm<z.infer<typeof flowSchema>>({
    resolver: zodResolver(flowSchema),
    defaultValues: getAdmisionFlowDefaults(admision, currentStatus),
  });

  const onSubmit = async (values: z.infer<typeof flowSchema>) => {
    setLoading(true);
    try {
      const { estadoFinal, ...data } = values;

      let targetAdmisionId = admision.id;

      // Si no existe registro formal de admisión, crearlo primero
      if (!targetAdmisionId) {
        const createRes = await convertProspectoToAdmisionAction({
          prospectoId: prospecto.id,
        });
        if (createRes?.data?.id) {
          targetAdmisionId = createRes.data.id;
        } else if (createRes?.error) {
          toast.error(createRes.error);
          return;
        }
      }

      if (targetAdmisionId) {
        const res = await updateAdmisionResultAction({
          admisionId: targetAdmisionId,
          values: data,
          finalStatus: estadoFinal as any,
        });

        if (res.success) {
          toast.success(res.success);
          onSuccess();
        } else {
          toast.error(res.error || "No se pudo actualizar el resultado");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar los datos de admisión");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStudent = async () => {
    setIsGenerating(true);
    try {
      const res = await convertProspectoToEstudianteAction({
        prospectoId: prospecto.id,
      });
      if (res.success) {
        toast.success(res.success);
        router.push("/gestion/matriculas");
        onSuccess();
      } else {
        toast.error(res.error || "No se pudo matricular al estudiante");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar la matrícula");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PostulanteHeader prospecto={prospecto} currentStatus={currentStatus} />

      {/* ── FORMULARIO DE EVALUACIÓN ── */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Fecha de Entrevista */}
            <FormField
              control={form.control}
              name="fechaEntrevista"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs font-bold text-foreground">
                    Fecha de Entrevista / Examen
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-9 pl-3 text-left font-medium text-xs bg-background border-border/60 hover:bg-muted/10 rounded-xl justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value)
                          ) : (
                            <span>Programar fecha...</span>
                          )}
                          <IconCalendarEvent className="size-4 text-muted-foreground opacity-70" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-2xl shadow-lg border-border/60" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Decisión / Estado */}
            <FormField
              control={form.control}
              name="estadoFinal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    Dictamen de Vacante
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 border-border/60 bg-background rounded-xl text-xs font-bold">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="EVALUANDO" className="text-xs font-medium">
                        🟡 En Evaluación
                      </SelectItem>
                      <SelectItem value="ADMITIDO" className="text-xs font-bold text-emerald-600">
                        🟢 Admitir (Aprobar Vacante)
                      </SelectItem>
                      <SelectItem value="RECHAZADO" className="text-xs font-bold text-rose-600">
                        🔴 Rechazar Solicitud
                      </SelectItem>
                      <SelectItem value="INTERESADO" className="text-xs font-medium">
                        🔵 Devolver a Interesados
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Resultado del Examen */}
          <FormField
            control={form.control}
            name="resultadoExamen"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">
                  Puntaje / Resultado del Examen
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 18.5/20 - Sobresaliente, Buen desempeño en lógica y lenguaje"
                    {...field}
                    className="h-9 text-xs rounded-xl border-border/60 bg-background"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observaciones Psicopedagógicas */}
          <FormField
            control={form.control}
            name="observaciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold text-foreground">
                  Informe Psicopedagógico & Observaciones
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escriba aquí los detalles de la entrevista familiar, conducta, desarrollo social o compromisos asumidos..."
                    rows={4}
                    {...field}
                    className="text-xs rounded-xl border-border/60 bg-background resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-9.5 rounded-xl text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
              disabled={loading || currentStatus === "MATRICULADO"}
            >
              {loading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconCheck className="size-4" />
              )}
              <span>Guardar Evaluación & Actualizar Estado</span>
            </Button>
          </div>
        </form>
      </Form>

      {currentStatus === "ADMITIDO" && (
        <MatricularBanner
          isGenerating={isGenerating}
          onGenerateStudent={handleGenerateStudent}
        />
      )}

      {currentStatus === "MATRICULADO" && (
        <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
          <p className="text-xs font-bold text-violet-600 dark:text-violet-400">
            ✓ Este postulante ya fue matriculado formalmente como estudiante de la institución.
          </p>
        </div>
      )}
    </div>
  );
}
