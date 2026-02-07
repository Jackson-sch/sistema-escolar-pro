"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
} from "@/components/ui/form";
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

interface InstitucionFormProps {
  initialData: any;
}

export function InstitucionForm({ initialData }: InstitucionFormProps) {
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<InstitucionFormValues>({
    // @ts-ignore
    resolver: zodResolver(institucionFormSchema),
    defaultValues: {
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
      cicloEscolarActual: initialData?.cicloEscolarActual || 2025,
      fechaInicioClases: initialData?.fechaInicioClases
        ? new Date(initialData.fechaInicioClases).toISOString().split("T")[0]
        : "",
      fechaFinClases: initialData?.fechaFinClases
        ? new Date(initialData.fechaFinClases).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (values: InstitucionFormValues) => {
    const institucionId = initialData?.id;
    if (!institucionId) {
      toast.error("No se pudo identificar la institución");
      return;
    }

    setIsPending(true);
    try {
      // Ahora los valores ya contienen la URL del logo subido via API
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
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Sidebar (Logo & Summary) */}
          <div className="lg:col-span-4 flex flex-col gap-6 sticky top-6">
            <LogoInstitucionalCard
              control={form.control}
              disabled={isPending}
            />
            <ResumenInstitucionalCard control={form.control} />
          </div>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <InformacionGeneralCard control={form.control} />
            <UbicacionContactoCard control={form.control} />
            <CalendarioSistemaCard control={form.control} />

            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 text-sm"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="mr-2 size-4" />
                    Guardar Configuración
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
