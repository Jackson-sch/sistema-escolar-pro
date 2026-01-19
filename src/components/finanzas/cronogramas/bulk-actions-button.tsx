"use client"

import { useState, useTransition } from "react"
import { IconTrash, IconCalendarEvent, IconSettings, IconAlertTriangle, IconLoader2, IconPercentage } from "@tabler/icons-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { deleteCronogramaMasivoAction, updateCronogramaFechaMasivoAction } from "@/actions/finance"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MoraActionsDialog } from "./mora-actions-dialog"

interface BulkActionsButtonProps {
  conceptos: { id: string; nombre: string }[]
  secciones: { id: string; seccion: string; grado: { nombre: string }; nivel: { nombre: string } }[]
}

export function BulkActionsButton({ conceptos, secciones }: BulkActionsButtonProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [moraDialogOpen, setMoraDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Formulario de eliminación
  const deleteForm = useForm({
    defaultValues: {
      conceptoId: "",
      nivelAcademicoId: "all",
    },
  })

  // Formulario de actualización de fecha
  const updateForm = useForm({
    defaultValues: {
      conceptoId: "",
      nuevaFecha: new Date(),
      nivelAcademicoId: "all",
    },
  })

  const onDelete = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId,
        nivelAcademicoId: values.nivelAcademicoId === "all" ? undefined : values.nivelAcademicoId,
      }

      const res = await deleteCronogramaMasivoAction(payload)
      if (res.success) {
        toast.success(res.success)
        deleteForm.reset()
        setDeleteDialogOpen(false)
      }
      if (res.error) toast.error(res.error)
    })
  }

  const onUpdateFecha = (values: any) => {
    startTransition(async () => {
      const payload = {
        conceptoId: values.conceptoId,
        nuevaFecha: values.nuevaFecha.toISOString(),
        nivelAcademicoId: values.nivelAcademicoId === "all" ? undefined : values.nivelAcademicoId,
      }

      const res = await updateCronogramaFechaMasivoAction(payload)
      if (res.success) {
        toast.success(res.success)
        updateForm.reset()
        setUpdateDialogOpen(false)
      }
      if (res.error) toast.error(res.error)
    })
  }

  return (
    <>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-9 sm:w-auto sm:px-4"
              >
                <IconSettings className="sm:mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Gestión</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gestión Masiva</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Acciones Masivas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setUpdateDialogOpen(true)}>
            <IconCalendarEvent className="mr-2 h-4 w-4" />
            Cambiar Fecha de Vencimiento
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setMoraDialogOpen(true)}>
            <IconPercentage className="mr-2 h-4 w-4" />
            Aplicar Interés por Mora
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <IconTrash className="mr-2 h-4 w-4" />
            Eliminar Cronogramas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Eliminación Masiva */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <IconAlertTriangle className="size-5" />
              Eliminar Cronogramas
            </DialogTitle>
            <DialogDescription>
              Elimina cronogramas pendientes que no tengan pagos registrados. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <Form {...deleteForm}>
            <form onSubmit={deleteForm.handleSubmit(onDelete)} className="space-y-4">
              <FormField
                control={deleteForm.control}
                name="conceptoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto de Pago</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <FormField
                control={deleteForm.control}
                name="nivelAcademicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcance (Opcional)</FormLabel>
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
                    <FormDescription className="text-xs">
                      Deja en "Toda la institución" para eliminar de todas las secciones.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isPending || !deleteForm.watch("conceptoId")}
                >
                  {isPending ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <IconTrash className="mr-2 h-4 w-4" />
                      Eliminar
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Actualización de Fecha */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconCalendarEvent className="size-5" />
              Cambiar Fecha de Vencimiento
            </DialogTitle>
            <DialogDescription>
              Actualiza la fecha de vencimiento de todos los cronogramas pendientes de un concepto.
            </DialogDescription>
          </DialogHeader>

          <Form {...updateForm}>
            <form onSubmit={updateForm.handleSubmit(onUpdateFecha)} className="space-y-4">
              <FormField
                control={updateForm.control}
                name="conceptoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concepto de Pago</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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

              <FormField
                control={updateForm.control}
                name="nuevaFecha"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Nueva Fecha de Vencimiento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Elegir fecha</span>
                            )}
                            <IconCalendarEvent className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
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

              <FormField
                control={updateForm.control}
                name="nivelAcademicoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcance (Opcional)</FormLabel>
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
                    <FormDescription className="text-xs">
                      Deja en "Toda la institución" para actualizar todas las secciones.
                    </FormDescription>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUpdateDialogOpen(false)}
                  disabled={isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || !updateForm.watch("conceptoId")}
                >
                  {isPending ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    "Actualizar Fechas"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <MoraActionsDialog
        open={moraDialogOpen}
        onOpenChange={setMoraDialogOpen}
        conceptos={conceptos}
        secciones={secciones}
      />
    </>
  )
}
