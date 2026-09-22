"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { upsertSeccionAction } from "@/actions/academic-structure";
import { colors } from "@/lib/constants";
import { useFormModal } from "@/components/modals/form-modal-context";
import { LevelSegmentedControl } from "@/components/common/level-segmented-control";

import {
  formSchema,
  SeccionFormValues,
  SeccionFormProps,
} from "./components/seccion-form-types";
import {
  BasicRow,
  DetailsRow,
  ConfigRow,
} from "./components/seccion-basic-rows";
import {
  ColorField,
  InfoBanner,
  FormActions,
} from "./components/seccion-color-banner";

export function SeccionForm({
  initialData,
  grados,
  tutores,
  sedes,
  institucionId,
  currentAnio,
  onSuccess,
}: SeccionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  // Derive unique niveles from grados
  const niveles = useMemo(
    () => Array.from(new Set(grados.map((g) => g.nivel.nombre))),
    [grados],
  );

  // Resolve initial nivel from initialData or default to first
  const initialNivel = useMemo(() => {
    if (initialData?.gradoId) {
      const match = grados.find((g) => g.id === initialData.gradoId);
      if (match) return match.nivel.nombre;
    }
    return niveles[0] || "";
  }, [initialData, grados, niveles]);

  const [selectedNivel, setSelectedNivel] = useState(initialNivel);

  // Filtered grados based on selected nivel
  const filteredGrados = useMemo(
    () => grados.filter((g) => g.nivel.nombre === selectedNivel),
    [grados, selectedNivel],
  );

  const form = useForm<SeccionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      initialData?.id || initialData?.seccion
        ? {
            seccion: initialData.seccion,
            gradoId: initialData.gradoId,
            tutorId: initialData.tutorId || "",
            sedeId: initialData.sedeId || "",
            capacidad: String(initialData.capacidad),
            aulaAsignada: initialData.aulaAsignada || "",
            color: initialData.color || "",
            turno: initialData.turno,
            anioAcademico: String(initialData.anioAcademico),
            institucionId: initialData.institucionId,
          }
        : {
            seccion: "",
            gradoId: initialData?.gradoId || "",
            tutorId: "",
            sedeId: sedes[0]?.id || "",
            capacidad: "30",
            aulaAsignada: "",
            color: colors[0],
            turno: "MANANA",
            anioAcademico: String(currentAnio || new Date().getFullYear()),
            institucionId: institucionId,
          },
  });

  const watchedAnio = form.watch("anioAcademico");
  const [tutorOpen, setTutorOpen] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // When nivel changes, reset gradoId if the current one doesn't belong to the new nivel
  const handleNivelChange = (nivel: string) => {
    setSelectedNivel(nivel);
    const currentGradoId = form.getValues("gradoId");
    const gradoBelongsToNivel = grados.find(
      (g) => g.id === currentGradoId && g.nivel.nombre === nivel,
    );
    if (!gradoBelongsToNivel) {
      form.setValue("gradoId", "", { shouldDirty: true });
    }
  };

  const onSubmit = (values: SeccionFormValues) => {
    startTransition(async () => {
      const res = await upsertSeccionAction(
        {
          ...values,
          tutorId: values.tutorId === "none" ? null : values.tutorId || null,
          sedeId: values.sedeId === "none" ? null : values.sedeId || null,
          aulaAsignada: values.aulaAsignada || null,
          color: values.color || null,
          capacidad: parseInt(values.capacidad, 10),
          anioAcademico: parseInt(values.anioAcademico, 10),
        } as any,
        initialData?.id,
      );

      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        if (onSuccess) onSuccess();
      }
      if (res.error) toast.error(res.error);
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Nivel Segmented Control */}
        <LevelSegmentedControl
          levels={niveles}
          value={selectedNivel}
          onChange={handleNivelChange}
        />

        {/* Row 1: Grado + Sede */}
        <BasicRow
          control={form.control}
          filteredGrados={filteredGrados}
          sedes={sedes}
        />

        {/* Row 2: Sección + Año + Tutor */}
        <DetailsRow
          control={form.control}
          tutores={tutores}
          tutorOpen={tutorOpen}
          onTutorOpenChange={setTutorOpen}
        />

        {/* Row 3: Turno + Capacidad + Aula */}
        <ConfigRow control={form.control} />

        {/* Color */}
        <ColorField
          control={form.control}
          colorInputRef={colorInputRef}
        />

        {/* Info Banner */}
        <InfoBanner watchedAnio={watchedAnio} />

        {/* Actions */}
        <FormActions
          isPending={isPending}
          isEditing={!!initialData}
          onCancel={onSuccess}
        />
      </form>
    </Form>
  );
}

export type { SeccionFormProps, SeccionFormValues };
