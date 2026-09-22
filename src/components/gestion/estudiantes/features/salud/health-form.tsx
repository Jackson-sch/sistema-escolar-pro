"use client";

import { useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { updateStudentAction } from "@/actions/students";
import {
  HealthAndInfoSchema,
  HealthAndInfoValues,
} from "@/lib/schemas/student";
import { useFormModal } from "@/components/modals/form-modal-context";

import { MedicalSection } from "./components/medical-section";
import { ComplementarySection } from "./components/complementary-section";
import { HealthFormActions } from "./components/health-form-actions";

interface HealthFormProps {
  studentId: string;
  initialData?: Partial<HealthAndInfoValues>;
  onSuccess?: () => void;
}

function getHealthFormDefaultValues(initialData?: Partial<HealthAndInfoValues>): HealthAndInfoValues {
  return {
    tipoSangre: initialData?.tipoSangre || "",
    alergias: initialData?.alergias || "",
    condicionesMedicas: initialData?.condicionesMedicas || "",
    medicamentos: initialData?.medicamentos || "",
    seguroMedico: initialData?.seguroMedico || "",
    discapacidades: initialData?.discapacidades || "",
    carnetConadis: initialData?.carnetConadis || "",
    restriccionesAlimenticias: initialData?.restriccionesAlimenticias || "",
    centroSaludPreferido: initialData?.centroSaludPreferido || "",
    peso: initialData?.peso || 0,
    talla: initialData?.talla || 0,
    parentescoContactoEmergencia: initialData?.parentescoContactoEmergencia || "",
    nombreContactoEmergencia2: initialData?.nombreContactoEmergencia2 || "",
    telefonoContactoEmergencia2: initialData?.telefonoContactoEmergencia2 || "",
    parentescoContactoEmergencia2: initialData?.parentescoContactoEmergencia2 || "",
    paisNacimiento: initialData?.paisNacimiento || "PERÚ",
    lugarNacimiento: initialData?.lugarNacimiento || "",
    lenguaMaterna: initialData?.lenguaMaterna || "ESPAÑOL",
    religion: initialData?.religion || "",
    numeroHermanos: initialData?.numeroHermanos || 0,
  };
}

export function HealthForm({
  studentId,
  initialData,
  onSuccess,
}: HealthFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<HealthAndInfoValues>({
    resolver: zodResolver(HealthAndInfoSchema) as any,
    defaultValues: getHealthFormDefaultValues(initialData),
  });

  const onSubmit = (values: HealthAndInfoValues) => {
    startTransition(async () => {
      try {
        const result = await updateStudentAction(studentId, values);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Información de salud y bienestar actualizada");
          setIsDirty(false);
          onSuccess?.();
        }
      } catch {
        toast.error("Ocurrió un error al guardar los cambios");
      }
    });
  };

  const onSubmitRef = useRef(onSubmit);
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5 px-1 py-1"
      >
        {/* SECCIÓN 1: SALUD Y BIENESTAR */}
        <MedicalSection control={form.control} />

        {/* SECCIÓN 2: DATOS COMPLEMENTARIOS Y EMERGENCIA */}
        <ComplementarySection control={form.control} />

        {/* Acciones del Formulario */}
        <HealthFormActions
          isPending={isPending}
          onCancel={() => onSuccess?.()}
        />
      </form>
    </Form>
  );
}

export type { HealthFormProps };
