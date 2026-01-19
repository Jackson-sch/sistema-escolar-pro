"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import {
  IconUser,
  IconId,
  IconMail,
  IconCalendar,
  IconMapPin,
  IconLoader2,
  IconUsers,
  IconSchool,
  IconDeviceFloppy,
} from "@tabler/icons-react";

import { StudentSchema, StudentValues } from "@/lib/schemas/student";
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
import {
  createStudentAction,
  updateStudentAction,
  getGuardianByDniAction,
} from "@/actions/students";
import { toast } from "sonner";
import { useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/formats";
import CardGeneric from "@/components/card-generic";
import { SEXO_OPTIONS, PARENTESCO_OPTIONS } from "@/lib/constants";

interface StudentFormProps {
  id?: string;
  initialData?: any;
  onSuccess?: () => void;
  instituciones: { id: string; nombreInstitucion: string }[];
  estados: { id: string; nombre: string }[];
}

export function StudentForm({
  id,
  initialData,
  onSuccess,
  instituciones,
  estados,
}: StudentFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<StudentValues>({
    resolver: zodResolver(StudentSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          email: initialData.email || "",
          ubigeo: initialData.ubigeo || "",
          codigoEstudiante: initialData.codigoEstudiante || "",
          codigoSiagie: initialData.codigoSiagie || "",
          tipoSangre: initialData.tipoSangre || "",
          alergias: initialData.alergias || "",
          condicionesMedicas: initialData.condicionesMedicas || "",
          fechaNacimiento: initialData.fechaNacimiento
            ? new Date(initialData.fechaNacimiento)
            : undefined,
          // Extraer datos del apoderado principal si existen
          nombreApoderado:
            initialData.padresTutores?.find((p: any) => p.contactoPrimario)
              ?.padreTutor.name || "",
          dniApoderado:
            initialData.padresTutores?.find((p: any) => p.contactoPrimario)
              ?.padreTutor.dni || "",
          telefonoApoderado:
            initialData.padresTutores?.find((p: any) => p.contactoPrimario)
              ?.padreTutor.telefono || "",
          parentescoApoderado:
            initialData.padresTutores?.find((p: any) => p.contactoPrimario)
              ?.parentesco || "PADRE",
        }
      : {
          name: "",
          apellidoPaterno: "",
          apellidoMaterno: "",
          dni: "",
          email: "",
          sexo: "MASCULINO",
          nacionalidad: "PERUANA",
          direccion: "",
          departamento: "LA LIBERTAD",
          provincia: "TRUJILLO",
          distrito: "TRUJILLO",
          ubigeo: "",
          codigoEstudiante: "",
          codigoSiagie: "",
          tipoSangre: "",
          alergias: "",
          condicionesMedicas: "",
          institucionId: instituciones[0]?.id || "",
          estadoId:
            estados.find((e) => e.nombre === "Activo")?.id ||
            estados[0]?.id ||
            "",
          nombreApoderado: "",
          dniApoderado: "",
          telefonoApoderado: "",
          parentescoApoderado: "PADRE",
        },
  });

  // Observar cambios en el DNI del apoderado para auto-completar
  const dniApoderado = form.watch("dniApoderado");

  useEffect(() => {
    if (dniApoderado && dniApoderado.length === 8) {
      const searchGuardian = async () => {
        try {
          const res = await getGuardianByDniAction(dniApoderado);
          if (res?.data) {
            form.setValue("nombreApoderado", res.data.name, {
              shouldValidate: true,
              shouldDirty: true,
            });
            form.setValue("telefonoApoderado", res.data.telefono || "", {
              shouldValidate: true,
              shouldDirty: true,
            });
            toast.success(
              "Apoderado encontrado, datos cargados automáticamente."
            );
          }
        } catch (error) {
          console.error("Error searching guardian:", error);
        }
      };
      searchGuardian();
    }
  }, [dniApoderado, form]);

  const onSubmit = (values: StudentValues) => {
    startTransition(() => {
      const action = id
        ? updateStudentAction(id, values)
        : createStudentAction(values);

      action.then((data) => {
        if (data.error) toast.error(data.error);
        if (data.success) {
          toast.success(data.success);
          if (!id) form.reset();
          onSuccess?.();
        }
      });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <CardGeneric
          title="Información Personal"
          description="Datos básicos de identificación del estudiante."
          icon={<IconUser className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nombre (ancho 4) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Nombres
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Juan Alberto"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Apellido Paterno (ancho 4) */}
            <FormField
              control={form.control}
              name="apellidoPaterno"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Apellido Paterno
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Pérez"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Apellido Materno (ancho 4) */}
            <FormField
              control={form.control}
              name="apellidoMaterno"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Apellido Materno
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="García"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="md:col-span-12 my-1" />

            {/* DNI (ancho 6) */}
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    DNI / Documento de Identidad
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="00000000"
                        className="pl-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                        maxLength={8}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha Nacimiento (ancho 6) */}
            <FormField
              control={form.control}
              name="fechaNacimiento"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Fecha de Nacimiento
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-10 border-border/40 hover:bg-muted/50 transition-all",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value, "PPP")
                          ) : (
                            <span>DD / MM / AAAA</span>
                          )}
                          <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sexo (ancho 4) */}
            <FormField
              control={form.control}
              name="sexo"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Género / Sexo
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SEXO_OPTIONS.map((option) => (
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

            {/* Email (ancho 8) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-8">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Correo Electrónico (Opcional)
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="ejemplo@correo.com"
                        className="pl-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="md:col-span-12 my-1" />

            {/* Institución (ancho 6) */}
            <FormField
              control={form.control}
              name="institucionId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Institución
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                        <SelectValue placeholder="Seleccionar institución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {instituciones.map((inst) => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.nombreInstitucion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado (ancho 6) */}
            <FormField
              control={form.control}
              name="estadoId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Estado de Alumno
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estados.map((e) => (
                        <SelectItem key={e.id} value={e.id}>
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
        </CardGeneric>

        {/* SECCIÓN 2: UBICACIÓN */}
        <CardGeneric
          title="Ubicación y Domicilio"
          description="Información sobre la ubicación y domicilio del estudiante"
          icon={<IconMapPin className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="direccion"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Dirección Exacta de Residencia
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Av. Principal 123, Depto 404"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="departamento"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Departamento
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="provincia"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Provincia
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="distrito"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Distrito
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="uppercase bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardGeneric>

        {/* SECCIÓN 4: APODERADO */}
        <CardGeneric
          title="Datos del Apoderado"
          description="Información de contacto del padre, madre o tutor."
          icon={<IconUsers className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dniApoderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    DNI del Apoderado
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        {...field}
                        placeholder="DNI"
                        maxLength={8}
                        className="pl-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nombreApoderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Nombre Completo Apoderado
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nombre y apellidos"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefonoApoderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Teléfono / WhatsApp
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="999 999 999"
                      className="bg-muted/5 border-border/40 focus:ring-primary/20 transition-all h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parentescoApoderado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Parentesco con el Alumno
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full h-10 bg-muted/5 border-border/40 focus:ring-primary/20 transition-all">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PARENTESCO_OPTIONS.map((option) => (
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
        </CardGeneric>

        <div className="border-t border-border/40 pt-6 flex justify-end gap-3">
          <Button
            disabled={isPending}
            type="submit"
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isPending ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                {id ? "Guardar Cambios" : "Registrar Estudiante"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
