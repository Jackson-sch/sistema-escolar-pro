"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect, useRef } from "react";
import { EnrollmentSchema, EnrollmentValues } from "@/lib/schemas/enrollment";
import { Form } from "@/components/ui/form";
import {
  createEnrollmentAction,
  getUnenrolledStudentsAction,
} from "@/actions/enrollments";
import {
  getNivelesAcademicosAction,
  getStudentByIdAction,
} from "@/actions/students";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import {
  StudentSelectionSection,
  type EstudianteOpcion,
} from "./components/student-selection-section";
import {
  AcademicAssignmentSection,
  type NivelAcademicoOpcion,
} from "./components/academic-assignment-section";
import { BenefitsConditionSection } from "./components/benefits-condition-section";
import { EnrollmentFormActions } from "./components/enrollment-form-actions";

export interface EnrollmentFormProps {
  onSuccess?: () => void;
  nivelesAcademicos: NivelAcademicoOpcion[];
  defaultStudentId?: string;
  onCancel?: () => void;
}

export function EnrollmentForm({
  onSuccess,
  nivelesAcademicos,
  defaultStudentId,
  onCancel,
}: EnrollmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [students, setStudents] = useState<EstudianteOpcion[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [allNiveles, setAllNiveles] = useState<NivelAcademicoOpcion[]>(
    nivelesAcademicos,
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoadingNiveles, setIsLoadingNiveles] = useState(false);

  const form = useForm<EnrollmentValues>({
    resolver: zodResolver(EnrollmentSchema),
    defaultValues: {
      estudianteId: defaultStudentId || "",
      nivelAcademicoId: "",
      anioAcademico: new Date().getFullYear(),
      esPrimeraVez: true,
      esRepitente: false,
      procedencia: "",
      observaciones: "",
      estado: "activo",
      tipoBeca: "ninguna",
      descuentoBeca: 0,
    },
  });

  const onSubmit = (values: EnrollmentValues) => {
    startTransition(() => {
      createEnrollmentAction(values).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          form.reset();
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

  const anio = form.watch("anioAcademico");

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setIsLoadingStudents(true);
      setIsLoadingNiveles(true);
      try {
        if (ignore) return;
        const [studentsRes, nivelesRes, defaultStudentRes] = await Promise.all([
          getUnenrolledStudentsAction(anio),
          getNivelesAcademicosAction(anio),
          defaultStudentId
            ? getStudentByIdAction(defaultStudentId)
            : Promise.resolve({ data: null }),
        ]);
        if (ignore) return;

        const finalStudents = studentsRes.data || [];

        const mappedStudents = finalStudents.map(
          (s: {
            id: string;
            name: string | null;
            apellidoPaterno: string | null;
            apellidoMaterno: string | null;
            dni: string | null;
            fechaNacimiento: string | Date | null;
          }) => ({
            id: s.id,
            name: s.name || "",
            apellidoPaterno: s.apellidoPaterno || "",
            apellidoMaterno: s.apellidoMaterno || "",
            dni: s.dni || "",
            fechaNacimiento: s.fechaNacimiento
              ? new Date(s.fechaNacimiento)
              : null,
          }),
        );

        setStudents(mappedStudents);
        if (nivelesRes.data) {
          setAllNiveles(nivelesRes.data);
        }

        const currentNivelId = form.getValues("nivelAcademicoId");
        if (
          currentNivelId &&
          nivelesRes.data &&
          !nivelesRes.data.some((n) => n.id === currentNivelId)
        ) {
          form.setValue("nivelAcademicoId", "", { shouldDirty: true });
        }
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingNiveles(false);
      }
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, [anio, defaultStudentId, form]);

  const filteredByLevel = selectedLevel
    ? allNiveles.filter((n) => n.nivel.nombre === selectedLevel)
    : allNiveles;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 px-1 py-1"
      >
        <StudentSelectionSection
          form={form}
          students={students}
          isLoadingStudents={isLoadingStudents}
        />
        <AcademicAssignmentSection
          form={form}
          allNiveles={allNiveles}
          filteredByLevel={filteredByLevel}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          isLoading={isLoadingNiveles}
          anio={anio}
        />
        <BenefitsConditionSection form={form} />

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botones de Acción */}
        <EnrollmentFormActions isPending={isPending} onCancel={onCancel} />
      </form>
    </Form>
  );
}
