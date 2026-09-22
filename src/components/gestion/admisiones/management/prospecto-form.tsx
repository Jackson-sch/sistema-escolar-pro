"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { upsertProspectoAction } from "@/actions/admissions";
import { toast } from "sonner";
import { useFormModal } from "@/components/modals/form-modal-context";
import { OCRButton } from "@/components/gestion/admisiones/components/ocr-button";
import { prospectoSchema } from "@/lib/schemas/gestion/admision/prospectoSchema";
import {
  IconScan,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import {
  ProspectoPersonalFields,
  ProspectoApplicationSection,
} from "./prospecto-form-sections";

interface ProspectoFormProps {
  grados: any[];
  instituciones: any[];
  onSuccess: () => void;
  initialData?: any;
  id?: string;
}

export function ProspectoForm({
  grados,
  instituciones,
  onSuccess,
  initialData,
  id,
}: ProspectoFormProps) {
  const [loading, setLoading] = useState(false);
  const { setIsDirty, setOnSubmit } = useFormModal();

  const form = useForm<z.infer<typeof prospectoSchema>>({
    resolver: zodResolver(prospectoSchema),
    defaultValues: {
      nombre: initialData?.nombre || "",
      apellidoPaterno: initialData?.apellidoPaterno || "",
      apellidoMaterno: initialData?.apellidoMaterno || "",
      dni: initialData?.dni || "",
      email: initialData?.email || "",
      telefono: initialData?.telefono || "",
      direccion: initialData?.direccion || "",
      gradoInteresId: initialData?.gradoInteresId || "",
      anioPostulacion:
        initialData?.anioPostulacion || new Date().getFullYear() + 1,
      institucionId: initialData?.institucionId || instituciones[0]?.id || "",
    },
  });

  const nivelesDisponibles = useMemo(() => {
    return Array.from(new Set(grados.map((g) => g.nivel.nombre))).sort();
  }, [grados]);

  const initialNivel = useMemo(() => {
    if (initialData?.gradoInteresId) {
      const match = grados.find((g) => g.id === initialData.gradoInteresId);
      if (match) return match.nivel.nombre;
    }
    return nivelesDisponibles[0] || "";
  }, [initialData, grados, nivelesDisponibles]);

  const [selectedNivel, setSelectedNivel] = useState(initialNivel);

  const filteredGrados = useMemo(() => {
    return grados.filter((g) => g.nivel.nombre === selectedNivel);
  }, [grados, selectedNivel]);

  const handleNivelChange = (nivel: string) => {
    setSelectedNivel(nivel);
    const currentGradoId = form.getValues("gradoInteresId");
    const belongsToNewLevel = grados.find(
      (g) => g.id === currentGradoId && g.nivel.nombre === nivel,
    );
    if (!belongsToNewLevel) {
      form.setValue("gradoInteresId", "", { shouldDirty: true });
    }
  };

  const onSubmit = async (values: z.infer<typeof prospectoSchema>) => {
    setLoading(true);
    try {
      const res = await upsertProspectoAction({ values, id });
      if (res.success) {
        toast.success(res.success);
        setIsDirty(false);
        onSuccess();
      } else {
        toast.error(res.error);
      }
    } finally {
      setLoading(false);
    }
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

  const handleOCRComplete = (data: any) => {
    if (data.dni) form.setValue("dni", data.dni);
    if (data.nombre) form.setValue("nombre", data.nombre);
    if (data.apellidoPaterno) form.setValue("apellidoPaterno", data.apellidoPaterno);
    if (data.apellidoMaterno) form.setValue("apellidoMaterno", data.apellidoMaterno);
    if (data.direccion) form.setValue("direccion", data.direccion);
    toast.info("Formulario actualizado con los datos del DNI");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        {/* OCR Banner */}
        <div className="flex items-center justify-between gap-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <IconScan className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                Registro automático con OCR
              </p>
              <p className="text-[10px] text-muted-foreground">
                Escanea el DNI para rellenar los datos del postulante
              </p>
            </div>
          </div>
          <OCRButton onScanComplete={handleOCRComplete} />
        </div>

        {/* Identificación y Datos Personales */}
        <ProspectoPersonalFields form={form} />

        {/* Postulación */}
        <ProspectoApplicationSection
          form={form}
          nivelesDisponibles={nivelesDisponibles}
          selectedNivel={selectedNivel}
          onNivelChange={handleNivelChange}
          filteredGrados={filteredGrados}
        />

        {/* Keyboard Shortcuts */}
        <FormKeyboardHelpBar />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-border/30 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[170px]"
            disabled={loading}
          >
            {loading ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>{id ? "Actualizar Prospecto" : "Guardar Prospecto"}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}