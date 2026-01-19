"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { upsertEventoAction } from "@/actions/communications"
import { toast } from "sonner"
import { useState } from "react"

const eventSchema = z.object({
  titulo: z.string().min(5, "El título debe tener al menos 5 caracteres"),
  descripcion: z.string().optional(),
  fechaInicio: z.string().min(1, "Fecha de inicio requerida"),
  fechaFin: z.string().min(1, "Fecha de fin requerida"),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  ubicacion: z.string().optional(),
  tipo: z.string().min(1, "Seleccione el tipo de evento"),
  modalidad: z.string().optional(),
  publico: z.boolean().default(true),
})

interface EventFormProps {
  onSuccess: () => void
  initialData?: any
  id?: string
}

export function EventForm({ onSuccess, initialData, id }: EventFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof eventSchema>>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      titulo: initialData?.titulo || "",
      descripcion: initialData?.descripcion || "",
      fechaInicio: initialData?.fechaInicio ? new Date(initialData.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      fechaFin: initialData?.fechaFin ? new Date(initialData.fechaFin).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      horaInicio: initialData?.horaInicio || "08:00",
      horaFin: initialData?.horaFin || "10:00",
      ubicacion: initialData?.ubicacion || "",
      tipo: initialData?.tipo || "ACADEMICO",
      modalidad: initialData?.modalidad || "PRESENCIAL",
      publico: initialData?.publico ?? true,
    },
  })

  const onSubmit = async (values: z.infer<typeof eventSchema>) => {
    setLoading(true)
    try {
      const res = await upsertEventoAction({
        ...values,
        fechaInicio: new Date(values.fechaInicio),
        fechaFin: new Date(values.fechaFin),
      }, id)
      if (res.success) {
        toast.success(res.success)
        onSuccess()
      } else {
        toast.error(res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Nombre del Evento</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Ceremonia de Clausura" {...field} className="h-10 border-border/40 bg-background/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles del evento..." {...field} className="min-h-[80px] border-border/40 bg-background/50 resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Fecha Inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-10 border-border/40 bg-background/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fechaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Fecha Fin</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-10 border-border/40 bg-background/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="horaInicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora Inicio</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="h-10 border-border/40 bg-background/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="horaFin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora Fin</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="h-10 border-border/40 bg-background/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 border-border/40 bg-background/50">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                    <SelectItem value="ACADEMICO">Académico</SelectItem>
                    <SelectItem value="DEPORTIVO">Deportivo</SelectItem>
                    <SelectItem value="CULTURAL">Cultural</SelectItem>
                    <SelectItem value="REUNION">Reunión</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ubicacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">Ubicación / Aula</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Auditorio Principal" {...field} className="h-10 border-border/40 bg-background/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 shadow-lg shadow-violet-500/20"
          disabled={loading}
        >
          {loading ? "Procesando..." : (id ? "Actualizar Evento" : "Programar Evento")}
        </Button>
      </form>
    </Form>
  )
}
