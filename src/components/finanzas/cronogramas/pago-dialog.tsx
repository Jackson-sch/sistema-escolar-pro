"use client";

import { useState, useEffect } from "react";
import {
  IconCash,
  IconX,
  IconPrinter,
  IconCircleCheck,
  IconLoader2,
  IconCalendarEvent,
  IconCategory,
  IconReceipt2,
  IconNotes,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { registrarPagoAction } from "@/actions/finance";

import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";
import { PagoSuccessView } from "@/components/finanzas/cronogramas/pago-success-view";
import { cn } from "@/lib/utils";
import { METODOS } from "@/lib/constants";

interface PagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronograma: CronogramaTableType | null;
  institucion?: any;
  initialMonto?: string;
  initialNumeroBoleta?: string;
  onSuccess?: () => void;
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
  const [montoPago, setMontoPago] = useState(initialMonto);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [referencia, setReferencia] = useState("");
  const [numeroBoleta, setNumeroBoleta] = useState(initialNumeroBoleta);
  const [observaciones, setObservaciones] = useState("");
  const [imprimirComprobante, setImprimirComprobante] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<any>(null);

  useEffect(() => {
    if (open && cronograma) {
      setMontoPago(
        initialMonto || (cronograma.monto - cronograma.montoPagado).toString(),
      );
      setNumeroBoleta(initialNumeroBoleta);
    }
  }, [open, cronograma, initialMonto, initialNumeroBoleta]);

  const handlePago = async () => {
    if (!cronograma || !montoPago) return;

    setIsPending(true);
    const res = await registrarPagoAction({
      cronogramaId: cronograma.id,
      monto: parseFloat(montoPago),
      metodoPago,
      referencia,
      numeroBoleta,
      observaciones,
    });
    setIsPending(false);

    if (res.success) {
      setLastPaymentData({
        numeroBoleta,
        fechaPago: new Date(),
        monto: parseFloat(montoPago),
        metodoPago,
        referenciaPago: referencia,
        concepto: cronograma.concepto.nombre,
        observaciones,
      });
      setIsSuccess(true);
      toast.success(res.success);
      onSuccess?.();
    }
    if (res.error) toast.error(res.error);
  };

  const resetForm = () => {
    setMontoPago("");
    setMetodoPago("Efectivo");
    setReferencia("");
    setNumeroBoleta("");
    setObservaciones("");
    setIsSuccess(false);
    setLastPaymentData(null);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  if (!cronograma) return null;

  const deudaCalculada =
    (Number(cronograma.monto) || 0) - (Number(cronograma.montoPagado) || 0);
  const saldoRestante = Math.max(0, deudaCalculada - (Number(montoPago) || 0));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl p-0 bg-[#09090b] border-[#27272a] rounded-t-[1.5rem] sm:rounded-[1.5rem] shadow-2xl overflow-hidden max-h-[96vh] sm:max-h-[90vh] flex flex-col focus:outline-none border-none sm:border">
        {isSuccess && lastPaymentData ? (
          <PagoSuccessView
            paymentData={lastPaymentData}
            cronograma={cronograma}
            institucion={institucion}
            onClose={resetForm}
          />
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header - Fixed */}
            <div className="px-6 py-4 sm:px-8 sm:py-6 flex items-center justify-between border-b border-[#27272a] shrink-0 bg-[#09090b] z-20">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-none truncate">
                    Registrar Recaudación
                  </DialogTitle>
                  <span className="text-[10px] font-mono bg-[#18181b] text-zinc-400 px-2 py-1 rounded shrink-0">
                    ID: {cronograma.id.slice(-8).toUpperCase()}
                  </span>
                </div>
                <p className="text-zinc-400 mt-1 font-medium text-xs sm:text-sm truncate">
                  {cronograma.concepto.nombre}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleOpenChange(false)}
                className="rounded-full size-10 hover:bg-[#18181b] text-zinc-400 transition-colors shrink-0 outline-none"
                type="button"
              >
                <IconX className="size-6" />
              </Button>
            </div>

            {/* Scrollable Area - Use flex-1 with overflow-y-auto and touch behavior */}
            <div className="flex-1 overflow-y-auto overscroll-contain bg-[#09090b] outline-none select-none h-[calc(100svh-120px)] sm:h-auto">
              <div className="flex flex-col md:flex-row min-h-min">
                {/* Columna Izquierda: Info (5/12) */}
                <div className="w-full md:w-5/12 p-6 sm:p-8 bg-zinc-900/40 border-b md:border-b-0 md:border-r border-[#27272a] space-y-6 sm:space-y-8 flex flex-col shrink-0">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      Estudiante
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 sm:size-12 bg-blue-600/10 text-blue-500 border border-blue-500/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="font-bold text-lg sm:text-xl uppercase">
                          {cronograma.estudiante.name[0] +
                            cronograma.estudiante.apellidoPaterno[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 capitalize">
                        <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                          {cronograma.estudiante.apellidoPaterno}{" "}
                          {cronograma.estudiante.apellidoMaterno}
                        </h2>
                        <p className="text-zinc-400 font-medium text-xs sm:text-sm truncate">
                          {cronograma.estudiante.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 bg-[#18181b]/60 rounded-2xl border border-[#27272a] shadow-inner">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">
                      Deuda Total
                    </p>
                    <p className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tighter mb-2 tabular-nums">
                      {formatCurrency(deudaCalculada)}
                    </p>
                    {cronograma.fechaVencimiento && (
                      <div className="flex items-center gap-1.5 text-rose-400 font-medium text-[10px] sm:text-xs">
                        <IconCalendarEvent className="size-4 shrink-0" />
                        <span>
                          Vence: {formatDate(cronograma.fechaVencimiento)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-6 border-t border-[#27272a] mt-auto">
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-zinc-500 font-medium">
                        Monto cobrado
                      </span>
                      <span className="font-semibold text-white">
                        {formatCurrency(Number(montoPago) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs sm:text-sm">
                      <span className="text-zinc-500 font-medium">
                        Descuento / Mora
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {formatCurrency(Number(cronograma.moraAcumulada) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-dashed border-[#27272a]">
                      <span className="font-bold text-white text-sm sm:text-base">
                        Saldo Restante
                      </span>
                      <span className="font-black text-blue-500 text-base sm:text-lg uppercase">
                        {formatCurrency(saldoRestante)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Formulario (7/12) */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 space-y-6 bg-[#09090b]">
                  <form
                    className="space-y-6"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handlePago();
                    }}
                  >
                    {/* Monto */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <IconCash className="size-4 text-blue-500" />
                        Monto a Cobrar
                      </Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                          S/
                        </span>
                        <Input
                          type="number"
                          step="0.01"
                          value={montoPago}
                          onChange={(e) => setMontoPago(e.target.value)}
                          className="w-full pl-10 pr-4 py-5 bg-[#18181b] border-[#27272a] rounded-full text-lg sm:text-xl font-bold text-white focus:ring-blue-600 focus:border-blue-600 transition-all border-none"
                        />
                      </div>
                    </div>

                    {/* Método Pago */}
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <IconCategory className="size-4 text-blue-500" />
                        Método de Pago
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                        {METODOS.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodoPago(m.id)}
                            className={cn(
                              "flex flex-row sm:flex-col items-center justify-start sm:justify-center px-4 py-3 sm:p-2 border border-[#27272a] bg-[#18181b] rounded-xl transition-all duration-300 text-zinc-500 hover:border-blue-500/50 group gap-3 sm:gap-1 outline-none",
                              metodoPago === m.id
                                ? m.activeClass
                                : m.hoverClass || "hover:border-blue-500/30",
                            )}
                          >
                            <m.icon
                              className={cn(
                                "size-5 sm:size-6 transition-colors shrink-0",
                                metodoPago === m.id
                                  ? ""
                                  : "group-hover:text-blue-500",
                              )}
                              strokeWidth={1.5}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-tight truncate">
                              {m.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comprobante */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <IconReceipt2 className="size-4 text-blue-500" />
                        Comprobante / Operación
                      </Label>
                      <Input
                        placeholder="Ej. B001-000005"
                        type="text"
                        value={numeroBoleta}
                        onChange={(e) => setNumeroBoleta(e.target.value)}
                        className="w-full py-5 bg-[#18181b] border-[#27272a] rounded-full text-white font-medium focus:ring-blue-600 focus:border-blue-600 text-sm sm:text-base border-none"
                      />
                    </div>

                    {/* Observaciones */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <IconNotes className="size-4 text-blue-500" />
                        Observaciones (Opcional)
                      </Label>
                      <Textarea
                        className="w-full px-4 py-3 bg-[#18181b] border-[#27272a] rounded-xl text-white focus:ring-blue-600 focus:border-blue-600 resize-none text-sm border-none"
                        placeholder="Detalles adicionales..."
                        rows={2}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                      />
                    </div>

                    {/* Switch Impresión */}
                    <div className="flex items-center justify-between p-4 bg-blue-600/5 rounded-xl border border-blue-600/20 group transition-colors hover:bg-blue-600/10 mb-4">
                      <div className="flex items-center gap-3 pr-2">
                        <IconPrinter
                          className="size-5 text-blue-500 shrink-0"
                          strokeWidth={2}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-white leading-none">
                            Imprimir
                          </span>
                          <span className="text-[10px] text-zinc-500 mt-1 truncate">
                            Generar PDF al confirmar
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={imprimirComprobante}
                        onCheckedChange={setImprimirComprobante}
                        className="data-[state=checked]:bg-blue-600 shrink-0"
                      />
                    </div>

                    {/* Botón */}
                    <Button
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] mt-6 shrink-0 outline-none"
                      type="submit"
                      disabled={isPending || !montoPago}
                    >
                      {isPending ? (
                        <IconLoader2 className="size-6 animate-spin" />
                      ) : (
                        <>
                          <span className="text-sm sm:text-base">
                            CONFIRMAR COBRO
                          </span>
                          <IconCircleCheck
                            className="size-5 sm:size-6"
                            strokeWidth={2.5}
                          />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
