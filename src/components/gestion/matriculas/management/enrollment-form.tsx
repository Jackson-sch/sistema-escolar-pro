"use client";

import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useTransition,
  useState,
  useEffect,
  useRef,
  type ComponentType,
} from "react";
import {
  IconUser,
  IconSchool,
  IconLoader2,
  IconArrowRight,
  IconBuildingCommunity,
  IconAlertCircle,
  IconCheck,
  IconId,
  IconSearch,
  IconCalendarEvent,
  IconBabyCarriage,
  IconCertificate,
  IconDiscount2,
  IconCalendarFilled,
  IconChecklist,
  IconMapPin,
} from "@tabler/icons-react";
import { cn, calculateAge } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { EnrollmentSchema, EnrollmentValues } from "@/lib/schemas/enrollment";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createEnrollmentAction,
  getUnenrolledStudentsAction,
} from "@/actions/enrollments";
import { getNivelesAcademicosAction } from "@/actions/students";
import { getStudentByIdAction } from "@/actions/students";
import { toast } from "sonner";
import { getAnioLectivoOptions } from "@/lib/constants";
import { AcademicLevelSelector } from "./academic-level-selector";
import { useFormModal } from "@/components/modals/form-modal-context";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface NivelAcademicoOpcion {
  id: string;
  nivel: { nombre: string };
}

interface EstudianteOpcion {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni?: string | null;
  fechaNacimiento?: Date | string | null;
  direccion?: string | null;
}

interface EnrollmentFormProps {
  onSuccess?: () => void;
  nivelesAcademicos: NivelAcademicoOpcion[];
  defaultStudentId?: string;
  onCancel?: () => void;
}

/* ─── Shared Section Header ─── */

