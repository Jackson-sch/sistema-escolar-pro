"use client"

import { useState, useTransition } from "react"
import { IconAlertTriangle, IconLoader2, IconSettings } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { applyBulkMoraAction } from "@/actions/finance"

interface MoraActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conceptos: { id: string; nombre: string }[]
  secciones: { id: string; seccion: string; grado: { nombre: string }; nivel: { nombre: string } }[]
}

export function MoraActionsDialog({ open, onOpenChange, conceptos, secciones }: MoraActionsDialogProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    defaultValues: {
      conceptoId: "all",
      nivelAcademicoId: "all",
    },
  })

  const onSubmit = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId === "all" ? undefined : values.conceptoId,
        nivelAcademicoId: values.nivelAcademicoId === "all" ? undefined : values.nivelAcademicoId,
      }

      const res = await applyBulkMoraAction(payload)
      if (res.success) {
        toast.success(res.success)
        onOpenChange(false)
      }
      if (res.error) toast.error(res.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <IconSettings className="size-5" />
            Generación de Mora
          </DialogTitle>
          <DialogDescription>
            Calcula y aplica el interés diario acumulado a todos los cronogramas que han superado su fecha de vencimiento.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="conceptoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Concepto de Pago</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los conceptos" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Todos los conceptos</SelectItem>
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

            <FormField
              control={form.control}
              name="nivelAcademicoId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alcance / Sección</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Toda la institución" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">Toda la institución</SelectItem>
                      {secciones.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px]">
                    Puedes filtrar por una sección específica para procesar la mora.
                  </FormDescription>
                </FormItem>
              )}
            />

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-600">
              <IconAlertTriangle className="size-5 shrink-0" />
              <p className="text-xs leading-relaxed">
                Esta acción actualizará el campo de <strong>mora acumulada</strong> en base a los días de retraso y la regla de interés definida en cada concepto.
              </p>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90"
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Ejecutar Cálculo"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function FormMessage() {
  return null // Shadcn generic FormMessage if needed
}
