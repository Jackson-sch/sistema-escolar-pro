"use client";

import {
  useForm,
  UseFormReturn,
  type FieldError,
  type FieldErrors,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useRef, useEffect, useMemo } from "react";
import {
  IconUser,
  IconId,
  IconMail,
  IconCalendar,
  IconLoader2,
  IconBriefcase,
  IconCertificate,
  IconPhone,
  IconMapPin,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { StaffSchema, StaffValues } from "@/lib/schemas/staff";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { createStaffAction, updateStaffAction } from "@/actions/staff";
import { toast } from "sonner";
import {
  STAFF_ROLE_OPTIONS,
  ESCALA_MAGISTERIAL_OPTIONS,
  SEXO_OPTIONS,
} from "@/lib/constants";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface StaffInitialData {
  email?: string;
  name?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  dni?: string;
  sexo?: string;
  role?: string;
  cargoId?: string | null;
  area?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  especialidad?: string | null;
  titulo?: string | null;
  numeroContrato?: string | null;
  colegioProfesor?: string | null;
  escalaMagisterial?: string | null;
  fechaIngreso?: Date | string | null;
  estadoId?: string;
  institucionId?: string;
}

interface StaffFormProps {
  id?: string;
  initialData?: StaffInitialData;
  onSuccess?: () => void;
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
  cargos: { id: string; nombre: string; codigo: string }[];
}

interface Cargo {
  id: string;
  nombre: string;
  codigo: string;
}

const ROLE_CARGOS_MAPPING: Record<string, string[]> = {
  profesor: [
    "DOCENTE",
    "AUXILIAR",
    "COORD_ACAD",
    "COORD_NIVEL",
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
  ],
  administrativo: [
    "ADMIN_GLOBAL",
    "DIRECTOR",
    "SUBDIRECTOR",
    "TESORERO",
    "SECRETARIA",
    "PSICOLOGO",
    "ENFERMERIA",
    "SISTEMAS",
    "BIBLIOTECARIO",
    "MANTENIMIENTO",
    "VIGILANCIA",
  ],
};

export function StaffForm({
  id,
  initialData,
  onSuccess,
  instituciones,
  estados,
  cargos,
}: StaffFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();

  const isRootAdmin = initialData?.email === "admin@colegio.edu.pe";

  const form = useForm<StaffValues>({
    resolver: zodResolver(StaffSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          name: initialData.name || "",
          apellidoPaterno: initialData.apellidoPaterno || "",
          apellidoMaterno: initialData.apellidoMaterno || "",
          dni: initialData.dni || "",
          email: initialData.email || "",
          sexo: initialData.sexo || "MASCULINO",
          role: (initialData.role || "profesor") as StaffValues["role"],
          cargoId: initialData.cargoId || "",
          area: initialData.area || "",
          telefono: initialData.telefono || "",
          direccion: initialData.direccion || "",
          especialidad: initialData.especialidad || "",
          titulo: initialData.titulo || "",
          numeroContrato: initialData.numeroContrato || "",
          colegioProfesor: initialData.colegioProfesor || "",
          escalaMagisterial: initialData.escalaMagisterial || "",
          fechaIngreso: initialData.fechaIngreso
            ? new Date(initialData.fechaIngreso)
            : undefined,
          estadoId:
            initialData.estadoId ||
            estados.find((e) => e.nombre === "Activo")?.id ||
            estados[0]?.id ||
            "",
          institucionId:
            initialData.institucionId || instituciones[0]?.id || "",
        }
      : {
          name: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          dni: "",
          email: "",
          sexo: "MASCULINO",
          telefono: "",
          direccion: "",
          role: "profesor",
          cargoId: cargos[0]?.id || "",
          area: "",
          especialidad: "",
          titulo: "",
          numeroContrato: "",
          fechaIngreso: new Date(),
          institucionId: instituciones[0]?.id || "",
          estadoId:
            estados.find((e) => e.nombre === "Activo")?.id ||
            estados[0]?.id ||
            "",
          colegioProfesor: "",
          escalaMagisterial: "",
        },
  });

  const onSubmit = (values: StaffValues) => {
    startTransition(() => {
      const sanitizedValues = {
        name: values.name,
        apellidoPaterno: values.apellidoPaterno,
        apellidoMaterno: values.apellidoMaterno || "",
        dni: values.dni,
        email: values.email,
        sexo: values.sexo,
        telefono: values.telefono || "",
        direccion: values.direccion || "",
        role: values.role,
        cargoId: values.cargoId,
        area: values.area,
        especialidad: values.especialidad || "",
        titulo: values.titulo || "",
        numeroContrato: values.numeroContrato || "",
        fechaIngreso: values.fechaIngreso,
        estadoId: values.estadoId,
        institucionId: values.institucionId,
        colegioProfesor: values.colegioProfesor || "",
        escalaMagisterial: values.escalaMagisterial || "",
      };

      const action = id
        ? updateStaffAction(id, sanitizedValues)
        : createStaffAction(sanitizedValues);

      action.then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          onSuccess?.();
        }
      });
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

  const onError = (errors: FieldErrors<StaffValues>) => {
    console.error("StaffForm Validation Errors:", errors);
    const errorMessages = (
      Object.values(errors) as (FieldError | undefined)[]
    )
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));

    if (errorMessages.length > 0) {
      toast.error(
        "Por favor, revise los siguientes errores: " + errorMessages.join(", "),
      );
    } else {
      toast.error(
        "Verifique los campos requeridos del formulario.",
      );
    }
  };

  const selectedRole = form.watch("role");

  const filteredCargos = useMemo(() => {
    const allowedCodes = new Set(ROLE_CARGOS_MAPPING[selectedRole] || []);
    return cargos.filter((c) => allowedCodes.has(c.codigo));
  }, [cargos, selectedRole]);

  useEffect(() => {
    const currentCargoId = form.getValues("cargoId");
    if (
      currentCargoId &&
      !filteredCargos.some((c) => c.id === currentCargoId)
    ) {
      form.setValue("cargoId", filteredCargos[0]?.id || "");
    }
  }, [selectedRole, filteredCargos, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-6 px-1 py-1"
      >
        <PersonalInfoSection form={form} disabled={isRootAdmin} />

        <LaboralSection
          form={form}
          disabled={isRootAdmin}
          isPending={isPending}
          cargos={filteredCargos}
          estados={estados}
        />

        {selectedRole === "profesor" && (
          <ProfesionalSection form={form} disabled={isRootAdmin} />
        )}

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        {!isRootAdmin && (
          <StaffFormActions
            isPending={isPending}
            isEdit={Boolean(id)}
            onSuccess={onSuccess}
          />
        )}
      </form>
    </Form>
  );
}

