"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import * as z from "zod";
import {
  IconSchool,
  IconBuilding,
  IconMapPin,
  IconCalendar,
  IconArrowRight,
  IconArrowLeft,
  IconLoader2,
  IconRocket,
  IconCheck,
  IconSparkles,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInstitucionAction } from "@/actions/institucion";

// Schema de validación
const onboardingSchema = z.object({
  nombreInstitucion: z.string().min(2, "Mínimo 2 caracteres"),
  codigoModular: z.string().min(7, "El código modular debe tener al menos 7 dígitos"),
  tipoGestion: z.enum(["PUBLICA", "PRIVADA", "PARROQUIAL", "CONVENIO"]),
  modalidad: z.enum(["PRESENCIAL", "DISTANCIA", "SEMIPRESENCIAL"]),
  ugel: z.string().min(1, "La UGEL es requerida"),
  dre: z.string().min(1, "La DRE es requerida"),
  direccion: z.string().min(1, "La dirección es requerida"),
  distrito: z.string().min(1, "El distrito es requerido"),
  provincia: z.string().min(1, "La provincia es requerida"),
  departamento: z.string().min(1, "El departamento es requerido"),
  telefono: z.string().optional().default(""),
  email: z.string().email("Email inválido").or(z.literal("")).optional().default(""),
  cicloEscolarActual: z.coerce.number().min(2000).max(2100).default(new Date().getFullYear()),
  fechaInicioClases: z.string().min(1, "Fecha de inicio requerida"),
  fechaFinClases: z.string().min(1, "Fecha de fin requerida"),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const STEPS = [
  {
    id: "identidad",
    title: "Identidad Institucional",
    description: "Datos básicos de tu institución educativa",
    icon: IconSchool,
  },
  {
    id: "ubicacion",
    title: "Ubicación y Contacto",
    description: "¿Dónde queda tu institución?",
    icon: IconMapPin,
  },
  {
    id: "academico",
    title: "Calendario Académico",
    description: "Configura el año escolar",
    icon: IconCalendar,
  },
];

export default function OnboardingInstitucionPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      nombreInstitucion: "",
      codigoModular: "",
      tipoGestion: "PRIVADA",
      modalidad: "PRESENCIAL",
      ugel: "",
      dre: "",
      direccion: "",
      distrito: "",
      provincia: "",
      departamento: "",
      telefono: "",
      email: "",
      cicloEscolarActual: new Date().getFullYear(),
      fechaInicioClases: `${new Date().getFullYear()}-03-01`,
      fechaFinClases: `${new Date().getFullYear()}-12-20`,
    },
    mode: "onChange",
  });

  const { register, formState: { errors }, trigger, watch } = form;

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ["nombreInstitucion", "codigoModular", "tipoGestion", "modalidad"];
        break;
      case 1:
        fieldsToValidate = ["ugel", "dre", "direccion", "distrito", "provincia", "departamento"];
        break;
      case 2:
        fieldsToValidate = ["cicloEscolarActual", "fechaInicioClases", "fechaFinClases"];
        break;
    }

    return await trigger(fieldsToValidate);
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = async (values: OnboardingFormValues) => {
    setIsPending(true);
    try {
      const res = await createInstitucionAction(values);

      if (res.success) {
        toast.success("¡Institución creada exitosamente! Redirigiendo...");
        // Small delay for the toast to show
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else {
        toast.error(res.error || "Error al crear la institución");
        setIsPending(false);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error inesperado al guardar los datos");
      setIsPending(false);
    }
  };

  const inputClass =
    "bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11 transition-all";
  const labelClass = "text-xs font-semibold text-zinc-400 uppercase tracking-wider";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Hero header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
          <IconSparkles className="size-3.5" />
          Configuración Inicial
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Crea tu Institución
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Completa los datos de tu institución educativa para comenzar a usar
          todas las funcionalidades del sistema.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={`h-[2px] w-8 sm:w-12 rounded-full transition-all duration-500 ${
                    isComplete ? "bg-primary" : "bg-white/10"
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (isComplete) setCurrentStep(index);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/10"
                    : isComplete
                      ? "bg-green-500/10 text-green-400 border border-green-500/20 cursor-pointer hover:bg-green-500/15"
                      : "bg-white/5 text-zinc-500 border border-white/5"
                }`}
              >
                {isComplete ? (
                  <IconCheck className="size-4" />
                ) : (
                  <StepIcon className="size-4" />
                )}
                <span className="hidden sm:inline">{step.title}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Form card */}
      <div className="liquid-glass rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">{STEPS[currentStep].title}</h2>
          <p className="text-sm text-zinc-400">
            {STEPS[currentStep].description}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit as any)}>
          {/* Step 1: Identidad */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className={labelClass}>Nombre de la Institución *</Label>
                <Input
                  {...register("nombreInstitucion")}
                  placeholder="Ej: I.E.P. San Martín de Porres"
                  className={inputClass}
                />
                {errors.nombreInstitucion && (
                  <p className="text-xs text-red-400">{errors.nombreInstitucion.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Código Modular *</Label>
                <Input
                  {...register("codigoModular")}
                  placeholder="Ej: 1234567"
                  maxLength={10}
                  className={inputClass}
                />
                {errors.codigoModular && (
                  <p className="text-xs text-red-400">{errors.codigoModular.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Tipo de Gestión *</Label>
                  <Select
                    value={watch("tipoGestion")}
                    onValueChange={(v) => form.setValue("tipoGestion", v as any)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRIVADA">Privada</SelectItem>
                      <SelectItem value="PUBLICA">Pública</SelectItem>
                      <SelectItem value="PARROQUIAL">Parroquial</SelectItem>
                      <SelectItem value="CONVENIO">Convenio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className={labelClass}>Modalidad *</Label>
                  <Select
                    value={watch("modalidad")}
                    onValueChange={(v) => form.setValue("modalidad", v as any)}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                      <SelectItem value="DISTANCIA">A Distancia</SelectItem>
                      <SelectItem value="SEMIPRESENCIAL">Semipresencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Ubicación */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>UGEL *</Label>
                  <Input
                    {...register("ugel")}
                    placeholder="Ej: UGEL 03"
                    className={inputClass}
                  />
                  {errors.ugel && <p className="text-xs text-red-400">{errors.ugel.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>DRE *</Label>
                  <Input
                    {...register("dre")}
                    placeholder="Ej: DRE Lima Metropolitana"
                    className={inputClass}
                  />
                  {errors.dre && <p className="text-xs text-red-400">{errors.dre.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Dirección *</Label>
                <Input
                  {...register("direccion")}
                  placeholder="Ej: Av. La Educación 456"
                  className={inputClass}
                />
                {errors.direccion && <p className="text-xs text-red-400">{errors.direccion.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Departamento *</Label>
                  <Input
                    {...register("departamento")}
                    placeholder="Ej: Lima"
                    className={inputClass}
                  />
                  {errors.departamento && <p className="text-xs text-red-400">{errors.departamento.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Provincia *</Label>
                  <Input
                    {...register("provincia")}
                    placeholder="Ej: Lima"
                    className={inputClass}
                  />
                  {errors.provincia && <p className="text-xs text-red-400">{errors.provincia.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Distrito *</Label>
                  <Input
                    {...register("distrito")}
                    placeholder="Ej: San Isidro"
                    className={inputClass}
                  />
                  {errors.distrito && <p className="text-xs text-red-400">{errors.distrito.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Teléfono</Label>
                  <Input
                    {...register("telefono")}
                    placeholder="Ej: 01-234-5678"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Email Institucional</Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="Ej: contacto@colegio.edu.pe"
                    className={inputClass}
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Calendario */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Label className={labelClass}>Año Escolar Actual *</Label>
                <Input
                  type="number"
                  {...register("cicloEscolarActual", { valueAsNumber: true })}
                  className={inputClass}
                />
                {errors.cicloEscolarActual && (
                  <p className="text-xs text-red-400">{errors.cicloEscolarActual.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={labelClass}>Fecha de Inicio de Clases *</Label>
                  <Input
                    type="date"
                    {...register("fechaInicioClases")}
                    className={inputClass}
                  />
                  {errors.fechaInicioClases && (
                    <p className="text-xs text-red-400">{errors.fechaInicioClases.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Fecha de Fin de Clases *</Label>
                  <Input
                    type="date"
                    {...register("fechaFinClases")}
                    className={inputClass}
                  />
                  {errors.fechaFinClases && (
                    <p className="text-xs text-red-400">{errors.fechaFinClases.message}</p>
                  )}
                </div>
              </div>

              {/* Summary preview */}
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <IconBuilding className="size-4 text-primary" />
                  Resumen de tu Institución
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-zinc-500">Nombre</span>
                    <p className="text-zinc-200 font-medium truncate">
                      {watch("nombreInstitucion") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Código Modular</span>
                    <p className="text-zinc-200 font-medium">
                      {watch("codigoModular") || "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Gestión</span>
                    <p className="text-zinc-200 font-medium">
                      {watch("tipoGestion")}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Ubicación</span>
                    <p className="text-zinc-200 font-medium truncate">
                      {watch("distrito") ? `${watch("distrito")}, ${watch("departamento")}` : "—"}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Año Escolar</span>
                    <p className="text-zinc-200 font-medium">
                      {watch("cicloEscolarActual")}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Calendario</span>
                    <p className="text-zinc-200 font-medium">
                      {watch("fechaInicioClases") && watch("fechaFinClases")
                        ? `${watch("fechaInicioClases")} → ${watch("fechaFinClases")}`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl gap-2"
            >
              <IconArrowLeft className="size-4" />
              Anterior
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className="rounded-xl gap-2 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                Siguiente
                <IconArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isPending}
                className="bg-gradient-to-r from-zinc-900 to-violet-600 hover:from-zinc-800 hover:to-violet-500 text-white rounded-xl gap-2 px-8 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="size-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <IconRocket className="size-4" />
                    Crear Institución
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