function SectionHeader({
  icon: Icon,
  iconClassName,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/30">
      <div
        className={`size-8 rounded-xl border flex items-center justify-center shrink-0 ${iconClassName}`}
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

/* ─── Section 1: Selección del Estudiante ─── */

function StudentSelectionSection({
  form,
  students,
  isLoadingStudents,
}: {
  form: UseFormReturn<EnrollmentValues>;
  students: EstudianteOpcion[];
  isLoadingStudents: boolean;
}) {
  const [openStudentPopover, setOpenStudentPopover] = useState(false);

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={IconUser}
        iconClassName="bg-indigo-500/10 border-indigo-500/20 text-indigo-500"
        title="1. Selección del Estudiante"
        description="Alumnos sin matrícula activa en el periodo lectivo seleccionado."
      />

      <FormField
        control={form.control}
        name="estudianteId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <Popover
              open={openStudentPopover}
              onOpenChange={setOpenStudentPopover}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "h-10 w-full justify-between bg-background border-border/40 text-xs font-medium transition-[background-color,box-shadow] hover:bg-muted/40 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-3",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    {field.value ? (
                      students.find((s) => s.id === field.value) ? (
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-6 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 font-semibold text-xs">
                            <IconUser className="size-3.5" />
                          </div>
                          <span className="font-semibold text-foreground capitalize">
                            {
                              students.find((s) => s.id === field.value)
                                ?.apellidoPaterno
                            }{" "}
                            {
                              students.find((s) => s.id === field.value)
                                ?.apellidoMaterno
                            }
                            {", "}
                            {students.find((s) => s.id === field.value)?.name}
                          </span>
                        </div>
                      ) : (
                        "Estudiante seleccionado no encontrado"
                      )
                    ) : isLoadingStudents ? (
                      "Cargando lista de estudiantes..."
                    ) : (
                      "Buscar o seleccionar un estudiante..."
                    )}
                    <IconSearch className="size-4 shrink-0 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-border/40 bg-background/95 rounded-2xl shadow-xl">
                <Command className="bg-transparent">
                  <CommandInput
                    placeholder="Buscar por nombre o DNI..."
                    className="text-xs"
                  />
                  <CommandList className="max-h-[260px]">
                    <CommandEmpty>
                      <div className="p-5 flex flex-col items-center text-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-muted border border-border/40">
                          <IconAlertCircle className="size-5 text-muted-foreground" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-xs text-foreground">
                            Sin resultados
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            No se encontraron alumnos pendientes de matrícula.
                          </p>
                        </div>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {students.map((student) => (
                        <CommandItem
                          value={`${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno} ${student.dni}`}
                          key={student.id}
                          onSelect={() => {
                            form.setValue("estudianteId", student.id, {
                              shouldDirty: true,
                            });
                            setOpenStudentPopover(false);
                          }}
                          className="cursor-pointer py-2 px-3 text-xs aria-selected:bg-indigo-500/10 aria-selected:text-indigo-600 capitalize rounded-lg"
                        >
                          <IconCheck
                            className={cn(
                              "mr-2 size-4 text-indigo-600",
                              student.id === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-foreground">
                              {student.apellidoPaterno}{" "}
                              {student.apellidoMaterno}, {student.name}
                            </span>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1 font-mono">
                                <IconId className="size-3.5" />
                                DNI: {student.dni || "-"}
                              </span>
                              <span className="flex items-center gap-1 text-indigo-500 font-medium">
                                <IconCalendarEvent className="size-3.5" />
                                {calculateAge(student.fechaNacimiento ?? "")} años
                              </span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Vista Previa de la Ficha del Estudiante */}
      {form.watch("estudianteId") && (
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden">
          {(() => {
            const s = students.find((s) => s.id === form.watch("estudianteId"));
            if (!s) return null;
            return (
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-md shadow-indigo-500/20 shrink-0">
                  {s.name[0]}
                  {s.apellidoPaterno[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate capitalize">
                    {s.name} {s.apellidoPaterno} {s.apellidoMaterno}
                  </h4>
                  <div className="flex flex-wrap gap-y-1.5 gap-x-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <IconId className="size-3.5 text-indigo-500" />
                      DNI: {s.dni || "-"}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <IconCalendarFilled className="size-3.5 text-indigo-500" />
                      {calculateAge(s.fechaNacimiento ?? "")} años
                    </span>
                    {s.direccion && (
                      <span className="flex items-center gap-1 truncate font-medium">
                        <IconMapPin className="size-3.5 text-indigo-500" />
                        {s.direccion}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ─── Section 2: Asignación Académica ─── */

function AcademicAssignmentSection({
  form,
  allNiveles,
  filteredByLevel,
  selectedLevel,
  onSelectLevel,
  isLoading,
  anio,
}: {
  form: UseFormReturn<EnrollmentValues>;
  allNiveles: NivelAcademicoOpcion[];
  filteredByLevel: NivelAcademicoOpcion[];
  selectedLevel: string | null;
  onSelectLevel: (level: string | null) => void;
  isLoading: boolean;
  anio: number;
}) {
  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconSchool}
        iconClassName="bg-blue-500/10 border-blue-500/20 text-blue-500"
        title="2. Asignación Académica"
        description="Seleccione el nivel educativo, periodo lectivo y sección correspondiente."
      />

      <div className="space-y-4">
        {/* Selector de Nivel Educativo */}
        <div className="space-y-2">
          <FormLabel className="text-xs font-medium text-foreground/80">
            Nivel Educativo
          </FormLabel>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-muted/20 rounded-2xl border border-border/30">
            {[
              { id: "INICIAL", icon: IconBabyCarriage },
              { id: "PRIMARIA", icon: IconSchool },
              { id: "SECUNDARIA", icon: IconCertificate },
            ].map((level) => {
              const isActive = selectedLevel === level.id;
              const Icon = level.icon;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => onSelectLevel(isActive ? null : level.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2 px-3 rounded-xl transition-[color,background-color,border-color,box-shadow] text-xs font-semibold border cursor-pointer",
                    isActive
                      ? "text-white bg-blue-600 border-blue-600 shadow-md shadow-blue-500/20"
                      : "text-muted-foreground bg-background hover:bg-muted/40 border-border/40 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="uppercase tracking-wider">{level.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Periodo y Aula/Sección */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <FormField
            control={form.control}
            name="anioAcademico"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Periodo Lectivo
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger className="h-10 w-full rounded-xl border-border/40 bg-background font-medium text-xs">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 rounded-xl">
                    {getAnioLectivoOptions().map((option) => (
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

          <AcademicLevelSelector
            form={form}
            name="nivelAcademicoId"
            allNiveles={allNiveles}
            filteredByLevel={filteredByLevel}
            selectedLevel={selectedLevel}
            isLoading={isLoading}
            anio={anio}
          />
        </div>

        <FormField
          control={form.control}
          name="procedencia"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-foreground/80">
                Institución de Procedencia
              </FormLabel>
              <FormControl>
                <div className="relative group/input">
                  <IconBuildingCommunity className="absolute left-3.5 top-2.5 size-4 text-muted-foreground/60" />
                  <Input
                    {...field}
                    className="h-9 bg-background border-border/40 pl-10 text-xs rounded-xl"
                    placeholder="Nombre del colegio anterior (Opcional)"
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

/* ─── Section 3: Beneficios y Condiciones ─── */

function BenefitsConditionSection({
  form,
}: {
  form: UseFormReturn<EnrollmentValues>;
}) {
  const tipoBeca = form.watch("tipoBeca");

  return (
    <div className="space-y-4 pt-2">
      <SectionHeader
        icon={IconChecklist}
        iconClassName="bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
        title="3. Beneficios y Condición del Alumno"
        description="Configuración de ingreso, repitencia y asignación de becas."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Condición Académica */}
        <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
          <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wider">
            Condición del Alumno
          </h4>

          <FormField
            control={form.control}
            name="esPrimeraVez"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-emerald-500/10 border-emerald-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground",
                      )}
                    >
                      Nuevo Ingreso
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Primer año en la institución
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </label>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="esRepitente"
            render={({ field }) => (
              <FormItem>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-[background-color,border-color]",
                    field.value
                      ? "bg-amber-500/10 border-amber-500/30"
                      : "bg-background border-border/40 hover:bg-muted/40",
                  )}
                >
                  <div className="space-y-0.5">
                    <p
                      className={cn(
                        "text-xs font-semibold",
                        field.value
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground",
                      )}
                    >
                      Repitencia
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Cursando el grado nuevamente
                    </p>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-amber-500"
                  />
                </label>
              </FormItem>
            )}
          />
        </div>

        {/* Becas y Descuentos */}
        <div className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border/30">
          <h4 className="text-xs font-semibold text-foreground/90 uppercase tracking-wider flex items-center gap-1.5">
            <IconDiscount2 className="size-4 text-pink-500" />
            Becas y Beneficios
          </h4>

          <FormField
            control={form.control}
            name="tipoBeca"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-foreground/80">
                  Tipo de Beca
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full rounded-xl border-border/40 bg-background font-medium text-xs">
                      <SelectValue placeholder="Seleccione beca" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 rounded-xl">
                    <SelectItem value="ninguna" className="text-xs font-medium">
                      Sin Beca
                    </SelectItem>
                    <SelectItem
                      value="socioeconomica"
                      className="text-xs font-medium"
                    >
                      Socioeconómica (20%)
                    </SelectItem>
                    <SelectItem
                      value="excelencia"
                      className="text-xs font-medium"
                    >
                      Excelencia Académica (50%)
                    </SelectItem>
                    <SelectItem
                      value="deportiva"
                      className="text-xs font-medium"
                    >
                      Talento Deportivo (30%)
                    </SelectItem>
                    <SelectItem
                      value="hermandad"
                      className="text-xs font-medium"
                    >
                      Hermandad (15%)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {tipoBeca !== "ninguna" && (
            <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                  Descuento Aplicado
                </span>
                <span className="text-xs font-bold text-pink-600 dark:text-pink-400">
                  {tipoBeca === "socioeconomica"
                    ? "20%"
                    : tipoBeca === "excelencia"
                      ? "50%"
                      : tipoBeca === "deportiva"
                        ? "30%"
                        : "15%"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="observaciones"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs font-medium text-foreground/80">
              Observaciones Adicionales (Opcional)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Notas o comentarios sobre el proceso de matrícula..."
                className="min-h-[60px] resize-none border-border/40 bg-background p-3 text-xs rounded-xl"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/* ─── Footer Actions ─── */

function EnrollmentFormActions({
  isPending,
  onCancel,
}: {
  isPending: boolean;
  onCancel?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/30">
      {onCancel && (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40"
        >
          Cancelar
        </Button>
      )}
      <Button
        type="submit"
        disabled={isPending}
        className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[180px]"
      >
        {isPending ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            <span>Registrando...</span>
          </>
        ) : (
          <>
            <span>Confirmar Matrícula</span>
            <IconArrowRight className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}

/* ─── Main Component ─── */

export function EnrollmentForm({
  onSuccess,
  nivelesAcademicos,
  defaultStudentId,
  onCancel,
}: EnrollmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [students, setStudents] = useState<EstudianteOpcion[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [allNiveles, setAllNiveles] = useState<NivelAcademicoOpcion[]>(
    nivelesAcademicos,
  );
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoadingNiveles, setIsLoadingNiveles] = useState(false);

  const form = useForm<EnrollmentValues>({
    resolver: zodResolver(EnrollmentSchema),
    defaultValues: {
      estudianteId: defaultStudentId || "",
      nivelAcademicoId: "",
      anioAcademico: new Date().getFullYear(),
      esPrimeraVez: true,
      esRepitente: false,
      procedencia: "",
      observaciones: "",
      estado: "activo",
      tipoBeca: "ninguna",
      descuentoBeca: 0,
    },
  });

  const onSubmit = (values: EnrollmentValues) => {
    startTransition(() => {
      createEnrollmentAction(values).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          setIsDirty(false);
          form.reset();
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

  const anio = form.watch("anioAcademico");

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setIsLoadingStudents(true);
      setIsLoadingNiveles(true);
      try {
        if (ignore) return;
        const [studentsRes, nivelesRes, defaultStudentRes] = await Promise.all([
          getUnenrolledStudentsAction(anio),
          getNivelesAcademicosAction(anio),
          defaultStudentId
            ? getStudentByIdAction(defaultStudentId)
            : Promise.resolve({ data: null }),
        ]);
        if (ignore) return;

        let finalStudents = studentsRes.data || [];

        const mappedStudents = finalStudents.map(
          (s: {
            id: string;
            name: string | null;
            apellidoPaterno: string | null;
            apellidoMaterno: string | null;
            dni: string | null;
            fechaNacimiento: string | Date | null;
          }) => ({
            id: s.id,
            name: s.name || "",
            apellidoPaterno: s.apellidoPaterno || "",
            apellidoMaterno: s.apellidoMaterno || "",
            dni: s.dni || "",
            fechaNacimiento: s.fechaNacimiento
              ? new Date(s.fechaNacimiento)
              : null,
          }),
        );

        setStudents(mappedStudents);
        if (nivelesRes.data) {
          setAllNiveles(nivelesRes.data);
        }

        const currentNivelId = form.getValues("nivelAcademicoId");
        if (
          currentNivelId &&
          nivelesRes.data &&
          !nivelesRes.data.some((n) => n.id === currentNivelId)
        ) {
          form.setValue("nivelAcademicoId", "", { shouldDirty: true });
        }
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingNiveles(false);
      }
    };
    loadData();
    return () => {
      ignore = true;
    };
  }, [anio, defaultStudentId, form]);

  const filteredByLevel = selectedLevel
    ? allNiveles.filter((n) => n.nivel.nombre === selectedLevel)
    : allNiveles;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 px-1 py-1"
      >
        <StudentSelectionSection
          form={form}
          students={students}
          isLoadingStudents={isLoadingStudents}
        />
        <AcademicAssignmentSection
          form={form}
          allNiveles={allNiveles}
          filteredByLevel={filteredByLevel}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          isLoading={isLoadingNiveles}
          anio={anio}
        />
        <BenefitsConditionSection form={form} />

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Botones de Acción */}
        <EnrollmentFormActions isPending={isPending} onCancel={onCancel} />
      </form>
    </Form>
  );
}
