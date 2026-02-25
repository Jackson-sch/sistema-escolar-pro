"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  IconUser,
  IconId,
  IconMail,
  IconCalendar,
  IconLoader2,
  IconBriefcase,
  IconCertificate,
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
} from "@/lib/constants";
import { useEffect, useMemo } from "react";
import { useFormModal } from "@/components/modals/form-modal-context";

interface StaffFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
  cargos: { id: string; nombre: string; codigo: string }[];
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
          role: initialData.role || "profesor",
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
      // Sanitizar valores para enviar solo lo que el schema permite
      // Esto evita errores de Prisma por argumentos desconocidos (como objetos anidados)
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

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmit)());
    return () => setOnSubmit(undefined);
  }, [form, onSubmit, setOnSubmit]);

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const onError = (errors: any) => {
    console.error("StaffForm Validation Errors:", errors);
    const errorMessages = Object.values(errors)
      .map((error: any) => error.message)
      .filter(Boolean);

    if (errorMessages.length > 0) {
      toast.error(
        "Por favor, revise los siguientes errores: " + errorMessages.join(", "),
      );
    } else {
      toast.error(
        "Error de validación en el formulario. Por favor, verifique todos los campos.",
      );
    }
  };

  const selectedRole = form.watch("role");

  const filteredCargos = useMemo(() => {
    const allowedCodes = ROLE_CARGOS_MAPPING[selectedRole] || [];
    return cargos.filter((c) => allowedCodes.includes(c.codigo));
  }, [cargos, selectedRole]);

  // Reset cargo if it's not in the filtered list
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
        className="space-y-3"
      >
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="p-6 rounded-[2rem] border space-y-4">
          <div className="flex items-center gap-3 pb-2 border-b border-white/5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <IconUser className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                Información Personal
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium">
                Datos básicos de identificación del colaborador.
                <span className="text-primary/80 ml-1">
                  (El acceso al sistema será con su email y su DNI como
                  contraseña)
                </span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Nombres
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isRootAdmin}
                      placeholder="Ejem: Juan Alberto"
                      className="rounded-full transition-all px-5"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Apellido Paterno
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isRootAdmin}
                      placeholder="Pérez"
                      className="rounded-full transition-all px-5"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apellidoMaterno"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Apellido Materno
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isRootAdmin}
                      placeholder="García"
                      className="rounded-full transition-all px-5"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    DNI
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <IconId className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        {...field}
                        disabled={isRootAdmin}
                        placeholder="00000000"
                        maxLength={8}
                        className="rounded-full transition-all pl-10 pr-5"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Correo Electrónico
                  </FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <IconMail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                      <Input
                        {...field}
                        disabled={isRootAdmin}
                        type="email"
                        placeholder="nombre@colegio.edu.pe"
                        className="rounded-full transition-all pl-10 pr-5"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN 2: VÍNCULO LABORAL */}
        <div className="p-6 rounded-[2rem] border space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <IconBriefcase className="size-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                Vínculo Laboral
              </h3>
              <p className="text-[10px] text-muted-foreground font-medium">
                Asignación y cargo institucional
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Rol en el Sistema
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isRootAdmin}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-full transition-all px-5">
                        <SelectValue placeholder="Seleccionar Rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {STAFF_ROLE_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="rounded-xl"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cargoId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Cargo Específico
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isRootAdmin}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-full transition-all px-5">
                        <SelectValue placeholder="Seleccionar Cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {filteredCargos.map((cargo) => (
                        <SelectItem
                          key={cargo.id}
                          value={cargo.id}
                          className="rounded-xl"
                        >
                          {cargo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="area"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Área / Departamento
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isRootAdmin}
                      placeholder="Ejem: Académica, Administración"
                      className="rounded-full transition-all px-5"
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaIngreso"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                    Fecha de Ingreso
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          disabled={isRootAdmin || isPending}
                          variant={"outline"}
                          className={cn(
                            "w-full rounded-full transition-all px-5 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          <span className="truncate">
                            {field.value
                              ? format(field.value, "PPP", { locale: es })
                              : "Seleccionar fecha"}
                          </span>
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* SECCIÓN 3: PERFIL PROFESIONAL (Solo si es profesor) */}
        {selectedRole === "profesor" && (
          <div className="p-6 rounded-[2rem] border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <IconCertificate className="size-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                  Perfil Profesional Docente
                </h3>
                <p className="text-[10px] text-muted-foreground font-medium">
                  Información académica y magisterial
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="especialidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                      Especialidad
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isRootAdmin}
                        placeholder="Ejem: Matemática y Física"
                        className="rounded-full transition-all px-5"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                      Título / Grado Académico
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isRootAdmin}
                        placeholder="Licenciado en Educación"
                        className="rounded-full transition-all px-5"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colegioProfesor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                      N° Colegiatura (CPP)
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isRootAdmin}
                        placeholder="000000"
                        className="rounded-full transition-all px-5"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="escalaMagisterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-wider ml-1 text-muted-foreground/70">
                      Escala Magisterial
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full rounded-full transition-all px-5"
                          disabled={isRootAdmin}
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
                        {ESCALA_MAGISTERIAL_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="rounded-xl"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <div className="pt-4 flex flex-col gap-3">
          {!isRootAdmin && (
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
                disabled={isPending}
                type="submit"
                className="w-full sm:w-auto rounded-full px-8"
              >
                {isPending && (
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isPending
                  ? "Procesando Expediente..."
                  : id
                    ? "Actualizar Personal"
                    : "Finalizar Registro de Personal"}
              </Button>
            </div>
          )}
          <p className="text-[10px] text-center text-muted-foreground/50 font-medium pt-2">
            Al registrar se creará un expediente laboral digital con acceso
            restringido para directivos.
          </p>
        </div>
      </form>
    </Form>
  );
}
