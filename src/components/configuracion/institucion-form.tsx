"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { ImageUpload } from "@/components/ui/image-upload"
import { updateInstitucionAction } from "@/actions/institucion"

import {
  InformacionGeneralCard,
  UbicacionContactoCard,
  CalendarioSistemaCard,
  institucionFormSchema,
  type InstitucionFormValues,
} from "./institucion"

interface InstitucionFormProps {
  initialData: any
}

export function InstitucionForm({ initialData }: InstitucionFormProps) {
  const [isPending, setIsPending] = React.useState(false)

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
        ? new Date(initialData.fechaInicioClases).toISOString().split('T')[0]
        : "",
      fechaFinClases: initialData?.fechaFinClases
        ? new Date(initialData.fechaFinClases).toISOString().split('T')[0]
        : "",
    },
  })

  const onSubmit = async (values: InstitucionFormValues) => {
    const institucionId = initialData?.id
    if (!institucionId) {
      toast.error("No se pudo identificar la institución")
      return
    }

    setIsPending(true)
    try {
      // Ahora los valores ya contienen la URL del logo subido via API
      const res = await updateInstitucionAction(institucionId, values)

      if (res.success) {
        toast.success(res.success)
      } else {
        toast.error(res.error)
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Error al guardar los datos")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        <div className="flex flex-col items-center justify-center py-4">
          <FormField
            name="logo"
            render={({ field }) => (
              <FormItem className="w-full max-w-xs">
                <FormControl>
                  <ImageUpload
                    value={field.value}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InformacionGeneralCard control={form.control} />
          <UbicacionContactoCard control={form.control} />
          <CalendarioSistemaCard control={form.control} />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95"
            disabled={isPending}
          >
            {isPending ? "Guardando cambios..." : "Guardar Configuración"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
