"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { upsertSeccionAction } from "@/actions/academic-structure";
import { TURNO_OPTIONS } from "@/lib/constants";
import { useEffect } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

const formSchema = z.object({
  seccion: z.string().min(1, "La sección es requerida"),
  gradoId: z.string().min(1, "El grado es requerido"),
  tutorId: z.string().optional().nullable().or(z.literal("")),
  capacidad: z.string().min(1, "La capacidad es requerida"),
  aulaAsignada: z.string().optional().nullable().or(z.literal("")),
  turno: z.enum(["MANANA", "TARDE", "NOCHE"]),
  anioAcademico: z.string().min(4, "Año inválido"),
  institucionId: z.string().min(1),
});

type SeccionFormValues = z.infer<typeof formSchema>;

interface SeccionFormProps {
  initialData?: any;
  grados: { id: string; nombre: string; nivel: { nombre: string } }[];
  tutores: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  }[];
  institucionId: string;
  onSuccess?: () => void;
}

export function SeccionForm({
  initialData,
  grados,
  tutores,
  institucionId,
  onSuccess,
}: SeccionFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty } = useFormModal();

  const form = useForm<SeccionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          seccion: initialData.seccion,
          gradoId: initialData.gradoId,
          tutorId: initialData.tutorId || "",
          capacidad: String(initialData.capacidad),
          aulaAsignada: initialData.aulaAsignada || "",
          turno: initialData.turno,
          anioAcademico: String(initialData.anioAcademico),
          institucionId: initialData.institucionId,
        }
      : {
          seccion: "",
          gradoId: "",
          tutorId: "",
          capacidad: "30",
          aulaAsignada: "",
          turno: "MANANA",
          anioAcademico: String(new Date().getFullYear()),
          institucionId,
        },
  });

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onSubmit = (values: SeccionFormValues) => {
    startTransition(async () => {
      const res = await upsertSeccionAction(
        {
          ...values,
          tutorId: values.tutorId === "none" ? null : values.tutorId || null,
          aulaAsignada: values.aulaAsignada || null,
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField<SeccionFormValues>
          control={form.control}
          name="gradoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ""}>
                <FormControl>
                  <SelectTrigger className="w-full rounded-full">
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {grados.map((grado) => (
                    <SelectItem key={grado.id} value={grado.id}>
                      {grado.nivel.nombre} - {grado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField<SeccionFormValues>
            control={form.control}
            name="seccion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sección</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: A"
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<SeccionFormValues>
            control={form.control}
            name="anioAcademico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año Académico</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField<SeccionFormValues>
          control={form.control}
          name="tutorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tutor (Opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-full capitalize">
                    <SelectValue placeholder="Sin tutor asignado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin tutor</SelectItem>
                  {tutores.map((tutor) => (
                    <SelectItem
                      key={tutor.id}
                      value={tutor.id}
                      className="capitalize"
                    >
                      {tutor.apellidoPaterno} {tutor.apellidoMaterno},{" "}
                      {tutor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField<SeccionFormValues>
            control={form.control}
            name="turno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Turno</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ""}
                >
                  <FormControl>
                    <SelectTrigger className="w-full rounded-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TURNO_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField<SeccionFormValues>
            control={form.control}
            name="capacidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value ?? ""}
                    className="rounded-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField<SeccionFormValues>
          control={form.control}
          name="aulaAsignada"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aula (Opcional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Aula 101"
                  {...field}
                  value={field.value ?? ""}
                  className="rounded-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            className="w-full sm:w-auto rounded-full border-border/40 hover:bg-accent/50"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto rounded-full px-8"
            disabled={isPending}
          >
            {isPending
              ? "Guardando..."
              : initialData
                ? "Guardar Cambios"
                : "Crear Sección"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
