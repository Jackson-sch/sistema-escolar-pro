"use client"

import { useState } from "react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format as formatDate } from "date-fns"
import { es } from "date-fns/locale"
import { updateAdmisionResultAction } from "@/actions/admissions"
import { toast } from "sonner"
import {
  IconCalendarEvent,
  IconClipboardCheck,
  IconAlertCircle,
  IconCheck,
  IconLoader2
} from "@tabler/icons-react"

const flowSchema = z.object({
  fechaEntrevista: z.date().optional().nullable(),
  resultadoExamen: z.string().optional(),
  observaciones: z.string().optional(),
  estadoFinal: z.enum(["INTERESADO", "EVALUANDO", "ADMITIDO", "RECHAZADO"])
})

interface AdmisionFlowProps {
  admision: any
  onSuccess: () => void
}

export function AdmisionFlow({ admision, onSuccess }: AdmisionFlowProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof flowSchema>>({
    resolver: zodResolver(flowSchema),
    defaultValues: {
      fechaEntrevista: admision.fechaEntrevista ? new Date(admision.fechaEntrevista) : null,
      resultadoExamen: admision.resultadoExamen || "",
      observaciones: admision.observaciones || "",
      estadoFinal: admision.prospecto.estado || "EVALUANDO"
    },
  })

  const onSubmit = async (values: z.infer<typeof flowSchema>) => {
    setLoading(true)
    try {
      const { estadoFinal, ...data } = values
      const res = await updateAdmisionResultAction(
        admision.id,
        data,
        estadoFinal as any
      )

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

  const statusVariants: any = {
    INTERESADO: "from-blue-500/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    EVALUANDO: "from-amber-500/20 to-amber-600/5 border-amber-500/20 text-amber-400",
    ADMITIDO: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    RECHAZADO: "from-red-500/20 to-red-600/5 border-red-500/20 text-red-400",
  }

  return (
    <div className="space-y-8 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group overflow-hidden bg-background/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl transition-all duration-300 hover:border-violet-500/30">
          <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <IconCalendarEvent className="size-5 mb-3 text-violet-500" />
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Entrevista</span>
          <p className="text-sm font-bold tracking-tight">
            {admision.fechaEntrevista ? formatDate(new Date(admision.fechaEntrevista), "dd 'de' MMM", { locale: es }) : "Pendiente"}
          </p>
        </div>

        <div className="relative group overflow-hidden bg-background/40 backdrop-blur-xl p-4 rounded-2xl border border-white/5 shadow-2xl transition-all duration-300 hover:border-blue-500/30">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <IconClipboardCheck className="size-5 mb-3 text-blue-500" />
          <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Resultado</span>
          <p className="text-sm font-bold tracking-tight">{admision.resultadoExamen || "Sin nota"}</p>
        </div>

        <div className={cn(
          "relative group overflow-hidden bg-background/40 backdrop-blur-xl p-4 rounded-2xl border shadow-2xl transition-all duration-300 bg-linear-to-br",
          statusVariants[admision.prospecto.estado] || "border-white/5"
        )}>
          <IconAlertCircle className="size-5 mb-3" />
          <span className="block text-[10px] font-bold opacity-70 uppercase tracking-widest mb-1">Estado Actual</span>
          <p className="text-sm font-black uppercase tracking-tighter">{admision.prospecto.estado}</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fechaEntrevista"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 ml-1">Fecha de Entrevista</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-11 pl-3 text-left font-normal bg-background/50 border-border/40 hover:bg-muted/10 transition-colors rounded-xl",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            formatDate(field.value, "PPP", { locale: es })
                          ) : (
                            <span className="text-xs">Programar fecha...</span>
                          )}
                          <IconCalendarEvent className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 border-border/40 bg-background/95 backdrop-blur-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estadoFinal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 ml-1">Actualizar Estado</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 border-border/40 bg-background/50 rounded-xl transition-all focus:ring-violet-500/20">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="border-border/40 bg-background/95 backdrop-blur-xl">
                      <SelectItem value="EVALUANDO" className="text-xs">EN EVALUACIÓN</SelectItem>
                      <SelectItem value="ADMITIDO" className="text-emerald-500 font-bold text-xs uppercase tracking-tight">✓ Admitir Estudiante</SelectItem>
                      <SelectItem value="RECHAZADO" className="text-red-500 font-bold text-xs uppercase tracking-tight">✕ Rechazar Solicitud</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="resultadoExamen"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 ml-1">Resultado del Examen</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 18.5/20 - Sobresaliente"
                    {...field}
                    className="h-11 border-border/40 bg-background/50 rounded-xl focus:ring-violet-500/20 transition-all font-medium"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="observaciones"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 ml-1">Observaciones y Notas</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Escriba aquí los detalles de la entrevista o justificación de la decisión..."
                    {...field}
                    className="min-h-[120px] border-border/40 bg-background/50 rounded-xl focus:ring-violet-500/20 transition-all resize-none p-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black h-12 shadow-xl shadow-violet-500/25 rounded-xl transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <IconLoader2 className="size-4 animate-spin" />
                  <span>PROCESANDO...</span>
                </div>
              ) : (
                "ACTUALIZAR EXPEDIENTE AHORA"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
