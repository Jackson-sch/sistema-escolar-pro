"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { updateInstitucionAction } from "@/actions/institucion";

import {
  InformacionGeneralCard,
  UbicacionContactoCard,
  CalendarioSistemaCard,
  institucionFormSchema,
  type InstitucionFormValues,
} from "./institucion";
import { LogoInstitucionalCard } from "./institucion/logo-institucional-card";
import { ResumenInstitucionalCard } from "./institucion/resumen-institucional-card";
import { IconLoader2, IconDeviceFloppy } from "@tabler/icons-react";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface InstitucionFormProps {
  initialData: any;
}

function getInstitucionDefaultValues(initialData: any): InstitucionFormValues {
  const formatDate = (val?: string | Date) =>
    val ? new Date(val).toISOString().split("T")[0] : "";

  return {
    nombreInstitucion: initialData?.nombreInstitucion || "",
    nombreComercial: initialData?.nombreComercial || "",
    codigoModular: initialData?.codigoModular || "",
    tipoGestion: initialData?.tipoGestion || "PRIVADA",
    modalidad: initialData?.modalidad || "PRESENCIAL",
    ugel: initialData?.ugel || "",
    dre: initialData?.dre || "",
    direccion: initialData?.direccion || "",
    distrito: initialData?.distrito || "",
    provincia: initialData?.provincia || "",
    departamento: initialData?.departamento || "",
    telefono: initialData?.telefono || "",
    email: initialData?.email || "",
    sitioWeb: initialData?.sitioWeb || "",
    logo: initialData?.logo || "",
    cicloEscolarActual: initialData?.cicloEscolarActual || 2026,
    fechaInicioClases: formatDate(initialData?.fechaInicioClases),
    fechaFinClases: formatDate(initialData?.fechaFinClases),
  };
}

function InstitucionSubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button
      type="submit"
      className="rounded-xl px-6 h-10 font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-2 min-w-[200px] cursor-pointer transition-transform active:scale-95"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <IconLoader2 className="size-4 animate-spin" />
          <span>Guardando cambios...</span>
        </>
      ) : (
        <>
          <IconDeviceFloppy className="size-4" />
          <span>Guardar Configuración</span>
        </>
      )}
    </Button>
  );
}

export function InstitucionForm({ initialData }: InstitucionFormProps) {
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<InstitucionFormValues>({
    // @ts-expect-error - el tipo del resolver de zod difiere del esperado por RHF v7
    resolver: zodResolver(institucionFormSchema),
    defaultValues: getInstitucionDefaultValues(initialData),
  });

  const onSubmit = async (values: InstitucionFormValues) => {
    const institucionId = initialData?.id;
    if (!institucionId) {
      toast.error("No se pudo identificar la institución");
      return;
    }

    setIsPending(true);
    try {
      const res = await updateInstitucionAction(institucionId, values);
      if (res.success) {
        toast.success(res.success);
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error al guardar los datos");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit as any)}
        className="space-y-6 animate-in fade-in duration-200"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
            <LogoInstitucionalCard
              control={form.control}
              disabled={isPending}
            />
            <ResumenInstitucionalCard control={form.control} />
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <InformacionGeneralCard control={form.control} />
            <UbicacionContactoCard control={form.control} />
            <CalendarioSistemaCard control={form.control} />
            <FormKeyboardHelpBar />

            <div className="flex justify-end pt-2">
              <InstitucionSubmitButton isPending={isPending} />
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
