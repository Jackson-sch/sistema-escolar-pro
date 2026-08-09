"use client";

import { useTransition, useEffect, useRef } from "react";
import { useForm, Control } from "react-hook-form";
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
import {
  IconHeartbeat,
  IconFileDescription,
  IconAlertCircle,
  IconCheck,
  IconRefresh,
} from "@tabler/icons-react";
import { updateStudentAction } from "@/actions/students";
import {
  HealthAndInfoSchema,
  HealthAndInfoValues,
} from "@/lib/schemas/student";
import { useFormModal } from "@/components/modals/form-modal-context";
import { cn } from "@/lib/utils";

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
  const { setIsDirty, setOnSubmit } = useFormModal();

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
          toast.success("Información de salud y bienestar actualizada");
          setIsDirty(false);
          onSuccess?.();
        }
      } catch (error) {
        toast.error("Ocurrió un error al guardar los cambios");
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-1">
        {/* SECCIÓN 1: SALUD Y BIENESTAR */}
        <MedicalSection control={form.control} />

        {/* SECCIÓN 2: DATOS COMPLEMENTARIOS Y EMERGENCIA */}
        <ComplementarySection control={form.control} />

        {/* Acciones del Formulario */}
        <HealthFormActions isPending={isPending} onCancel={() => onSuccess?.()} />
      </form>
    </Form>
  );
}

/* ─── Sub-components ─── */

function SectionHeader({
  icon,
  colorClass,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  colorClass: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
      <div
        className={cn(
          "size-8 rounded-xl border flex items-center justify-center shrink-0",
          colorClass,
        )}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/* Sección 1: Ficha Médica y Condiciones de Salud */
function MedicalSection({
  control,
}: {
  control: Control<HealthAndInfoValues>;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={<IconHeartbeat className="size-4" />}
        colorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Ficha Médica y Condiciones de Salud"
        subtitle="Registro sobre tipo de sangre, alergias, peso, talla y seguros médicos."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={control}
          name="tipoSangre"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Tipo de Sangre
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger className="w-full rounded-xl bg-background border-border/40 text-xs h-9 font-medium">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                    (t) => (
                      <SelectItem key={t} value={t} className="text-xs">
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
          control={control}
          name="peso"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Peso (kg)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="talla"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Talla (cm)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="1"
                  placeholder="0"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="seguroMedico"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Seguro Médico / SIS
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="EsSalud / SIS / Privado"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="alergias"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Alergias
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Medicamentos, alimentos, polen..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="restriccionesAlimenticias"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Restricciones Alimenticias
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Sin lactosa, celíaco..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="condicionesMedicas"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Condiciones Médicas
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Asma, Diabetes..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="discapacidades"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Discapacidades
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ninguna / Describir"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="carnetConadis"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Carnet CONADIS
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="N° de carnet"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="centroSaludPreferido"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Centro de Salud Preferido
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Clínica / Hospital de preferencia"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="medicamentos"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Medicamentos Frecuentes
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Medicamentos o tratamiento actual"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

/* Sección 2: Datos Complementarios y Contacto Secundario */
function ComplementarySection({
  control,
}: {
  control: Control<HealthAndInfoValues>;
}) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={<IconFileDescription className="size-4" />}
        colorClass="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="2. Datos Complementarios y Contacto Secundario"
        subtitle="Origen, información personal adicional y teléfono de emergencia secundario."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={control}
          name="paisNacimiento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                País de Nacimiento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lugarNacimiento"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Lugar de Nacimiento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ciudad / Departamento"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="lenguaMaterna"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Lengua Materna
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="religion"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Religión
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Católica, Evangélica..."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="numeroHermanos"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                N° de Hermanos
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Subsección: Contacto de Emergencia Secundario */}
      <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 mt-2">
        <h4 className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
          <IconAlertCircle className="size-4 shrink-0" />
          Contacto de Emergencia Secundario
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <FormField
            control={control}
            name="nombreContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-5">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Nombre Completo
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nombres y apellidos"
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="telefonoContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-4">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Teléfono / Celular
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="987 654 321"
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="parentescoContactoEmergencia2"
            render={({ field }) => (
              <FormItem className="md:col-span-3">
                <FormLabel className="text-[11px] font-medium text-muted-foreground">
                  Parentesco
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Tío, Abuelo..."
                    className="bg-background border-border/40 rounded-xl text-xs h-8.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

/* Acciones del Formulario */
function HealthFormActions({
  isPending,
  onCancel,
}: {
  isPending: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex justify-end gap-2.5 pt-4 border-t border-border/30">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="rounded-xl h-10 px-5 font-semibold text-xs border-border/40"
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        disabled={isPending}
        className="rounded-xl h-10 px-5 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2"
      >
        {isPending ? (
          <>
            <IconRefresh className="size-4 animate-spin" />
            <span>Guardando...</span>
          </>
        ) : (
          <>
            <IconCheck className="size-4" />
            <span>Guardar Cambios</span>
          </>
        )}
      </Button>
    </div>
  );
}
