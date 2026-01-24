"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import {
  IconUser,
  IconId,
  IconMail,
  IconCalendar,
  IconLoader2,
  IconBriefcase,
  IconPhone,
  IconMapPin,
  IconCertificate
} from "@tabler/icons-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { StaffSchema, StaffValues } from "@/lib/schemas/staff"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createStaffAction, updateStaffAction } from "@/actions/staff"
import { toast } from "sonner"
import CardGeneric from "@/components/card-generic"
import { STAFF_ROLE_OPTIONS, ESCALA_MAGISTERIAL_OPTIONS } from "@/lib/constants"

interface StaffFormProps {
  id?: string
  initialData?: any
  onSuccess?: () => void
  instituciones: { id: string, nombreInstitucion: string }[]
  estados: { id: string, nombre: string }[]
  cargos: { id: string, nombre: string }[]
}

export function StaffForm({
  id,
  initialData,
  onSuccess,
  instituciones,
  estados,
  cargos
}: StaffFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<StaffValues>({
    resolver: zodResolver(StaffSchema),
    defaultValues: initialData ? {
      ...initialData,
      telefono: initialData.telefono || "",
      direccion: initialData.direccion || "",
      especialidad: initialData.especialidad || "",
      titulo: initialData.titulo || "",
      numeroContrato: initialData.numeroContrato || "",
      colegioProfesor: initialData.colegioProfesor || "",
      escalaMagisterial: initialData.escalaMagisterial || "",
      fechaIngreso: initialData.fechaIngreso ? new Date(initialData.fechaIngreso) : undefined,
    } : {
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
      estadoId: estados.find(e => e.nombre === "Activo")?.id || estados[0]?.id || "",
      colegioProfesor: "",
      escalaMagisterial: "",
    },
  })

  const onSubmit = (values: StaffValues) => {
    startTransition(() => {
      const action = id
        ? updateStaffAction(id, values)
        : createStaffAction(values)

      action.then((data) => {
        if (data.error) toast.error(data.error)
        if (data.success) {
          toast.success(data.success)
          onSuccess?.()
        }
      })
    })
  }

  const selectedRole = form.watch("role")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">

        {/* SECCIÓN 1: DATOS PERSONALES */}
        <CardGeneric
          title="Información Personal"
          description="Datos básicos de identificación del miembro del personal."
          icon={<IconUser className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Nombres (Ocupa más espacio) */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel>Nombres</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ejem: Juan Alberto" />
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
                  <FormLabel>Apellido Paterno</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Pérez" />
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
                  <FormLabel>Apellido Materno</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="García" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* DNI */}
            <FormField
              control={form.control}
              name="dni"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>DNI</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconId className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} placeholder="00000000" maxLength={8} className="pl-10" />
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
                <FormItem className="md:col-span-6">
                  <FormLabel>Correo Electrónico</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <IconMail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input {...field} type="email" placeholder="nombre@colegio.edu.pe" className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardGeneric>


        {/* SECCIÓN 2: VÍNCULO LABORAL */}
        <CardGeneric
          title="Vínculo Laboral"
          description="Información sobre el cargo y la asignación en la institución."
          icon={<IconBriefcase className="h-4 w-4" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Rol en el Sistema</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar Rol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STAFF_ROLE_OPTIONS.map((option) => (
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
            <FormField
              control={form.control}
              name="cargoId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Cargo Específico</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar Cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.id} value={cargo.id}>{cargo.nombre}</SelectItem>
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
                <FormItem className="md:col-span-6">
                  <FormLabel>Área / Departamento</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ejem: Académica, Administración" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fechaIngreso"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Fecha de Ingreso</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-10",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
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
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardGeneric>

        {/* SECCIÓN 3: PERFIL PROFESIONAL (Solo si es profesor) */}
        {selectedRole === "profesor" && (
          <CardGeneric
            title="Perfil Profesional Docente"
            description="Documentación y datos específicos del magisterio."
            icon={<IconCertificate className="h-4 w-4" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="especialidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Especialidad</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ejem: Matemática y Física" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título / Grado Académico</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Licenciado en Educación" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="colegioProfesor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>N° Colegiatura (CPP)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="000000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="escalaMagisterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escala Magisterial</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ESCALA_MAGISTERIAL_OPTIONS.map((option) => (
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
        )}

        <div className="flex items-center justify-end pt-2">
          <Button disabled={isPending} type="submit" className="w-full md:w-auto md:min-w-[250px] h-10 font-medium shadow-sm">
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Procesando..." : id ? "Guardar Cambios" : "Registrar Personal"}
          </Button>
        </div>
      </form>
    </Form>
  )
}