/* ── Subcomponentes ── */

function SectionHeader({
  icon: Icon,
  title,
  description,
  colorClass,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  colorClass: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
      <div
        className={`size-8 rounded-xl border flex items-center justify-center shrink-0 ${colorClass}`}
      >
        <Icon className="size-4" />
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h3>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PersonalInfoSection({
  form,
  disabled,
}: {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        icon={IconUser}
        title="1. Información Personal"
        description="Datos de identidad y contacto del colaborador. El acceso al sistema se realiza mediante su email y DNI."
        colorClass="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Nombres
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Juan Alberto"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
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
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Paterno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Pérez"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
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
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Apellido Materno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="García"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dni"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                DNI / Documento Identidad
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconId className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="01234567"
                    maxLength={8}
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="md:col-span-5">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Correo Electrónico
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMail className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    type="email"
                    placeholder="docente@colegio.edu.pe"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sexo"
          render={({ field }) => (
            <FormItem className="md:col-span-3">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Sexo / Género
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {SEXO_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-xs font-medium">
                      {option.label}
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
          name="telefono"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Teléfono / WhatsApp
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconPhone className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="987 654 321"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem className="md:col-span-8">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Dirección Domiciliaria
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <IconMapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="Av. España 456, Trujillo"
                    className="pl-9 bg-background border-border/40 rounded-xl text-xs h-9"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function LaboralSection({
  form,
  disabled,
  isPending,
  cargos,
  estados,
}: {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
  isPending: boolean;
  cargos: Cargo[];
  estados: { id: string; nombre: string }[];
}) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconBriefcase}
        title="2. Vínculo Laboral y Cargo"
        description="Asignación de rol en el sistema, cargo específico y área de trabajo."
        colorClass="bg-blue-500/10 border-blue-500/20 text-blue-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Rol en el Sistema
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Rol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {STAFF_ROLE_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs font-medium"
                    >
                      {option.label}
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
          name="cargoId"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Cargo Específico
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Cargo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {cargos.map((cargo) => (
                    <SelectItem
                      key={cargo.id}
                      value={cargo.id}
                      className="text-xs font-medium"
                    >
                      {cargo.nombre}
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
          name="area"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Área / Departamento
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Académica, Ciencias, etc."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fechaIngreso"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Fecha de Ingreso
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      disabled={disabled || isPending}
                      variant="outline"
                      className={cn(
                        "w-full bg-background border-border/40 rounded-xl text-xs h-9 font-medium justify-between",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span>
                        {field.value
                          ? format(field.value, "PPP", { locale: es })
                          : "Seleccionar fecha"}
                      </span>
                      <IconCalendar className="size-4 opacity-50 shrink-0 ml-1" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-2xl border-border/40"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estadoId"
          render={({ field }) => (
            <FormItem className="md:col-span-4">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Estado del Personal
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {estados.map((e) => (
                    <SelectItem key={e.id} value={e.id} className="text-xs font-medium">
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function ProfesionalSection({
  form,
  disabled,
}: {
  form: UseFormReturn<StaffValues>;
  disabled: boolean;
}) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconCertificate}
        title="3. Perfil Profesional Docente"
        description="Especialidad pedagógica, colegiatura y escala magisterial."
        colorClass="bg-amber-500/10 border-amber-500/20 text-amber-500"
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        <FormField
          control={form.control}
          name="especialidad"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Especialidad
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Matemática, Comunicación, etc."
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Título / Grado Académico
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="Licenciado en Educación"
                  className="bg-background border-border/40 rounded-xl text-xs h-9"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="colegioProfesor"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Colegiatura CPP (Opcional)
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={disabled}
                  placeholder="012345"
                  className="bg-background border-border/40 rounded-xl text-xs h-9 font-mono"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="escalaMagisterial"
          render={({ field }) => (
            <FormItem className="md:col-span-6">
              <FormLabel className="text-xs font-medium text-foreground/80">
                Escala Magisterial
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger className="bg-background border-border/40 rounded-xl text-xs h-9 font-medium w-full">
                    <SelectValue placeholder="Seleccionar Escala" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-xl border-border/40">
                  {ESCALA_MAGISTERIAL_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs font-medium"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}

function StaffFormActions({
  isPending,
  isEdit,
  onSuccess,
}: {
  isPending: boolean;
  isEdit: boolean;
  onSuccess?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
      {onSuccess && (
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
          disabled={isPending}
        >
          Cancelar
        </Button>
      )}
      <Button
        disabled={isPending}
        type="submit"
        className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            <span>Procesando...</span>
          </>
        ) : (
          <>
            <IconDeviceFloppy className="size-4" />
            <span>{isEdit ? "Guardar Cambios" : "Registrar Colaborador"}</span>
          </>
        )}
      </Button>
    </div>
  );
}
