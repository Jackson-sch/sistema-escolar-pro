"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useEffect, useState, useRef } from "react";
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import * as z from "zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  upsertPsychopedagogicalAction,
  getIncidentCategoriesAction,
} from "@/actions/discipline";
import { FormModal } from "@/components/modals/form-modal";
import { CategoryForm } from "./category-form";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import {
  PsychHeaderFields,
  PsychContentFields,
} from "./psychopedagogical-form-fields";

const psychSchema = z.object({
  estudianteId: z.string().min(1, "Estudiante es requerido"),
  categoriaId: z.string().min(1, "Seleccione una categoría"),
  motivo: z.string().min(5, "Motivo debe tener al menos 5 caracteres"),
  descripcion: z.string().min(10, "Descripción detallada es requerida"),
  recomendaciones: z.string().optional(),
  fecha: z.date(),
  visibleParaPadres: z.boolean(),
});

type PsychValues = z.infer<typeof psychSchema>;

interface PsychopedagogicalFormProps {
  studentId: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function PsychopedagogicalForm({
  studentId,
  initialData,
  onSuccess,
}: PsychopedagogicalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<PsychValues>({
    resolver: zodResolver(psychSchema),
    defaultValues: {
      estudianteId: studentId,
      categoriaId: initialData?.categoriaId || "",
      motivo: initialData?.motivo || "",
      descripcion: initialData?.descripcion || "",
      recomendaciones: initialData?.recomendaciones || "",
      fecha: initialData?.fecha ? new Date(initialData.fecha) : new Date(),
      visibleParaPadres: initialData?.visibleParaPadres || false,
    },
  });

  const loadCategories = async () => {
    const res = await getIncidentCategoriesAction({});
    if (res.success) setCategories(res.success);
  };

  useEffect(() => {
    let ignore = false;
    getIncidentCategoriesAction({}).then((res) => {
      if (ignore) return;
      if (res.success) setCategories(res.success);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const onSubmit = (values: PsychValues) => {
    startTransition(async () => {
      const res = await upsertPsychopedagogicalAction({ values, id: initialData?.id });
      if (res.error) toast.error(res.error);
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess?.();
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
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
          <PsychHeaderFields
            form={form}
            categories={categories}
            onOpenCategoryModal={() => setShowCategoryModal(true)}
          />

          <PsychContentFields form={form} />

          {/* Guía de Atajos de Teclado */}
          <FormKeyboardHelpBar />

          {/* Botón de Enviar */}
          <div className="pt-2">
            <Button
              disabled={isPending}
              type="submit"
              className="w-full rounded-xl h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="size-4" />
                  <span>{initialData ? "Guardar Cambios" : "Registrar Incidencia / Informe"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <FormModal
        title="Nueva Categoría"
        description="Agregue una nueva categoría para los registros psicopedagógicos."
        isOpen={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        className="sm:max-w-md"
      >
        <CategoryForm
          onSuccess={(category) => {
            setShowCategoryModal(false);
            loadCategories();
            form.setValue("categoriaId", category.id);
          }}
        />
      </FormModal>
    </>
  );
}
