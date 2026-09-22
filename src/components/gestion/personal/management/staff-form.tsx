"use client";

import {
  useForm,
  type FieldError,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef, useEffect, useMemo } from "react";
import { StaffSchema, StaffValues } from "@/lib/schemas/staff";
import { Form } from "@/components/ui/form";
import { createStaffAction, updateStaffAction } from "@/actions/staff";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { PersonalInfoSection } from "./components/personal-info-section";
import { LaboralSection, type CargoOption } from "./components/laboral-section";
import { ProfesionalSection } from "./components/profesional-section";
import { StaffFormActions } from "./components/staff-form-actions";

export interface StaffInitialData {
  email?: string;
  name?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni?: string;
  sexo?: string;
  role?: string;
  cargoId?: string | null;
  area?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  especialidad?: string | null;
  titulo?: string | null;
  numeroContrato?: string | null;
  colegioProfesor?: string | null;
  escalaMagisterial?: string | null;
  fechaIngreso?: Date | string | null;
  estadoId?: string;
  institucionId?: string;
}

export interface StaffFormProps {
  id?: string;
  initialData?: StaffInitialData;
  onSuccess?: () => void;
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
  cargos: CargoOption[];
}

const ROLE_CARGOS_MAPPING: Record<string, string[]> = {
  profesor: [
    "DOCENTE",
    "AUXILIAR",
    "COORD_ACAD",
    "COORD_NIVEL",
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
  ],
  administrativo: [
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
    "TESORERO",
    "SECRETARIA",
    "PSICOLOGO",
    "ENFERMERIA",
    "SISTEMAS",
    "BIBLIOTECARIO",
    "MANTENIMIENTO",
    "VIGILANCIA",
  ],
};

function onError(errors: FieldErrors<StaffValues>) {
  console.error("StaffForm Validation Errors:", errors);
  const errorMessages = (
    Object.values(errors) as (FieldError | undefined)[]
  )
    .map((error) => error?.message)
    .filter((message): message is string => Boolean(message));

  if (errorMessages.length > 0) {
    toast.error(
      "Por favor, revise los siguientes errores: " + errorMessages.join(", "),
    );
  } else {
    toast.error(
      "Verifique los campos requeridos del formulario.",
    );
  }
}

function getStaffFormDefaultValues(
  initialData?: any,
  instituciones: { id: string; nombreInstitucion: string }[] = [],
  estados: { id: string; nombre: string }[] = [],
  cargos: { id: string; codigo: string; nombre: string }[] = []
): StaffValues {
  if (initialData) {
    return {
      ...initialData,
      name: initialData.name || "",
      apellidoPaterno: initialData.apellidoPaterno || "",
      apellidoMaterno: initialData.apellidoMaterno || "",
      dni: initialData.dni || "",
      email: initialData.email || "",
      sexo: initialData.sexo || "MASCULINO",
      role: (initialData.role || "profesor") as StaffValues["role"],
      cargoId: initialData.cargoId || "",
      area: initialData.area || "",
      telefono: initialData.telefono || "",
      direccion: initialData.direccion || "",
      especialidad: initialData.especialidad || "",
      titulo: initialData.titulo || "",
      numeroContrato: initialData.numeroContrato || "",
      colegioProfesor: initialData.colegioProfesor || "",
      escalaMagisterial: initialData.escalaMagisterial || "",
      fechaIngreso: initialData.fechaIngreso
        ? new Date(initialData.fechaIngreso)
        : undefined,
      estadoId:
        initialData.estadoId ||
        estados.find((e) => e.nombre === "Activo")?.id ||
        estados[0]?.id ||
        "",
      institucionId: initialData.institucionId || instituciones[0]?.id || "",
    };
  }

  return {
    name: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    dni: "",
    email: "",
    sexo: "MASCULINO",
    telefono: "",
    direccion: "",
    role: "profesor",
    cargoId: cargos[0]?.id || "",
    area: "",
    especialidad: "",
    titulo: "",
    numeroContrato: "",
    fechaIngreso: new Date(),
    institucionId: instituciones[0]?.id || "",
    estadoId: estados.find((e) => e.nombre === "Activo")?.id || estados[0]?.id || "",
    colegioProfesor: "",
    escalaMagisterial: "",
  };
}

function sanitizeStaffValues(values: StaffValues) {
  return {
    name: values.name,
    apellidoPaterno: values.apellidoPaterno,
    apellidoMaterno: values.apellidoMaterno || "",
    dni: values.dni,
    email: values.email,
    sexo: values.sexo,
    telefono: values.telefono || "",
    direccion: values.direccion || "",
    role: values.role,
    cargoId: values.cargoId,
    area: values.area,
    especialidad: values.especialidad || "",
    titulo: values.titulo || "",
    numeroContrato: values.numeroContrato || "",
    fechaIngreso: values.fechaIngreso,
    estadoId: values.estadoId,
    institucionId: values.institucionId,
    colegioProfesor: values.colegioProfesor || "",
    escalaMagisterial: values.escalaMagisterial || "",
  };
}

export function StaffForm({
  id,
  initialData,
  onSuccess,
  instituciones,
  estados,
  cargos,
}: StaffFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const isRootAdmin = initialData?.email === "admin@colegio.edu.pe";

  const form = useForm<StaffValues>({
    resolver: zodResolver(StaffSchema),
    defaultValues: getStaffFormDefaultValues(initialData, instituciones, estados, cargos),
  });

  const onSubmit = (values: StaffValues) => {
    startTransition(() => {
      const sanitizedValues = sanitizeStaffValues(values);

      const action = id
        ? updateStaffAction(id, sanitizedValues)
        : createStaffAction(sanitizedValues);

      action.then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
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

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);


  const selectedRole = form.watch("role");

  const filteredCargos = useMemo(() => {
    const allowedCodes = new Set(ROLE_CARGOS_MAPPING[selectedRole] || []);
    return cargos.filter((c) => allowedCodes.has(c.codigo));
  }, [cargos, selectedRole]);

  useEffect(() => {
    const currentCargoId = form.getValues("cargoId");
    if (
      currentCargoId &&
      !filteredCargos.some((c) => c.id === currentCargoId)
    ) {
      form.setValue("cargoId", filteredCargos[0]?.id || "");
    }
  }, [selectedRole, filteredCargos, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6 px-1 py-1"
      >
        <PersonalInfoSection form={form} disabled={isRootAdmin} />

        <LaboralSection
          form={form}
          disabled={isRootAdmin}
          isPending={isPending}
          cargos={filteredCargos}
          estados={estados}
        />

        {selectedRole === "profesor" && (
          <ProfesionalSection form={form} disabled={isRootAdmin} />
        )}

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        {!isRootAdmin && (
          <StaffFormActions
            isPending={isPending}
            isEdit={Boolean(id)}
            onSuccess={onSuccess}
          />
        )}
      </form>
    </Form>
  );
}
