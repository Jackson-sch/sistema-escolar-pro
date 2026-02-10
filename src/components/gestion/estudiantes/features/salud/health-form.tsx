"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import CardGeneric from "@/components/common/card-generic";
import {
  IconHeartbeat,
  IconFileDescription,
  IconAlertCircle,
} from "@tabler/icons-react";
import { updateStudentAction } from "@/actions/students";
import {
  HealthAndInfoSchema,
  HealthAndInfoValues,
} from "@/lib/schemas/student";

interface HealthFormProps {
  studentId: string;
  initialData?: Partial<HealthAndInfoValues>;
  onSuccess?: () => void;
}

export function HealthForm({
  studentId,
  initialData,
  onSuccess,
}: HealthFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<HealthAndInfoValues>({
    resolver: zodResolver(HealthAndInfoSchema) as any,
    defaultValues: {
      tipoSangre: initialData?.tipoSangre || "",
      alergias: initialData?.alergias || "",
      condicionesMedicas: initialData?.condicionesMedicas || "",
      medicamentos: initialData?.medicamentos || "",
      seguroMedico: initialData?.seguroMedico || "",
      discapacidades: initialData?.discapacidades || "",
      carnetConadis: initialData?.carnetConadis || "",
      restriccionesAlimenticias: initialData?.restriccionesAlimenticias || "",
      centroSaludPreferido: initialData?.centroSaludPreferido || "",
      peso: initialData?.peso || 0,
      talla: initialData?.talla || 0,
      parentescoContactoEmergencia:
        initialData?.parentescoContactoEmergencia || "",
      nombreContactoEmergencia2: initialData?.nombreContactoEmergencia2 || "",
      telefonoContactoEmergencia2:
        initialData?.telefonoContactoEmergencia2 || "",
      parentescoContactoEmergencia2:
        initialData?.parentescoContactoEmergencia2 || "",
      paisNacimiento: initialData?.paisNacimiento || "PERÚ",
      lugarNacimiento: initialData?.lugarNacimiento || "",
      lenguaMaterna: initialData?.lenguaMaterna || "ESPAÑOL",
      religion: initialData?.religion || "",
      numeroHermanos: initialData?.numeroHermanos || 0,
    },
  });

  const onSubmit = (values: HealthAndInfoValues) => {
    startTransition(async () => {
      try {
        const result = await updateStudentAction(studentId, values);
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success("Información de salud actualizada");
          onSuccess?.();
        }
      } catch (error) {
        toast.error("Ocurrió un error al guardar");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECCIÓN 1: SALUD Y BIENESTAR */}
        <CardGeneric
          title="Salud y Bienestar"
          description="Información médica y condiciones físicas."
          icon={<IconHeartbeat className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="tipoSangre"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Tipo Sangre
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-full bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                        <SelectValue placeholder="-" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="peso"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Peso (kg)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.1"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="talla"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Talla (cm)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="1"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="seguroMedico"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Seguro Médico / SIS
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Essalud / SIS / Privado"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alergias"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Alergias
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ninguna"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="restriccionesAlimenticias"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Restricciones Alimenticias
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ninguna"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condicionesMedicas"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Condiciones Médicas
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Asma, Diabetes..."
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discapacidades"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Discapacidades
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ninguna"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carnetConadis"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Carnet CONADIS
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Código"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="centroSaludPreferido"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Centro de Salud Preferido
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Hospital / Clínica de preferencia"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicamentos"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Medicamentos
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Medicamentos actuales"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardGeneric>

        {/* SECCIÓN 2: DATOS COMPLEMENTARIOS */}
        <CardGeneric
          title="Datos Complementarios"
          description="Información personal adicional y contacto de emergencia secundario."
          icon={<IconFileDescription className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="paisNacimiento"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    País de Nacimiento
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lugarNacimiento"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Lugar de Nacimiento
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ciudad / Provincia"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lenguaMaterna"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Lengua Materna
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Religión
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numeroHermanos"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    N° Hermanos
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 pt-6 border-t border-border/40">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <IconAlertCircle className="h-4 w-4 text-orange-500" />
              Contacto de Emergencia Secundario
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <FormField
                control={form.control}
                name="nombreContactoEmergencia2"
                render={({ field }) => (
                  <FormItem className="md:col-span-4">
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Nombre Completo
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefonoContactoEmergencia2"
                render={({ field }) => (
                  <FormItem className="md:col-span-4">
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Teléfono
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentescoContactoEmergencia2"
                render={({ field }) => (
                  <FormItem className="md:col-span-4">
                    <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                      Parentesco
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all rounded-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardGeneric>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => onSuccess?.()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
