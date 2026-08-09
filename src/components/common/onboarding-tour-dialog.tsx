"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconSparkles,
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconReceipt,
  IconClipboardCheck,
  IconSearch,
  IconHelpCircle,
  IconSchool,
  type Icon,
} from "@tabler/icons-react";

interface StepItem {
  title: string;
  description: string;
  icon: Icon;
  highlightText: string;
}

interface OnboardingTourDialogProps {
  userRole?: string;
}

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const STEPS_PADRE: StepItem[] = [
  {
    title: 'Resumen "De un Vistazo"',
    description:
      "Al ingresar al portal verás inmediatamente la asistencia del día de tu hijo, estado de pensiones y próximos avisos.",
    icon: IconSchool,
    highlightText: "¡Todo consolidado en la pantalla principal!",
  },
  {
    title: "Estado de Cuentas y Pagos",
    description:
      "Consulta pensiones por vencer, historial de pagos y sube tus comprobantes de pago fácilmente desde tu smartphone o PC.",
    icon: IconReceipt,
    highlightText: "Subida de vouchers en segundos con validación rápida.",
  },
  {
    title: "Boletas y Calificaciones",
    description:
      "Revisa las notas académicas del bimestre/trimestre y descarga las boletas oficiales en formato PDF.",
    icon: IconClipboardCheck,
    highlightText: "Descarga de reportes académicos firmados.",
  },
];

const STEPS_STAFF: StepItem[] = [
  {
    title: "Omnisearch y Búsqueda con Ctrl + K",
    description:
      "Presiona Ctrl + K (o ⌘K) en cualquier momento o usa la barra superior para buscar estudiantes por DNI, nombres o código.",
    icon: IconSearch,
    highlightText: "Búsqueda instantánea desde cualquier pantalla del sistema.",
  },
  {
    title: "Carga de Notas Estilo Spreadsheet",
    description:
      "Ingresa calificaciones masivas tabulando con las teclas Enter y Flechas como en Excel. Tus datos se guardan en borrador automáticamente.",
    icon: IconClipboardCheck,
    highlightText: "Auto-selección al enfocar celdas y guardado optimista.",
  },
  {
    title: "Control de Asistencia Express",
    description:
      "Marca 'Todos Presentes' en un solo clic y modifica únicamente las tardanzas o faltas de la sesión.",
    icon: IconSchool,
    highlightText: "Registro de asistencia en 2 clics para el aula.",
  },
];

function useIsMounted() {
  return React.useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

export function OnboardingTourDialog({ userRole = "padre" }: OnboardingTourDialogProps) {
  const mounted = useIsMounted();
  const [open, setOpen] = React.useState(false);
  const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

  const isPadre = userRole === "padre";

  React.useEffect(() => {
    const handleReopen = () => {
      setCurrentStepIndex(0);
      setOpen(true);
    };
    window.addEventListener("open-onboarding-tour", handleReopen);
    return () => window.removeEventListener("open-onboarding-tour", handleReopen);
  }, []);

  if (!mounted) return null;

  const steps = isPadre ? STEPS_PADRE : STEPS_STAFF;
  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = () => {
    setOpen(false);
  };

  const IconComponent = currentStep.icon;

  return (
    <>
      {/* Botón flotante de ayuda / tour en la esquina inferior (solo si el usuario desea abrir la guía) */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setCurrentStepIndex(0);
          setOpen(true);
        }}
        title="Ver Guía del Sistema / Tour"
        className="fixed bottom-5 right-5 z-40 size-11 rounded-full border border-primary/30 bg-background/95 shadow-lg hover:bg-primary/10 hover:text-primary transition-[color,background-color,transform] hover:scale-110 active:scale-95"
      >
        <IconHelpCircle className="size-5 text-primary" />
      </Button>

      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-2xl p-6 md:p-8 border border-border/50 bg-card/90 shadow-lg">
            <DialogHeader className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1">
                  <IconSparkles className="size-3.5 mr-1" />
                  Guía Rápida · Paso {currentStepIndex + 1} de {steps.length}
                </Badge>
              </div>
              <DialogTitle className="text-xl md:text-2xl font-black tracking-tight">
                {currentStep.title}
              </DialogTitle>
              <DialogDescription className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
                {currentStep.description}
              </DialogDescription>
            </DialogHeader>

            {/* Step Feature Card */}
            <div className="my-4 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                  <IconComponent className="size-5" />
                </div>
                <p className="text-xs font-bold text-primary">
                  {currentStep.highlightText}
                </p>
              </div>
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-[background-color,width] duration-300 ${
                      idx === currentStepIndex
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {currentStepIndex > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="rounded-xl font-bold text-xs"
                  >
                    <IconArrowLeft className="size-4 mr-1" />
                    Anterior
                  </Button>
                )}

                <Button
                  size="sm"
                  onClick={handleNext}
                  className="rounded-xl font-bold text-xs px-4 shadow-md shadow-primary/20"
                >
                  {currentStepIndex === steps.length - 1 ? (
                    <>
                      ¡Entendido!
                      <IconCheck className="size-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Siguiente
                      <IconArrowRight className="size-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
