"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState, useEffect } from "react";
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
import { toast } from "sonner";
import { ANIO_LECTIVO_OPTIONS } from "@/lib/constants";
import { AcademicLevelSelector } from "./academic-level-selector";
import { useFormModal } from "@/components/modals/form-modal-context";
import { getStudentByIdAction } from "@/actions/students";

interface EnrollmentFormProps {
  onSuccess?: () => void;
  nivelesAcademicos: any[];
  defaultStudentId?: string;
  onCancel?: () => void;
}

export function EnrollmentForm({
  onSuccess,
  nivelesAcademicos,
  defaultStudentId,
  onCancel,
}: EnrollmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const { setIsDirty, setOnSubmit } = useFormModal();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [allNiveles, setAllNiveles] = useState<any[]>(nivelesAcademicos);
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

  useEffect(() => {
    setOnSubmit(() => form.handleSubmit(onSubmit)());
    return () => setOnSubmit(undefined);
  }, [form, onSubmit, setOnSubmit]);

  const { isDirty } = form.formState;

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  const anio = form.watch("anioAcademico");
  const tipoBeca = form.watch("tipoBeca");
  const descuentoBeca = form.watch("descuentoBeca");

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingStudents(true);
      setIsLoadingNiveles(true);

      const [studentsRes, nivelesRes, defaultStudentRes] = await Promise.all([
        getUnenrolledStudentsAction(anio),
        getNivelesAcademicosAction(anio),
        defaultStudentId
          ? getStudentByIdAction(defaultStudentId)
          : Promise.resolve({ data: null }),
      ]);

      let finalStudents = studentsRes.data || [];

      // Si tenemos un estudiante por defecto y no está en la lista de no matriculados, añadirlo
      if (defaultStudentId && defaultStudentRes?.data) {
        if (!finalStudents.some((s: any) => s.id === defaultStudentId)) {
          finalStudents = [defaultStudentRes.data, ...finalStudents];
        }
      }

      setStudents(finalStudents);
      if (nivelesRes.data) {
        setAllNiveles(nivelesRes.data);
      }

      setIsLoadingStudents(false);
      setIsLoadingNiveles(false);

      const currentNivelId = form.getValues("nivelAcademicoId");
      if (
        currentNivelId &&
        nivelesRes.data &&
        !nivelesRes.data.some((n: any) => n.id === currentNivelId)
      ) {
        form.setValue("nivelAcademicoId", "", { shouldDirty: true });
      }
    };
    loadData();
  }, [anio, defaultStudentId]);

  const filteredByLevel = selectedLevel
    ? allNiveles.filter((n) => n.nivel.nombre === selectedLevel)
    : allNiveles;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-3">
            {/* SECCIÓN 1: ESTUDIANTE */}
            <div className="group relative overflow-hidden">
              <div className="mb-3 flex items-center gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold tracking-wider text-foreground/90">
                    Estudiante
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    Seleccione el alumno a matricular, solo se muestran los
                    alumnos que no tienen matricula activa en el año academico
                    seleccionado
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="estudianteId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-12 w-full justify-between border-white/5 bg-black/20 text-sm transition-all hover:bg-black/30 hover:text-foreground focus:border-violet-500/30 focus:bg-black/40 focus:ring-4 focus:ring-violet-500/10 rounded-2xl p-0 px-4",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              students.find((s) => s.id === field.value) ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                                    <IconUser className="h-4 w-4" />
                                  </div>
                                  <span className="font-semibold text-foreground/90 capitalize">
                                    {
                                      students.find((s) => s.id === field.value)
                                        ?.apellidoPaterno
                                    }{" "}
                                    {
                                      students.find((s) => s.id === field.value)
                                        ?.apellidoMaterno
                                    }
                                    {", "}
                                    {
                                      students.find((s) => s.id === field.value)
                                        ?.name
                                    }
                                  </span>
                                </div>
                              ) : (
                                "Estudiante seleccionado no encontrado"
                              )
                            ) : isLoadingStudents ? (
                              "Cargando lista ..."
                            ) : (
                              "Busca o selecciona un estudiante..."
                            )}
                            <IconSearch className="h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-white/10 bg-zinc-950/95 backdrop-blur-xl">
                        <Command className="bg-transparent">
                          <CommandInput placeholder="Buscar por nombre o DNI..." />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>
                              <div className="p-6 flex flex-col items-center text-center gap-3">
                                <div className="flex w-12 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-white/5">
                                  <IconAlertCircle className="h-6 w-6 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold text-sm text-foreground">
                                    No encontrado
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    No hay alumnos que coincidan con la búsqueda
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
                                  }}
                                  className="cursor-pointer py-2 aria-selected:bg-violet-500/10 aria-selected:text-violet-400 capitalize"
                                >
                                  <IconCheck
                                    className={cn(
                                      "mr-2 size-4",
                                      student.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-semibold text-foreground/90">
                                      {student.apellidoPaterno}{" "}
                                      {student.apellidoMaterno}, {student.name}
                                    </span>
                                    <div className="flex items-center gap-3 font-medium tracking-wider text-muted-foreground/70">
                                      <span className="flex items-center gap-1">
                                        <IconId className="size-4" />
                                        {student.dni}
                                      </span>
                                      <span className="flex items-center gap-1 text-violet-400/90 font-bold">
                                        <IconCalendarEvent className="size-4 text-violet-500" />
                                        {calculateAge(student.fechaNacimiento)}{" "}
                                        años
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

              {/* Profile Preview */}
              {form.watch("estudianteId") && (
                <div className="mt-4 p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md relative overflow-hidden group/profile">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover/profile:opacity-20 transition-opacity">
                    <IconId className="h-16 w-16" />
                  </div>

                  {(() => {
                    const s = students.find(
                      (s) => s.id === form.watch("estudianteId"),
                    );
                    if (!s) return null;
                    return (
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                          {s.name[0]}
                          {s.apellidoPaterno[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-foreground truncate capitalize">
                            {s.name} {s.apellidoPaterno} {s.apellidoMaterno}
                          </h4>
                          <div className="flex flex-wrap gap-y-2 gap-x-4 mt-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="p-1 rounded-md bg-white/5">
                                <IconId className="size-4 text-violet-400" />
                              </div>
                              <span className="font-medium tracking-wide">
                                DNI: {s.dni}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="p-1 rounded-md bg-white/5">
                                <IconCalendarFilled className="size-4 text-pink-400" />
                              </div>
                              <span className="font-medium tracking-wide">
                                {calculateAge(s.fechaNacimiento)} años
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <div className="p-1 rounded-md bg-white/5">
                                <IconBuildingCommunity className="size-4 text-blue-400" />
                              </div>
                              <span className="font-medium tracking-wide">
                                {s.direccion || "Sin dirección"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: ACADÉMICO */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-blue-500/5 via-transparent to-transparent p-6 transition-all hover:border-blue-500/10">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20">
                  <IconSchool className="size-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold tracking-widest text-foreground/90">
                    Datos Académicos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Asignación de aula y periodo
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Nivel Educativo Selector - Full Width */}
                <div className="space-y-2">
                  <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-500" />
                    Nivel Educativo
                  </FormLabel>
                  <div className="grid grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md">
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
                          onClick={() =>
                            setSelectedLevel(isActive ? null : level.id)
                          }
                          className={cn(
                            "relative flex flex-col items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 overflow-hidden group",
                            isActive
                              ? "text-white bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5 transition-transform duration-300 group-hover:scale-110",
                              isActive
                                ? "text-white"
                                : "text-muted-foreground/50",
                            )}
                          />
                          <span className="uppercase tracking-widest leading-none">
                            {level.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Periodo and Aula - Same Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <FormField
                    control={form.control}
                    name="anioAcademico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Periodo
                        </FormLabel>
                        <Select
                          onValueChange={(v) => field.onChange(parseInt(v))}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="h-24 w-full rounded-2xl border-white/5 bg-black/20 font-medium transition-all hover:bg-black/30">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-white/10 backdrop-blur-xl">
                            {ANIO_LECTIVO_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
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
                    isLoading={isLoadingNiveles}
                    anio={anio}
                  />
                </div>
              </div>

              <div className="mt-3">
                <FormField
                  control={form.control}
                  name="procedencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Institución de Procedencia
                      </FormLabel>
                      <FormControl>
                        <div className="relative group/input">
                          <IconBuildingCommunity className="absolute left-4 top-2.5 size-5 text-muted-foreground/50 transition-colors group-hover/input:text-blue-400/70" />
                          <Input
                            {...field}
                            className="h-11 bg-black/20 border-white/5 pl-12 placeholder:text-xs transition-all hover:bg-black/30 focus:border-blue-500/30 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-2xl"
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

            {/* SECCIÓN 3: BENEFICIOS Y CONDICIONES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-emerald-500/5 via-transparent to-transparent p-4 transition-all hover:border-emerald-500/10">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                    <IconCheck className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold tracking-widest text-foreground/90">
                      Condición
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Estado académico del alumno
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="esPrimeraVez"
                    render={({ field }) => (
                      <FormItem>
                        <label
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                            field.value
                              ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_-12px_rgba(16,185,129,0.5)]"
                              : "bg-black/20 border-white/5 hover:bg-black/40",
                          )}
                        >
                          <div className="space-y-1">
                            <p
                              className={cn(
                                "text-sm font-bold",
                                field.value
                                  ? "text-emerald-400"
                                  : "text-foreground",
                              )}
                            >
                              Nuevo Ingreso
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Primer año en la institución
                            </p>
                          </div>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-emerald-500"
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
                            "flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all",
                            field.value
                              ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_-12px_rgba(245,158,11,0.5)]"
                              : "bg-black/20 border-white/5 hover:bg-black/40",
                          )}
                        >
                          <div className="space-y-1">
                            <p
                              className={cn(
                                "text-sm font-bold",
                                field.value
                                  ? "text-amber-400"
                                  : "text-foreground",
                              )}
                            >
                              Repitencia
                            </p>
                            <p className="text-xs text-muted-foreground">
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
              </div>

              <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-pink-500/5 via-transparent to-transparent p-4 transition-all hover:border-pink-500/10">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 ring-1 ring-inset ring-pink-500/20">
                    <IconDiscount2 className="size-5" />
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold tracking-widest text-foreground/90">
                      Becas y Descuentos
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Beneficios económicos
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="tipoBeca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Tipo de Beca
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 w-full rounded-2xl border-white/5 bg-black/20 font-medium transition-all hover:bg-black/30">
                              <SelectValue placeholder="Seleccione beca" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-white/10 backdrop-blur-xl">
                            <SelectItem value="ninguna">Sin Beca</SelectItem>
                            <SelectItem value="socioeconomica">
                              Socioeconómica (20%)
                            </SelectItem>
                            <SelectItem value="excelencia">
                              Excelencia Académica (50%)
                            </SelectItem>
                            <SelectItem value="deportiva">
                              Talento Deportivo (30%)
                            </SelectItem>
                            <SelectItem value="hermandad">
                              Hermandad (15%)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tipoBeca !== "ninguna" && (
                    <div className="rounded-xl bg-pink-500/10 border border-pink-500/20 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-pink-300">
                          Descuento Aplicado
                        </span>
                        <span className="text-sm font-bold text-pink-400">
                          {tipoBeca === "socioeconomica"
                            ? "20%"
                            : tipoBeca === "excelencia"
                              ? "50%"
                              : tipoBeca === "deportiva"
                                ? "30%"
                                : "15%"}
                        </span>
                      </div>
                      <p className="text-[9px] text-pink-400/50 leading-tight uppercase font-bold tracking-widest">
                        * El beneficio se aplicará automáticamente a todas las
                        cuotas del año lectivo.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/20 p-4 transition-all hover:border-white/10">
              <FormField
                control={form.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      Observaciones
                      <span className="font-normal lowercase italic text-muted-foreground/40">
                        (Opcional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales sobre la matrícula..."
                        className="min-h-[70px] resize-none border-white/5 bg-transparent p-4 placeholder:text-xs transition-all focus:border-white/20 focus:bg-white/5 rounded-2xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Botones de Navegación - Single Step */}
          <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/5">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="rounded-full px-6 h-12 hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all font-semibold hover:scale-105"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full px-12 h-12  font-bold transition-all duration-300 min-w-[200px] hover:scale-105"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 size-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Registro
                  <IconArrowRight className="ml-2 size-5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
