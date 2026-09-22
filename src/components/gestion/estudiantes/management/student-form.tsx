"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect, useRef, useMemo } from "react";
import { StudentSchema, StudentValues } from "@/lib/schemas/student";
import { Form } from "@/components/ui/form";
import {
  createStudentAction,
  updateStudentAction,
  getGuardianByDniAction,
} from "@/actions/students";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { StudentPersonalSection } from "./components/student-personal-section";
import { StudentAddressSection } from "./components/student-address-section";
import { StudentGuardianSection } from "./components/student-guardian-section";
import { StudentFormActions } from "./components/student-form-actions";

export interface StudentInitialData {
  name?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni?: string;
  email?: string;
  sexo?: string;
  nacionalidad?: string;
  direccion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  ubigeo?: string;
  codigoEstudiante?: string;
  codigoSiagie?: string;
  institucionId?: string;
  estadoId?: string;
  fechaNacimiento?: Date | string | null;
  padresTutores?: Array<{
    contactoPrimario?: boolean;
    parentesco?: string;
    padreTutor?: {
      name?: string | null;
      dni?: string | null;
      telefono?: string | null;
    } | null;
  }>;
}

export interface StudentFormProps {
  id?: string;
  initialData?: StudentInitialData;
  onSuccess?: () => void;
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
}

function getStudentFormDefaultValues(
  initialData?: StudentInitialData,
  instituciones: { id: string; nombreInstitucion: string }[] = [],
  estados: { id: string; nombre: string }[] = []
): any {
  if (initialData) {
    const primaryGuardian = initialData.padresTutores?.find((p) => p.contactoPrimario);

    return {
      name: initialData.name || "",
      apellidoPaterno: initialData.apellidoPaterno || "",
      apellidoMaterno: initialData.apellidoMaterno || "",
      dni: initialData.dni || "",
      email: initialData.email || "",
      sexo: (initialData.sexo as any) || "MASCULINO",
      nacionalidad: initialData.nacionalidad || "PERUANA",
      direccion: initialData.direccion || "",
      departamento: initialData.departamento || "LA LIBERTAD",
      provincia: initialData.provincia || "TRUJILLO",
      distrito: initialData.distrito || "TRUJILLO",
      ubigeo: initialData.ubigeo || "",
      codigoEstudiante: initialData.codigoEstudiante || "",
      codigoSiagie: initialData.codigoSiagie || "",
      institucionId: initialData.institucionId || instituciones[0]?.id || "",
      estadoId: initialData.estadoId || estados[0]?.id || "",
      fechaNacimiento: initialData.fechaNacimiento
        ? new Date(initialData.fechaNacimiento)
        : undefined,
      nombreApoderado: primaryGuardian?.padreTutor?.name || "",
      dniApoderado: primaryGuardian?.padreTutor?.dni || "",
      telefonoApoderado: primaryGuardian?.padreTutor?.telefono || "",
      parentescoApoderado: (primaryGuardian?.parentesco as any) || "PADRE",
    };
  }

  return {
    name: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    dni: "",
    email: "",
    sexo: "MASCULINO",
    nacionalidad: "PERUANA",
    direccion: "",
    departamento: "LA LIBERTAD",
    provincia: "TRUJILLO",
    distrito: "TRUJILLO",
    ubigeo: "",
    codigoEstudiante: "",
    codigoSiagie: "",
    institucionId: instituciones[0]?.id || "",
    estadoId: estados.find((e) => e.nombre === "Activo")?.id || estados[0]?.id || "",
    nombreApoderado: "",
    dniApoderado: "",
    telefonoApoderado: "",
    parentescoApoderado: "PADRE",
  };
}

export function StudentForm({
  id,
  initialData,
  onSuccess,
  instituciones,
  estados,
}: StudentFormProps) {
  const today = useMemo(() => new Date(), []);
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [guardianAutofilled, setGuardianAutofilled] = useState(false);

  const form = useForm<StudentValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: getStudentFormDefaultValues(initialData, instituciones, estados),
  });

  const [calendarMonth, setCalendarMonth] = useState<Date>(
    () => form.getValues("fechaNacimiento") || today,
  );

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = (values: StudentValues) => {
    const formattedValues = {
      ...values,
      fechaNacimiento: values.fechaNacimiento
        ? new Date(values.fechaNacimiento)
        : undefined,
    };

    startTransition(() => {
      const action = id
        ? updateStudentAction(id, formattedValues)
        : createStudentAction(formattedValues);

      action.then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          if (!id) form.reset();
          onSuccess?.();
        }
      });
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

  // Observar cambios en el DNI del apoderado para autocompletar
  const dniApoderado = form.watch("dniApoderado");

  useEffect(() => {
    let ignore = false;
    if (dniApoderado && dniApoderado.length === 8) {
      const searchGuardian = async () => {
        try {
          if (ignore) return;
          const res = await getGuardianByDniAction(dniApoderado);
          if (ignore) return;
          if (res?.data) {
            const fullName = `${res.data.name || ""} ${res.data.apellidoPaterno || ""} ${res.data.apellidoMaterno || ""}`.trim();
            form.setValue("nombreApoderado", fullName, {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("telefonoApoderado", res.data.telefono || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            setGuardianAutofilled(true);
            toast.success("Apoderado registrado encontrado. Datos cargados.");
          } else {
            if (!ignore) setGuardianAutofilled(false);
          }
        } catch (error) {
          console.error("Error searching guardian:", error);
          if (!ignore) setGuardianAutofilled(false);
        }
      };
      searchGuardian();
    } else {
      setGuardianAutofilled(false);
      if (!dniApoderado) {
        form.setValue("nombreApoderado", "");
        form.setValue("telefonoApoderado", "");
      }
    }
    return () => {
      ignore = true;
    };
  }, [dniApoderado, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-1 py-1">
        <StudentPersonalSection
          form={form}
          estados={estados}
          instituciones={instituciones}
          calendarMonth={calendarMonth}
          onCalendarMonthChange={setCalendarMonth}
        />

        <StudentAddressSection form={form} />

        <StudentGuardianSection form={form} guardianAutofilled={guardianAutofilled} />

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones del Formulario */}
        <StudentFormActions isPending={isPending} isEdit={Boolean(id)} onSuccess={onSuccess} />
      </form>
    </Form>
  );
}
