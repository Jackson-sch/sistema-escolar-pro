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
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
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
  FormDescription,
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

interface EnrollmentFormProps {
  onSuccess?: () => void;
  nivelesAcademicos: any[];
}

export function EnrollmentForm({
  onSuccess,
  nivelesAcademicos,
}: EnrollmentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [filteredNiveles, setFilteredNiveles] =
    useState<any[]>(nivelesAcademicos);
  const [isLoadingNiveles, setIsLoadingNiveles] = useState(false);

  const form = useForm<EnrollmentValues>({
    resolver: zodResolver(EnrollmentSchema),
    defaultValues: {
      estudianteId: "",
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

  const anio = form.watch("anioAcademico");
  const tipoBeca = form.watch("tipoBeca");
  const descuentoBeca = form.watch("descuentoBeca");

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingStudents(true);
      setIsLoadingNiveles(true);

      const [studentsRes, nivelesRes] = await Promise.all([
        getUnenrolledStudentsAction(anio),
        getNivelesAcademicosAction(anio),
      ]);

      if (studentsRes.data) setStudents(studentsRes.data);
      if (nivelesRes.data) setFilteredNiveles(nivelesRes.data);

      setIsLoadingStudents(false);
      setIsLoadingNiveles(false);

      const currentNivelId = form.getValues("nivelAcademicoId");
      if (
        currentNivelId &&
        nivelesRes.data &&
        !nivelesRes.data.some((n: any) => n.id === currentNivelId)
      ) {
        form.setValue("nivelAcademicoId", "");
      }
    };
    loadData();
  }, [anio]);

  const onSubmit = (values: EnrollmentValues) => {
    startTransition(() => {
      createEnrollmentAction(values).then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          form.reset();
          onSuccess?.();
        }
      });
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* SECCIÓN 1: ESTUDIANTE */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent p-6 transition-all hover:border-violet-500/10 ">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-inset ring-violet-500/20">
                <IconUser className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold tracking-widest text-foreground/90">
                  Estudiante
                </h3>
                <p className="text-xs text-muted-foreground">
                  Seleccione el alumno a matricular
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
                            "h-12 w-full justify-between border-white/5 bg-black/20 pl-4 text-base transition-all hover:bg-black/30 hover:text-foreground focus:border-violet-500/30 focus:bg-black/40 focus:ring-4 focus:ring-violet-500/10 rounded-full",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            students.find((s) => s.id === field.value) ? (
                              <div className="flex flex-col items-start gap-0.5 text-left">
                                <span className="font-bold text-foreground/90 capitalize">
                                  {
                                    students.find((s) => s.id === field.value)
                                      ?.apellidoPaterno
                                  }{" "}
                                  {
                                    students.find((s) => s.id === field.value)
                                      ?.apellidoMaterno
                                  }
                                  ,{" "}
                                  {
                                    students.find((s) => s.id === field.value)
                                      ?.name
                                  }
                                </span>
                                <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground/70">
                                  <IconId className="h-3 w-3" />
                                  DNI:{" "}
                                  {
                                    students.find((s) => s.id === field.value)
                                      ?.dni
                                  }
                                </span>
                              </div>
                            ) : (
                              "Estudiante seleccionado no encontrado"
                            )
                          ) : isLoadingStudents ? (
                            "Cargando lista ..."
                          ) : (
                            "Seleccione un estudiante..."
                          )}
                          <IconSearch className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 border-white/10 bg-zinc-950/95 backdrop-blur-xl">
                      <Command className="bg-transparent">
                        <CommandInput placeholder="Buscar por nombre o DNI..." />
                        <CommandList>
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
                                  form.setValue("estudianteId", student.id);
                                }}
                                className="cursor-pointer py-3 aria-selected:bg-violet-500/10 aria-selected:text-violet-400 capitalize"
                              >
                                <IconCheck
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    student.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-foreground/90">
                                    {student.apellidoPaterno}{" "}
                                    {student.apellidoMaterno}, {student.name}
                                  </span>
                                  <span className="flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-muted-foreground/70">
                                    <IconId className="h-3 w-3" />
                                    DNI: {student.dni}
                                  </span>
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
          </div>

          {/* SECCIÓN 2: ACADÉMICO */}
          <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent p-6 transition-all hover:border-blue-500/10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20">
                <IconSchool className="h-5 w-5" />
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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name="anioAcademico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">
                        Periodo
                      </FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-full border-white/5 bg-black/20 font-medium">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-white/10  backdrop-blur-xl">
                          {ANIO_LECTIVO_OPTIONS.map((option) => (
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
              </div>

              <div className="md:col-span-8">
                <FormField
                  control={form.control}
                  name="nivelAcademicoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">
                        Aula Asignada
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-full border-white/5 bg-black/20 font-medium transition-all hover:bg-black/30 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10">
                            <SelectValue
                              placeholder={
                                isLoadingNiveles
                                  ? "Cargando aulas..."
                                  : "Seleccione el aula asignada"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px] border-white/10  backdrop-blur-xl">
                          {isLoadingNiveles ? (
                            <div className="flex flex-col items-center justify-center p-6 gap-2 text-muted-foreground text-xs">
                              <IconLoader2 className="animate-spin h-5 w-5" />
                              <span>Cargando lista de secciones {anio}...</span>
                            </div>
                          ) : filteredNiveles.length > 0 ? (
                            filteredNiveles.map((n) => (
                              <SelectItem
                                key={n.id}
                                value={n.id}
                                className="py-3 focus:bg-blue-500/10 focus:text-blue-400"
                              >
                                <div className="flex items-center justify-between w-full gap-4">
                                  <span className="font-bold">
                                    {n.grado.nombre} "{n.seccion}"
                                  </span>
                                  <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                                    {n.nivel.nombre}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 flex flex-col items-center text-center gap-2 text-xs text-muted-foreground">
                              <IconAlertCircle className="h-5 w-5" />
                              <p>No hay secciones configuradas para {anio}</p>
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6">
              <FormField
                control={form.control}
                name="procedencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-muted-foreground">
                      Institución de Procedencia
                    </FormLabel>
                    <FormControl>
                      <div className="relative group/input">
                        <IconBuildingCommunity className="absolute left-4 top-2 h-5 w-5 text-muted-foreground/50 transition-colors group-hover/input:text-blue-400/70" />
                        <Input
                          {...field}
                          className="bg-black/20 border-white/5 pl-12 placeholder:text-xs transition-all hover:bg-black/30 focus:border-blue-500/30 focus:bg-black/40 focus:ring-4 focus:ring-blue-500/10 rounded-full"
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

          {/* SECCIÓN 3: CONDICIONES */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent p-6 transition-all hover:border-emerald-500/10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                  <IconCheck className="h-5 w-5" />
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
                      <div
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                          field.value
                            ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_-12px_rgba(16,185,129,0.5)]"
                            : "bg-black/20 border-white/5 hover:bg-black/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <p
                            className={`text-sm font-bold ${field.value ? "text-emerald-400" : "text-foreground"}`}
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
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="esRepitente"
                  render={({ field }) => (
                    <FormItem>
                      <div
                        className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                          field.value
                            ? "bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_-12px_rgba(245,158,11,0.5)]"
                            : "bg-black/20 border-white/5 hover:bg-black/40"
                        }`}
                      >
                        <div className="space-y-1">
                          <p
                            className={`text-sm font-bold ${field.value ? "text-amber-400" : "text-foreground"}`}
                          >
                            Repitencia
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Está repitiendo el grado
                          </p>
                        </div>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-pink-500/5 via-transparent to-transparent p-6 transition-all hover:border-pink-500/10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400 ring-1 ring-inset ring-pink-500/20">
                  <IconAlertCircle className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold tracking-widest text-foreground/90">
                    Beneficios
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Becas y descuentos aplicables
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="tipoBeca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-muted-foreground">
                        Tipo de Beca
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full rounded-full border-white/5 bg-black/20">
                            <SelectValue placeholder="Seleccione tipo de beca" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="border-white/10 backdrop-blur-xl">
                          <SelectItem value="ninguna">Ninguna</SelectItem>
                          <SelectItem
                            value="integral"
                            className="font-bold text-emerald-400"
                          >
                            Beca Integral (100%)
                          </SelectItem>
                          <SelectItem value="parcial">Beca Parcial</SelectItem>
                          <SelectItem value="convenio">
                            Convenio Institucional
                          </SelectItem>
                          <SelectItem value="socioeconomica">
                            Ayuda Socioeconómica
                          </SelectItem>
                          <SelectItem
                            value="excelencia"
                            className="font-bold text-amber-400"
                          >
                            Excelencia Académica
                          </SelectItem>
                          <SelectItem value="deportiva">
                            Talento Deportivo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="relative">
                  <FormField
                    control={form.control}
                    name="descuentoBeca"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-muted-foreground">
                          Descuento Mensual (S/)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 font-bold text-muted-foreground">
                              S/
                            </span>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              className="bg-black/20 border-white/5 pl-8 font-mono font-bold rounded-full"
                              placeholder="0.00"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {tipoBeca !== "ninguna" && (
                    <div className="mt-3 rounded-lg bg-pink-500/10 border border-pink-500/20 p-3">
                      <p className="text-[10px] font-bold text-pink-500 tracking-wider mb-0.5">
                        Beneficio Aplicado:
                      </p>
                      <p className="text-xs text-pink-200">
                        {tipoBeca === "integral"
                          ? "Exoneración completa de pensiones (100%)"
                          : `Descuento de S/ ${(descuentoBeca || 0).toFixed(2)} en cada mensualidad`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-3">
                    <IconAlertCircle className="h-4 w-4" />
                    Observaciones Adicionales
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escriba notas importantes (documentación deuda pendiente, acuerdos especiales)..."
                      className="resize-none min-h-[80px] border-white/5 bg-black/20 text-sm focus:bg-black/40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/5">
            <div className="w-full text-xs text-muted-foreground/60 text-center sm:text-left order-2 sm:order-1 flex items-center justify-center sm:justify-start gap-2">
              <IconAlertCircle className="h-3 w-3" />
              Verifique los datos antes de registrar la matrícula.
            </div>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              variant="default"
              className="rounded-full"
            >
              {isPending ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  Confirmar Matrícula
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
