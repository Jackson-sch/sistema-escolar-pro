"use client";

import { useState, useEffect } from "react";
import {
  IconCash,
  IconPrinter,
  IconCircleCheck,
  IconLoader2,
  IconCalendarEvent,
  IconCategory,
  IconReceipt2,
  IconNotes,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { toast } from "sonner";

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
import type { FormatoComprobante } from "@/lib/comprobante-constants";
import { FormModal } from "@/components/modals/form-modal";

interface PagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronograma: CronogramaTableType | null;
  institucion?: any;
  initialMonto?: string;
  initialNumeroBoleta?: string;
  formatoComprobante?: FormatoComprobante;
  onSuccess?: () => void;
}

export function PagoDialog({
  open,
  onOpenChange,
  cronograma,
  institucion,
  initialMonto = "",
  initialNumeroBoleta = "",
  formatoComprobante = "A4",
  onSuccess,
}: PagoDialogProps) {
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
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  if (!cronograma) return null;

  const deudaCalculada =
    (Number(cronograma.monto) || 0) - (Number(cronograma.montoPagado) || 0);
  const montoCobrado = Number(montoPago) || 0;
  const saldoRestante = Math.max(0, deudaCalculada - montoCobrado);
  const isOverpaying = montoCobrado > deudaCalculada;
  const progressPct = Math.min(100, (montoCobrado / deudaCalculada) * 100) || 0;

  const initials =
    (cronograma.estudiante.name[0] ?? "") +
    (cronograma.estudiante.apellidoPaterno[0] ?? "");

  console.log("🚀 ~ PagoDialog ~ cronograma:", cronograma);
  return (
    <FormModal
      isOpen={open}
      onOpenChange={handleOpenChange}
      title="Registrar Recaudación"
      className="sm:max-w-4xl custom-scrollbar"
      titleSpan={`#${cronograma.id.slice(-8).toUpperCase()}`}
      description={cronograma.concepto.nombre}
    >
      {isSuccess && lastPaymentData ? (
        <PagoSuccessView
          paymentData={lastPaymentData}
          cronograma={cronograma}
          institucion={institucion}
          formatoComprobante={formatoComprobante}
          onClose={resetForm}
        />
      ) : (
        <div className="flex flex-col h-full overflow-hidden bg-background rounded-md">
          {/* ── Body ───────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain outline-none h-[calc(100svh-120px)] sm:h-auto">
            <div className="flex flex-col md:flex-row min-h-min">
              {/* ── LEFT: Student & Summary ─────────────── */}
              <div className="w-full md:w-[42%] flex flex-col border-b md:border-b-0 md:border-r border-white/6 bg-white/1.5">
                {/* Student card */}
                <div className="p-6 sm:p-7 border-b border-white/6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-4">
                    Estudiante
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12 shrink-0 ring-2 ring-white/8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-linear-to-br from-blue-600/30 to-indigo-700/30 text-blue-300 font-bold text-base uppercase border border-blue-500/20">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-white leading-tight truncate capitalize">
                        {cronograma.estudiante.apellidoPaterno}{" "}
                        {cronograma.estudiante.apellidoMaterno}
                      </h2>
                      <p className="text-zinc-500 text-xs truncate capitalize mt-0.5">
                        {cronograma.estudiante.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Deuda & progress */}
                <div className="p-6 sm:p-7 border-b border-white/6">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-3">
                    Deuda pendiente
                  </p>

                  <div className="mb-4">
                    <span className="text-4xl font-black font-mono text-white tracking-tighter tabular-nums">
                      {formatCurrency(deudaCalculada)}
                    </span>
                    {cronograma.fechaVencimiento && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <IconCalendarEvent className="size-3.5 text-rose-500 shrink-0" />
                        <span className="text-rose-400 text-[11px] font-medium">
                          Vence {formatDate(cronograma.fechaVencimiento)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-white/6 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isOverpaying
                            ? "bg-amber-500"
                            : progressPct >= 100
                              ? "bg-emerald-500"
                              : "bg-blue-500",
                        )}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-600 font-medium text-right">
                      {progressPct.toFixed(0)}% del total
                    </p>
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="p-6 sm:p-7 mt-auto space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-4">
                    Resumen
                  </p>

                  <SummaryRow
                    label="Monto a cobrar"
                    value={formatCurrency(montoCobrado)}
                    valueClass="text-white"
                  />
                  {Number(cronograma.moraAcumulada) > 0 && (
                    <SummaryRow
                      label="Mora acumulada"
                      value={`+${formatCurrency(Number(cronograma.moraAcumulada))}`}
                      valueClass="text-rose-400"
                    />
                  )}

                  <div className="h-px bg-white/6 my-1" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      Saldo restante
                    </span>
                    <span
                      className={cn(
                        "text-base font-black font-mono tabular-nums",
                        saldoRestante === 0
                          ? "text-emerald-400"
                          : isOverpaying
                            ? "text-amber-400"
                            : "text-blue-400",
                      )}
                    >
                      {formatCurrency(saldoRestante)}
                    </span>
                  </div>

                  {isOverpaying && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <IconAlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                      <p className="text-[11px] text-amber-400 font-medium">
                        Monto supera la deuda total
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT: Form ─────────────────────────── */}
              <div className="w-full md:w-[58%] p-6 sm:p-8 bg-[#0a0a0f]">
                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handlePago();
                  }}
                >
                  {/* Monto */}
                  <FieldWrapper
                    icon={<IconCash className="size-3.5 text-blue-500" />}
                    label="Monto a Cobrar"
                  >
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold select-none">
                        S/
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={montoPago}
                        onChange={(e) => setMontoPago(e.target.value)}
                        className="w-full pl-10 pr-4 h-14 bg-white/4 border border-white/8 rounded-xl text-xl font-bold text-white focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/40 hover:border-white/13 transition-colors placeholder:text-zinc-700"
                        placeholder="0.00"
                      />
                    </div>
                  </FieldWrapper>

                  {/* Método de Pago */}
                  <FieldWrapper
                    icon={<IconCategory className="size-3.5 text-blue-500" />}
                    label="Método de Pago"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                      {METODOS.map((m) => {
                        const isActive = metodoPago === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMetodoPago(m.id)}
                            className={cn(
                              "relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-blue-500/60 overflow-hidden",
                              isActive
                                ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                                : "border-white/7 bg-white/2.5 text-zinc-500 hover:border-white/14 hover:text-zinc-300 hover:bg-white/5",
                            )}
                          >
                            {isActive && (
                              <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent pointer-events-none" />
                            )}
                            <m.icon
                              className={cn(
                                "size-5 transition-colors relative",
                                isActive ? "text-blue-400" : "",
                              )}
                              strokeWidth={1.5}
                            />
                            <span className="text-[9px] font-bold uppercase tracking-tight relative leading-none text-center">
                              {m.label}
                            </span>
                            {isActive && (
                              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-px bg-blue-400/60" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </FieldWrapper>

                  {/* N° Comprobante */}
                  <FieldWrapper
                    icon={<IconReceipt2 className="size-3.5 text-blue-500" />}
                    label="N° Comprobante / Operación"
                  >
                    <Input
                      placeholder="Ej. B001-000005"
                      type="text"
                      value={numeroBoleta}
                      onChange={(e) => setNumeroBoleta(e.target.value)}
                      className="h-11 bg-white/4 border border-white/8 rounded-xl text-white font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/40 hover:border-white/13 transition-colors placeholder:text-zinc-700 tracking-wider"
                    />
                  </FieldWrapper>

                  {/* Observaciones */}
                  <FieldWrapper
                    icon={<IconNotes className="size-3.5 text-blue-500" />}
                    label="Observaciones"
                    optional
                  >
                    <Textarea
                      className="bg-white/4 border border-white/8 rounded-xl text-white text-sm focus-visible:ring-1 focus-visible:ring-blue-500/60 focus-visible:border-blue-500/40 hover:border-white/13 transition-colors resize-none placeholder:text-zinc-700"
                      placeholder="Detalles adicionales del cobro..."
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                    />
                  </FieldWrapper>

                  {/* Switch Impresión */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white/3 rounded-xl border border-white/7 hover:border-white/11 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="size-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <IconPrinter
                          className="size-3.5 text-blue-400"
                          strokeWidth={2}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-300 leading-none">
                          Generar comprobante
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">
                          Imprimir / descargar PDF al confirmar
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={imprimirComprobante}
                      onCheckedChange={setImprimirComprobante}
                      className="data-[state=checked]:bg-blue-600 shrink-0"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isPending || !montoPago}
                    className={cn(
                      "relative w-full h-12 rounded-xl font-bold text-sm tracking-wide overflow-hidden transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed",
                      "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-400",
                    )}
                  >
                    {/* Shimmer */}
                    {!isPending && (
                      <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                    )}
                    <span className="relative flex items-center justify-center gap-2.5">
                      {isPending ? (
                        <IconLoader2 className="size-5 animate-spin" />
                      ) : (
                        <>
                          <IconCircleCheck
                            className="size-5"
                            strokeWidth={2.5}
                          />
                          CONFIRMAR COBRO
                        </>
                      )}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Keyframe for shimmer */}
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              60%, 100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      )}
    </FormModal>
  );
}

/* ─── Sub-components ─── */

function FieldWrapper({
  icon,
  label,
  optional = false,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-xs font-semibold text-zinc-400">
        <span className="size-5 rounded-md bg-white/5 border border-white/7 flex items-center justify-center shrink-0">
          {icon}
        </span>
        {label}
        {optional && (
          <span className="text-[10px] font-normal text-zinc-600 ml-auto">
            Opcional
          </span>
        )}
      </Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-zinc-500">{label}</span>
      <span className={cn("font-semibold tabular-nums font-mono", valueClass)}>
        {value}
      </span>
    </div>
  );
}
