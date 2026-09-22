"use client";

import * as React from "react";
import { useForm, type Resolver, type SubmitHandler, type UseFormReturn } from "react-hook-form";
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
  email: z.email("Email inválido").or(z.literal("")).optional().default(""),
  cicloEscolarActual: z.coerce
    .number()
    .min(2000)
    .max(2100)
    .default(() => new Date().getFullYear()),
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

const STEP_FIELDS: Record<number, (keyof OnboardingFormValues)[]> = {
  0: ["nombreInstitucion", "codigoModular", "tipoGestion", "modalidad"],
  1: ["ugel", "dre", "direccion", "distrito", "provincia", "departamento"],
  2: ["cicloEscolarActual", "fechaInicioClases", "fechaFinClases"],
};

const INPUT_CLASS =
  "bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20 rounded-xl h-11 transition-[border-color,box-shadow]";
const LABEL_CLASS = "text-xs font-semibold text-zinc-400 uppercase tracking-wider";

function OnboardingHeader() {
  return (
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
  );
}

function OnboardingStepIndicator({
  currentStep,
  onSelectStep,
}: {
  currentStep: number;
  onSelectStep: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, index) => {
        const StepIcon = step.icon;
        const isActive = index === currentStep;
        const isComplete = index < currentStep;
        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <div
                className={`h-[2px] w-8 sm:w-12 rounded-full transition-colors duration-500 ${
                  isComplete ? "bg-primary" : "bg-white/10"
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => {
                if (isComplete) onSelectStep(index);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-300 ${
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
  );
}

function StepIdentidad({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  const { register, formState: { errors }, watch, setValue } = form;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 animation-duration-">
      <div className="space-y-2">
        <Label className={LABEL_CLASS}>Nombre de la Institución *</Label>
        <Input
          {...register("nombreInstitucion")}
          placeholder="Ej: I.E.P. San Martín de Porres"
          className={INPUT_CLASS}
        />
        {errors.nombreInstitucion && (
          <p className="text-xs text-red-400">{errors.nombreInstitucion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className={LABEL_CLASS}>Código Modular *</Label>
        <Input
          {...register("codigoModular")}
          placeholder="Ej: 1234567"
          maxLength={10}
          className={INPUT_CLASS}
        />
        {errors.codigoModular && (
          <p className="text-xs text-red-400">{errors.codigoModular.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Tipo de Gestión *</Label>
          <Select
            value={watch("tipoGestion")}
            onValueChange={(v) => setValue("tipoGestion", v as OnboardingFormValues["tipoGestion"])}
          >
            <SelectTrigger className={INPUT_CLASS}>
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
          <Label className={LABEL_CLASS}>Modalidad *</Label>
          <Select
            value={watch("modalidad")}
            onValueChange={(v) => setValue("modalidad", v as OnboardingFormValues["modalidad"])}
          >
            <SelectTrigger className={INPUT_CLASS}>
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
  );
}

function StepUbicacion({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 animation-duration-">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>UGEL *</Label>
          <Input
            {...register("ugel")}
            placeholder="Ej: UGEL 03"
            className={INPUT_CLASS}
          />
          {errors.ugel && <p className="text-xs text-red-400">{errors.ugel.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>DRE *</Label>
          <Input
            {...register("dre")}
            placeholder="Ej: DRE Lima Metropolitana"
            className={INPUT_CLASS}
          />
          {errors.dre && <p className="text-xs text-red-400">{errors.dre.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label className={LABEL_CLASS}>Dirección *</Label>
        <Input
          {...register("direccion")}
          placeholder="Ej: Av. La Educación 456"
          className={INPUT_CLASS}
        />
        {errors.direccion && <p className="text-xs text-red-400">{errors.direccion.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Departamento *</Label>
          <Input
            {...register("departamento")}
            placeholder="Ej: Lima"
            className={INPUT_CLASS}
          />
          {errors.departamento && <p className="text-xs text-red-400">{errors.departamento.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Provincia *</Label>
          <Input
            {...register("provincia")}
            placeholder="Ej: Lima"
            className={INPUT_CLASS}
          />
          {errors.provincia && <p className="text-xs text-red-400">{errors.provincia.message}</p>}
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Distrito *</Label>
          <Input
            {...register("distrito")}
            placeholder="Ej: San Isidro"
            className={INPUT_CLASS}
          />
          {errors.distrito && <p className="text-xs text-red-400">{errors.distrito.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Teléfono</Label>
          <Input
            {...register("telefono")}
            placeholder="Ej: 01-234-5678"
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Email Institucional</Label>
          <Input
            {...register("email")}
            type="email"
            placeholder="Ej: contacto@colegio.edu.pe"
            className={INPUT_CLASS}
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
      </div>
    </div>
  );
}

function StepCalendario({ form }: { form: UseFormReturn<OnboardingFormValues> }) {
  const { register, formState: { errors }, watch } = form;

  const summaryLocation = watch("distrito")
    ? `${watch("distrito")}, ${watch("departamento")}`
    : "—";

  const summaryCalendar =
    watch("fechaInicioClases") && watch("fechaFinClases")
      ? `${watch("fechaInicioClases")} → ${watch("fechaFinClases")}`
      : "—";

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 animation-duration-">
      <div className="space-y-2">
        <Label className={LABEL_CLASS}>Año Escolar Actual *</Label>
        <Input
          type="number"
          {...register("cicloEscolarActual", { valueAsNumber: true })}
          className={INPUT_CLASS}
        />
        {errors.cicloEscolarActual && (
          <p className="text-xs text-red-400">{errors.cicloEscolarActual.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Fecha de Inicio de Clases *</Label>
          <Input
            type="date"
            {...register("fechaInicioClases")}
            className={INPUT_CLASS}
          />
          {errors.fechaInicioClases && (
            <p className="text-xs text-red-400">{errors.fechaInicioClases.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className={LABEL_CLASS}>Fecha de Fin de Clases *</Label>
          <Input
            type="date"
            {...register("fechaFinClases")}
            className={INPUT_CLASS}
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
              {summaryLocation}
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
              {summaryCalendar}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepNavigationButtons({
  currentStep,
  isPending,
  onPrev,
  onNext,
}: {
  currentStep: number;
  isPending: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex items-center justify-between pt-8">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrev}
        disabled={currentStep === 0}
        className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl gap-2"
      >
        <IconArrowLeft className="size-4" />
        Anterior
      </Button>

      {isLastStep ? (
        <Button
          type="submit"
          disabled={isPending}
          className="bg-gradient-to-r from-zinc-900 to-violet-600 hover:from-zinc-800 hover:to-violet-500 text-white rounded-xl gap-2 px-8 shadow-lg shadow-primary/25 transition-[background-image,transform] hover:scale-[1.02] active:scale-95"
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
      ) : (
        <Button
          type="button"
          onClick={onNext}
          className="rounded-xl gap-2 px-6 shadow-lg shadow-primary/20 transition-transform hover:scale-[1.02] active:scale-95"
        >
          Siguiente
          <IconArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

export default function OnboardingInstitucionPage() {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isPending, setIsPending] = React.useState(false);
  const router = useRouter();

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema) as Resolver<OnboardingFormValues>,
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

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] || [];
    const isValid = await form.trigger(fieldsToValidate);
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
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      } else {
        toast.error(res.error || "Error al crear la institución");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error inesperado al guardar los datos");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <OnboardingHeader />
      <OnboardingStepIndicator
        currentStep={currentStep}
        onSelectStep={setCurrentStep}
      />

      <div className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 sm:p-8 space-y-6 shadow-lg">
        <div className="space-y-1">
          <h2 className="text-lg font-bold">{STEPS[currentStep].title}</h2>
          <p className="text-sm text-zinc-400">
            {STEPS[currentStep].description}
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit as SubmitHandler<OnboardingFormValues>)}>
          {currentStep === 0 && <StepIdentidad form={form} />}
          {currentStep === 1 && <StepUbicacion form={form} />}
          {currentStep === 2 && <StepCalendario form={form} />}

          <StepNavigationButtons
            currentStep={currentStep}
            isPending={isPending}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </form>
      </div>
    </div>
  );
}
