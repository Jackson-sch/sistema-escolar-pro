"use client"

import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTransition } from "react"
import {
  IconBook,
  IconBriefcase,
  IconLoader2
} from "@tabler/icons-react"

import { CourseSchema, CourseValues } from "@/lib/schemas/academic"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { upsertCourseAction } from "@/actions/academic"
import { toast } from "sonner"
import CardGeneric from "@/components/card-generic"

interface CourseFormProps {
  id?: string
  initialData?: any
  onSuccess?: () => void
  areas: any[]
  nivelesAcademicos: any[]
  profesores: any[]
}

export function CourseForm({
  id,
  initialData,
  onSuccess,
  areas,
  nivelesAcademicos,
  profesores
}: CourseFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<CourseValues>({
    resolver: zodResolver(CourseSchema),
    defaultValues: initialData ? {
      ...initialData,
      horasSemanales: Number(initialData.horasSemanales),
      creditos: Number(initialData.creditos || 0),
    } : {
      nombre: "",
      codigo: "",
      descripcion: "",
      anioAcademico: new Date().getFullYear(),
      horasSemanales: 2,
      creditos: 0,
      areaCurricularId: "",
      nivelAcademicoId: "",
      profesorId: "",
      activo: true,
    },
  })

  const onSubmit = (values: CourseValues) => {
    startTransition(() => {
      upsertCourseAction(values, id).then((data) => {
        if (data.error) toast.error(data.error)
        if (data.success) {
          toast.success(data.success)
          onSuccess?.()
        }
      })
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* SECCIÓN 1: DATOS GENERALES */}
        <CardGeneric
          title="Información General"
          description="Datos básicos de identificación del curso en el sistema."
          icon={<IconBook />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="md:col-span-8">
                  <FormLabel>Nombre de la Asignatura</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ejem: Matemática Avanzada" className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem className="md:col-span-4">
                  <FormLabel>Código Interno</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="MAT-01" className="" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="descripcion"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Breve descripción de los contenidos del curso..."
                      className="resize-none min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardGeneric>

        {/* SECCIÓN 2: ASIGNACIÓN Y ACADÉMICO */}
        <CardGeneric
          title="Configuración Académica"
          description="Asignación de docentes, aula y carga horaria."
          icon={<IconBriefcase />}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

            {/* Profesor */}
            <FormField
              control={form.control}
              name="profesorId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Docente Responsable</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full capitalize">
                        <SelectValue placeholder="Seleccionar docente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profesores.map((p) => (
                        <SelectItem key={p.id} value={p.id} className="capitalize">
                          {p.apellidoPaterno} {p.apellidoMaterno}, {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Grado y Sección */}
            <FormField
              control={form.control}
              name="nivelAcademicoId"
              render={({ field }) => (
                <FormItem className="md:col-span-6">
                  <FormLabel>Grado y Sección</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Asignar aula" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {nivelesAcademicos.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.nivel.nombre} - {n.grado.nombre} "{n.seccion}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Área Curricular */}
            <FormField
              control={form.control}
              name="areaCurricularId"
              render={({ field }) => (
                <FormItem className="md:col-span-12">
                  <FormLabel>Área Curricular</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar área" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {areas.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sub-grid para datos numéricos */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:col-span-12">
              <FormField
                control={form.control}
                name="horasSemanales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas Semanales</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="creditos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Créditos</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="anioAcademico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año Lectivo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className=""
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

          </div>
        </CardGeneric>

        <div className="flex items-center justify-end pt-2">
          <Button
            disabled={isPending}
            type="submit"
            className="w-full md:w-auto md:min-w-[240px]  font-medium"
          >
            {isPending && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Guardando..." : id ? "Guardar Cambios" : "Crear Curso"}
          </Button>
        </div>
      </form>
    </Form>
  )
}