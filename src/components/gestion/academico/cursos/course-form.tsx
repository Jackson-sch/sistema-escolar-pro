"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef } from "react";
import { IconLoader2 } from "@tabler/icons-react";
import { CourseSchema, CourseValues } from "@/lib/schemas/academic";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { upsertCourseAction } from "@/actions/academic";
import { toast } from "sonner";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import {
  CourseGeneralInfoSection,
  CourseAcademicConfigSection,
} from "./course-form-sections";

interface CourseFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  areas: any[];
  nivelesAcademicos: any[];
  profesores: any[];
  currentAnio?: number;
}

export function CourseForm({
  id,
  initialData,
  onSuccess,
  areas,
  nivelesAcademicos,
  profesores,
  currentAnio = new Date().getFullYear(),
}: CourseFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<CourseValues>({
    resolver: zodResolver(CourseSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          descripcion: initialData.descripcion || "",
          horasSemanales: Number(initialData.horasSemanales),
          creditos: Number(initialData.creditos || 0),
          nivelAcademicoIds: [initialData.nivelAcademicoId],
        }
      : {
          nombre: "",
          codigo: "",
          descripcion: "",
          anioAcademico: currentAnio,
          horasSemanales: 2,
          creditos: 0,
          areaCurricularId: "",
          nivelAcademicoIds: [],
          profesorId: undefined,
          activo: true,
        },
  });

  const onSubmit = (values: CourseValues) => {
    startTransition(() => {
      upsertCourseAction(values, id).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          onSuccess?.();
        }
      });
    });
  };

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmitRef.current)());
    return () => setOnSubmit(undefined);
  }, [form, setOnSubmit]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <CourseGeneralInfoSection form={form} />

        <CourseAcademicConfigSection
          form={form}
          id={id}
          areas={areas}
          nivelesAcademicos={nivelesAcademicos}
        />

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess?.()}
            className="h-9 px-4 text-xs font-bold rounded-xl border-border/60 cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            disabled={isPending}
            type="submit"
            className="h-9 px-5 text-xs font-extrabold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-xs"
          >
            {isPending && <IconLoader2 className="mr-1.5 size-3.5 animate-spin" />}
            {isPending
              ? "Guardando..."
              : id
                ? "Guardar Cambios"
                : "Crear Curso(s)"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
