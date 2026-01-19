"use client"

import { useTransition, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconCalendar, IconTarget, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
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
import { cn } from "@/lib/utils"
import { upsertEvaluacionAction, getCapacidadesByCursoAction } from "@/actions/evaluations"

interface EvaluacionFormProps {
  initialData?: any
  tipos: any[]
  periodos: any[]
  cursos: any[]
  onSuccess: () => void
}

export function EvaluacionForm({
  initialData,
  tipos,
  periodos,
  cursos,
  onSuccess
}: EvaluacionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [capacidades, setCapacidades] = useState<any[]>([])
  const [loadingCapacidades, setLoadingCapacidades] = useState(false)

  const form = useForm({
    defaultValues: {
      nombre: initialData?.nombre || "",
      descripcion: initialData?.descripcion || "",
      tipoEvaluacionId: initialData?.tipoEvaluacionId || tipos[0]?.id || "",
      cursoId: initialData?.cursoId || cursos[0]?.id || "",
      periodoId: initialData?.periodoId || periodos[0]?.id || "",
      fecha: initialData?.fecha ? new Date(initialData.fecha) : new Date(),
      peso: initialData?.peso || 20,
      notaMinima: initialData?.notaMinima || 10.5,
      escalaCalificacion: initialData?.escalaCalificacion || "VIGESIMAL",
      capacidadId: initialData?.capacidadId || "",
      activa: initialData?.activa ?? true,
      recuperable: initialData?.recuperable ?? false,
    },
  })

  const selectedCursoId = form.watch("cursoId")

  useEffect(() => {
    if (selectedCursoId) {
      loadCapacidades(selectedCursoId)
    }
  }, [selectedCursoId])

  const loadCapacidades = async (cursoId: string) => {
    setLoadingCapacidades(true)
    const res = await getCapacidadesByCursoAction(cursoId)
    if (res.data) setCapacidades(res.data)
    setLoadingCapacidades(false)
  }

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const res = await upsertEvaluacionAction(values, initialData?.id)
      if (res.success) {
        toast.success(res.success)
        onSuccess()
      }
      if (res.error) toast.error(res.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem className="col-span-2 space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Nombre de la Evaluación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Examen Parcial - Unidad 2" {...field} className="h-11 bg-muted/5 border-border/40 focus:ring-violet-500/20 rounded-xl" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cursoId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Curso</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-11 bg-muted/5 border-border/40 rounded-xl">
                      <SelectValue placeholder="Seleccionar curso" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cursos.map((curso: any) => (
                      <SelectItem key={curso.id} value={curso.id}>
                        {curso.nombre} - {curso.nivelAcademico?.grado?.nombre || ""}
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
            name="capacidadId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1 flex items-center gap-2">
                  Capacidad Vinculada {loadingCapacidades && <IconLoader2 className="animate-spin size-3" />}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-11 bg-muted/5 border-border/40 rounded-xl">
                      <SelectValue placeholder={loadingCapacidades ? "Cargando..." : "Sleccionar capacidad"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {capacidades.length > 0 ? (
                      capacidades.map((cap) => (
                        <SelectItem key={cap.id} value={cap.id} className="text-xs">
                          <span className="font-bold text-violet-500 mr-2 truncate">[{cap.competenciaNombre}]</span>
                          {cap.nombre}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No hay capacidades para este curso</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoEvaluacionId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Tipo de Evaluación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-11 bg-muted/5 border-border/40 rounded-xl">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tipos.map((tipo) => (
                      <SelectItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
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
            name="periodoId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Periodo Académico</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full h-11 bg-muted/5 border-border/40 rounded-xl">
                      <SelectValue placeholder="Seleccionar periodo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {periodos.map((periodo: any) => (
                      <SelectItem key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
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
            name="fecha"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1 mt-1.5">Fecha de Evaluación</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-11 pl-3 text-left font-normal bg-muted/5 border-border/40 hover:bg-muted/10 rounded-xl",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <IconCalendar className="mr-2 h-4 w-4 opacity-70" />
                        {field.value ? (
                          format(field.value, "PPP", { locale: es })
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
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

          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="peso"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Peso (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      className="h-11 bg-muted/5 border-border/40 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notaMinima"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">Nota Mínima</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={20}
                      step="0.5"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      className="h-11 bg-muted/5 border-border/40 rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full shadow-xl transition-all active:scale-[0.98] font-bold h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl mt-4"
          disabled={isPending}
        >
          {isPending ? <IconLoader2 className="animate-spin" /> : initialData ? "Guardar Cambios" : "Crear Evaluación"}
        </Button>
      </form>
    </Form>
  )
}
