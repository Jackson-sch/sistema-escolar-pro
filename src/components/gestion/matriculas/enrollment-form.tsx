"use client";

import * as z from "zod";
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
} from "@tabler/icons-react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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

      // Limpiar selección de sección si ya no es válida para el nuevo año
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
  }, [anio, form]);

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* SECCIÓN 1: ESTUDIANTE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground/80 font-semibold border-b pb-2">
              <IconUser className="h-4 w-4" />
              <h3>Selección de Estudiante</h3>
            </div>

            <FormField
              control={form.control}
              name="estudianteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alumno a matricular</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 w-full bg-background border-input/60 focus:ring-primary/20">
                        <SelectValue
                          placeholder={
                            isLoadingStudents
                              ? "Buscando estudiantes..."
                              : "Seleccione un estudiante de la lista"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {isLoadingStudents ? (
                        <div className="flex flex-col items-center justify-center p-6 gap-2 text-muted-foreground">
                          <IconLoader2 className="animate-spin h-5 w-5" />
                          <span className="text-sm">Cargando lista...</span>
                        </div>
                      ) : students.length > 0 ? (
                        students.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="py-3 cursor-pointer"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">
                                {s.apellidoPaterno} {s.apellidoMaterno},{" "}
                                {s.name}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <IconId className="h-3 w-3" />
                                DNI: {s.dni}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-4 flex flex-col items-center text-center gap-2">
                          <IconAlertCircle className="h-8 w-8 text-muted-foreground/50" />
                          <div className="space-y-1">
                            <p className="font-medium text-sm">
                              No hay alumnos disponibles
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Todos los alumnos están matriculados en {anio}
                            </p>
                          </div>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs text-muted-foreground">
                    Mostrando solo estudiantes sin matrícula activa para el{" "}
                    {anio}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SECCIÓN 2: ACADÉMICO */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground/80 font-semibold border-b pb-2">
              <IconSchool className="h-4 w-4" />
              <h3>Datos Académicos</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-4">
                <FormField
                  control={form.control}
                  name="anioAcademico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Periodo</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                      <FormLabel>Nivel, Grado y Sección</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={
                                isLoadingNiveles
                                  ? "Cargando aulas..."
                                  : "Seleccione el aula asignada"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {isLoadingNiveles ? (
                            <div className="flex flex-col items-center justify-center p-6 gap-2 text-muted-foreground text-xs">
                              <IconLoader2 className="animate-spin h-5 w-5" />
                              <span>Cargando lista de secciones {anio}...</span>
                            </div>
                          ) : filteredNiveles.length > 0 ? (
                            filteredNiveles.map((n) => (
                              <SelectItem key={n.id} value={n.id}>
                                <span className="font-medium">
                                  {n.grado.nombre} "{n.seccion}"
                                </span>
                                <span className="ml-2 text-muted-foreground text-xs">
                                  ({n.nivel.nombre})
                                </span>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-4 flex flex-col items-center text-center gap-2 text-xs text-muted-foreground">
                              <IconAlertCircle className="h-5 w-5" />
                              <p>
                                No hay secciones configuradas para el año {anio}
                              </p>
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

            <FormField
              control={form.control}
              name="procedencia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institución de Procedencia</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconBuildingCommunity className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        className="pl-9"
                        placeholder="Nombre del colegio anterior (Opcional)"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SECCIÓN 3: CONDICIONES Y OBSERVACIONES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground/80 font-semibold border-b pb-2">
              <IconCheck className="h-4 w-4" />
              <h3>Condiciones y Observaciones</h3>
            </div>

            {/* Panel de configuración agrupado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="esPrimeraVez"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md bg-background p-3 border shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">
                        Nuevo Ingreso
                      </FormLabel>
                      <FormDescription className="text-xs">
                        ¿Es su primer año en el colegio?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="esRepitente"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md bg-background p-3 border shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-semibold">
                        Repitencia
                      </FormLabel>
                      <FormDescription className="text-xs">
                        ¿Está repitiendo el grado actual?
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observaciones"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones Adicionales</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Escriba aquí notas importantes sobre la matrícula, documentación pendiente, etc..."
                      className="resize-none min-h-[60px] bg-background/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SECCIÓN 4: BECAS Y DESCUENTOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-foreground/80 font-semibold border-b pb-2">
              <IconAlertCircle className="h-4 w-4 text-blue-500" />
              <h3>Becas y Beneficios</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="tipoBeca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Beca</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo de beca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ninguna">Ninguna</SelectItem>
                        <SelectItem value="integral">
                          Beca Integral (100%)
                        </SelectItem>
                        <SelectItem value="parcial">Beca Parcial</SelectItem>
                        <SelectItem value="convenio">
                          Convenio Institucional
                        </SelectItem>
                        <SelectItem value="socioeconomica">
                          Ayuda Socioeconómica
                        </SelectItem>
                        <SelectItem value="excelencia">
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

              <FormField
                control={form.control}
                name="descuentoBeca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descuento Mensual (S/)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        placeholder="0.00"
                      />
                    </FormControl>
                    <FormDescription className="text-[10px]">
                      Monto FIJO a descontar de cada pensión mensual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* BOTÓN DE ACCIÓN OCULTO PARA SUBMIT NATIVO */}
          <button type="submit" className="hidden" />
        </form>
      </Form>

      <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t">
        <div className="w-full text-xs text-muted-foreground text-center sm:text-left order-2 sm:order-1">
          Revise los datos antes de confirmar la operación.
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isPending}
          className="w-full sm:w-auto min-w-[200px] order-1 sm:order-2"
        >
          {isPending ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              Registrar Matrícula
              <IconArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </>
  );
}
