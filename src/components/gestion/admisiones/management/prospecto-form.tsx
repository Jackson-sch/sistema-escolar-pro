"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { upsertProspectoAction } from "@/actions/admissions";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";
import { OCRButton } from "@/components/gestion/admisiones/components/ocr-button";

const prospectoSchema = z.object({
  dni: z.string().optional(),
  nombre: z.string().min(2, "Nombre requerido"),
  apellidoPaterno: z.string().min(2, "Apellido paterno requerido"),
  apellidoMaterno: z.string().min(2, "Apellido materno requerido"),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  telefono: z.string().min(7, "Teléfono inválido"),
  direccion: z.string().optional(),
  gradoInteresId: z.string().min(1, "Debe seleccionar un grado"),
  anioPostulacion: z.number().min(2024, "Año inválido"),
  institucionId: z.string().min(1, "Debe seleccionar una institución"),
});

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
  const { setIsDirty } = useFormModal();

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

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = async (values: z.infer<typeof prospectoSchema>) => {
    setLoading(true);
    try {
      const res = await upsertProspectoAction(values, id);
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

  const handleOCRComplete = (data: any) => {
    if (data.dni) form.setValue("dni", data.dni);
    if (data.nombre) form.setValue("nombre", data.nombre);
    if (data.apellidoPaterno)
      form.setValue("apellidoPaterno", data.apellidoPaterno);
    if (data.apellidoMaterno)
      form.setValue("apellidoMaterno", data.apellidoMaterno);
    if (data.direccion) form.setValue("direccion", data.direccion);
    toast.info("Formulario actualizado con los datos del DNI");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
        <div className="space-y-0.5">
          <p className="text-[11px] font-black text-blue-600">
            Asistente de Registro
          </p>
          <p className="text-xs text-muted-foreground">
            Sube el DNI para auto-completar los datos
          </p>
        </div>
        <OCRButton onScanComplete={handleOCRComplete} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    DNI (Opcional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Número de documento"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Celular o fijo"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Nombres del Estudiante
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombres completos"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Apellido Paterno
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Primer apellido"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellidoMaterno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Apellido Materno
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Segundo apellido"
                      {...field}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                  Email de contacto
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="correo@ejemplo.com"
                    {...field}
                    className="rounded-full border-border/40 bg-background/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gradoInteresId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Grado de Interés
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-full w-full border-border/40 bg-background/50">
                        <SelectValue placeholder="Seleccione grado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                      {grados.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nivel.nombre} - {g.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="anioPostulacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold text-muted-foreground/70">
                    Año Postulación
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="rounded-full border-border/40 bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={onSuccess}
              className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              className="w-full sm:w-auto rounded-full px-8"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Guardar Prospecto"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
