"use client"

import { useState, useEffect } from "react"
import {
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconReceipt,
  IconNotebook,
  IconCalendar,
} from "@tabler/icons-react"
import { formatCurrency, formatDate } from "@/lib/formats"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { registrarPagoAction } from "@/actions/finance"

import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns"
import { PagoSuccessView } from "@/components/finanzas/cronogramas/pago-success-view"

interface PagoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cronograma: CronogramaTableType | null
  institucion?: any
  initialMonto?: string
  initialNumeroBoleta?: string
  onSuccess?: () => void
}

export function PagoDialog({
  open,
  onOpenChange,
  cronograma,
  institucion,
  initialMonto = "",
  initialNumeroBoleta = "",
  onSuccess,
}: PagoDialogProps) {
  console.log("🚀 ~ PagoDialog ~ cronograma:", cronograma)
  const [montoPago, setMontoPago] = useState(initialMonto)
  const [metodoPago, setMetodoPago] = useState("Efectivo")
  const [referencia, setReferencia] = useState("")
  const [numeroBoleta, setNumeroBoleta] = useState(initialNumeroBoleta)
  const [observaciones, setObservaciones] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [lastPaymentData, setLastPaymentData] = useState<any>(null)

  // Sync initial values when dialog opens with new cronograma
  useEffect(() => {
    if (open && cronograma) {
      setMontoPago(initialMonto)
      setNumeroBoleta(initialNumeroBoleta)
    }
  }, [open, cronograma, initialMonto, initialNumeroBoleta])

  const handlePago = async () => {
    if (!cronograma || !montoPago) return

    setIsPending(true)
    const res = await registrarPagoAction({
      cronogramaId: cronograma.id,
      monto: parseFloat(montoPago),
      metodoPago,
      referencia,
      numeroBoleta,
      observaciones,
    })
    setIsPending(false)

    if (res.success) {
      setLastPaymentData({
        numeroBoleta,
        fechaPago: new Date(),
        monto: parseFloat(montoPago),
        metodoPago,
        referenciaPago: referencia,
        concepto: cronograma.concepto.nombre,
        observaciones,
      })
      setIsSuccess(true)
      toast.success(res.success)
      onSuccess?.()
    }
    if (res.error) toast.error(res.error)
  }

  const resetForm = () => {
    setMontoPago("")
    setMetodoPago("Efectivo")
    setReferencia("")
    setNumeroBoleta("")
    setObservaciones("")
    setIsSuccess(false)
    setLastPaymentData(null)
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  if (!cronograma) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden flex flex-col">
        {isSuccess && lastPaymentData ? (
          <PagoSuccessView
            paymentData={lastPaymentData}
            cronograma={cronograma}
            institucion={institucion}
            onClose={resetForm}
          />
        ) : (
          <>
            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    Registrar Recaudación
                  </DialogTitle>
                  <DialogDescription className="text-base text-muted-foreground mt-1">
                    {cronograma.concepto.nombre}
                  </DialogDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-xs">
                  {cronograma.estudiante.codigoEstudiante || cronograma.estudiante.dni || "N/A"}
                </Badge>
              </div>
            </DialogHeader>

            {/* Form */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              {/* Resumen Estudiante y Deuda */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Estudiante
                  </Label>
                  <p className="font-semibold text-foreground leading-tight capitalize">
                    {cronograma.estudiante.apellidoPaterno}{" "}
                    {cronograma.estudiante.apellidoMaterno}
                    <br />
                    <span className="text-base font-medium">
                      {cronograma.estudiante.name}
                    </span>
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <Label className="text-xs uppercase font-semibold text-muted-foreground">
                    Deuda Total
                  </Label>
                  <p className="text-2xl font-bold text-foreground tracking-tight tabular-nums">
                    {formatCurrency(
                      (Number(cronograma.monto) || 0) -
                      (Number(cronograma.montoPagado) || 0)
                    )}
                  </p>
                  {cronograma.fechaVencimiento && (
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                      <IconCalendar className="size-3" /> Vence:{" "}
                      {formatDate(cronograma.fechaVencimiento)}
                    </p>
                  )}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Campos de Cobro */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <IconCash className="size-4 text-muted-foreground" /> Monto
                      a Cobrar
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={montoPago}
                      onChange={(e) => setMontoPago(e.target.value)}
                      className="text-lg font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <IconCreditCard className="size-4 text-muted-foreground" />{" "}
                      Método
                    </Label>
                    <Select value={metodoPago} onValueChange={setMetodoPago}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">
                          <div className="flex items-center gap-2">
                            <IconCash className="size-4" /> Efectivo
                          </div>
                        </SelectItem>
                        <SelectItem value="Transferencia">
                          <div className="flex items-center gap-2">
                            <IconBuildingBank className="size-4" /> Transferencia
                          </div>
                        </SelectItem>
                        <SelectItem value="Tarjeta">
                          <div className="flex items-center gap-2">
                            <IconCreditCard className="size-4" /> Tarjeta POS
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div
                  className={`${metodoPago !== "Efectivo"
                    ? "grid grid-cols-2"
                    : "grid grid-cols-1"
                    } gap-4`}
                >
                  {metodoPago !== "Efectivo" && (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <IconReceipt className="size-4 text-muted-foreground" />{" "}
                        Operación
                      </Label>
                      <Input
                        placeholder="Nro. Operación"
                        value={referencia}
                        onChange={(e) => setReferencia(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-medium">
                      <IconNotebook className="size-4 text-muted-foreground" />{" "}
                      Comprobante
                    </Label>
                    <Input
                      placeholder="Nro. Boleta"
                      value={numeroBoleta}
                      onChange={(e) => setNumeroBoleta(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Observaciones</Label>
                  <Textarea
                    placeholder="Detalles adicionales (opcional)..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="p-6 pt-0">
              <Button
                className="w-full font-medium"
                onClick={handlePago}
                disabled={isPending || !montoPago}
              >
                {isPending ? "Procesando..." : "Confirmar Cobro"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}