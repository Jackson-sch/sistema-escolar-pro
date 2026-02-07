"use client"

import { useState, useTransition } from "react"
import { IconCalendar, IconLoader2, IconFilter, IconWallet, IconUsersPlus } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createCronogramaMasivoAction } from "@/actions/finance"
import { FormModal } from "@/components/modals/form-modal"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface AddPensionButtonProps {
  conceptos: { id: string; nombre: string; montoSugerido: number }[]
  secciones: { id: string; seccion: string; grado: { nombre: string }; nivel: { nombre: string } }[]
}

export function AddPensionButton({ conceptos, secciones }: AddPensionButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      conceptoId: "",
      monto: 0,
      fechaVencimiento: new Date(),
      nivelAcademicoId: "all",
    },
  })

  // Actualizar monto base cuando cambia el concepto
  const onConceptoChange = (id: string, onChange: (v: string) => void) => {
    onChange(id)
    const concepto = conceptos.find(c => c.id === id)
    if (concepto) {
      form.setValue("monto", concepto.montoSugerido)
    }
  }

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        ...values,
        monto: Number(values.monto),
        fechaVencimiento: values.fechaVencimiento.toISOString(),
        nivelAcademicoId: values.nivelAcademicoId === "all" ? undefined : values.nivelAcademicoId
      }

      const res = await createCronogramaMasivoAction(payload)
      if (res.success) {
        toast.success(res.success)
        form.reset({
          ...form.getValues(),
          conceptoId: "",
          monto: 0,
          nivelAcademicoId: "all"
        })
        setOpen(false)
      }
      if (res.error) toast.error(res.error)
    })
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full"
          >
            <IconUsersPlus className="sm:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Generar Masivo</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Generar Masivo</p>
        </TooltipContent>
      </Tooltip>

      <FormModal
        title="Generación Masiva"
        description="Crea deudas de pago para múltiples estudiantes simultáneamente."
        isOpen={open}
        onOpenChange={setOpen}
        className="sm:max-w-md"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="conceptoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto de Pago</FormLabel>
                    <Select onValueChange={(v) => onConceptoChange(v, field.onChange)} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue placeholder="Seleccionar concepto..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {conceptos.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grid para Monto y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="monto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monto</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-sm text-muted-foreground font-medium">S/</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-8 rounded-full font-medium"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaVencimiento"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Vencimiento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                " pl-3 text-left font-normal rounded-full",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Elegir fecha</span>
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
                            disabled={(date) => {
                              const limit = new Date()
                              limit.setDate(limit.getDate() - 7)
                              limit.setHours(0, 0, 0, 0)
                              return date < limit
                            }}
                            fromYear={new Date().getFullYear()}
                            toYear={new Date().getFullYear() + 5}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nivelAcademicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <IconFilter className="size-3.5" />
                      Alcance
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full rounded-full">
                          <SelectValue placeholder="Toda la institución" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">
                          <div className="flex items-center gap-2">
                            <IconWallet className="size-3.5" />
                            Toda la Institución
                          </div>
                        </SelectItem>
                        {secciones.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Selecciona un aula específica o aplica a todos los alumnos matriculados activos.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full rounded-full font-medium"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando pagos...
                  </>
                ) : (
                  "Procesar Generación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </FormModal>
    </>
  )
}