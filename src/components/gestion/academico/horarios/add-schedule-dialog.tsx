"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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
  SelectValue
} from "@/components/ui/select"
import { upsertHorarioAction } from "@/actions/schedules"
import { toast } from "sonner"
import { useState } from "react"

const formSchema = z.object({
  cursoId: z.string().min(1, "Debe seleccionar un curso"),
  diaSemana: z.string().min(1, "Debe seleccionar un día"),
  horaInicio: z.string().min(1, "Hora de inicio requerida"),
  horaFin: z.string().min(1, "Hora de fin requerida"),
  aula: z.string().optional(),
})

interface AddScheduleDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  courses: any[]
  onSuccess: () => void
}

const DIAS = [
  { id: "1", label: "LUNES" },
  { id: "2", label: "MARTES" },
  { id: "3", label: "MIÉRCOLES" },
  { id: "4", label: "JUEVES" },
  { id: "5", label: "VIERNES" }
]

const HORAS = Array.from({ length: 9 }, (_, i) => `${i + 8}:00`)

export function AddScheduleDialog({ isOpen, onOpenChange, courses, onSuccess }: AddScheduleDialogProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cursoId: "",
      diaSemana: "",
      horaInicio: "",
      horaFin: "",
      aula: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      const res = await upsertHorarioAction({
        ...values,
        diaSemana: parseInt(values.diaSemana)
      })

      if (res.success) {
        toast.success(res.success)
        onSuccess()
        onOpenChange(false)
        form.reset()
      } else {
        toast.error(res.error)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-background/95 backdrop-blur-xl border-border/40">
        <DialogHeader>
          <DialogTitle>Asignar Hora de Clase</DialogTitle>
          <DialogDescription>
            Selecciona el curso, día y hora para esta sección.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="cursoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Curso / Profesor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 border-border/40 bg-background/50">
                        <SelectValue placeholder="Seleccione un curso" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.nombre} - {course.profesor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="diaSemana"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Día</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-border/40 bg-background/50">
                          <SelectValue placeholder="Día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DIAS.map((dia) => (
                          <SelectItem key={dia.id} value={dia.id}>
                            {dia.label}
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
                name="aula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Aula (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Aula 102" {...field} className="h-10 border-border/40 bg-background/50" />
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
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora Inicio</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val)
                      // Auto-set hora fin a +1 hora
                      const h = parseInt(val)
                      form.setValue("horaFin", `${h + 1}:00`)
                    }} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-border/40 bg-background/50">
                          <SelectValue placeholder="Inicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HORAS.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaFin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Hora Fin</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 border-border/40 bg-background/50">
                          <SelectValue placeholder="Fin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HORAS.map((h) => {
                          const hourInt = parseInt(h)
                          return <SelectItem key={h} value={`${hourInt + 1}:00`}>{hourInt + 1}:00</SelectItem>
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-11"
                disabled={loading}
              >
                {loading ? "Registrando..." : "Guardar Horario"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
