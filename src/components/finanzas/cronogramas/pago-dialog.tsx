"use client";

import { useEffect, useReducer } from "react";
import { toast } from "sonner";
import { registrarPagoAction } from "@/actions/finance";
import { FormModal } from "@/components/modals/form-modal";
import { PagoSuccessView } from "@/components/finanzas/cronogramas/pago-success-view";

import {
  PagoDialogProps,
  pagoDialogInitialState,
  pagoDialogReducer,
} from "./components/pago-dialog-types";
import { PagoSummaryPanel } from "./components/pago-summary-panel";
import { PagoFormPanel } from "./components/pago-form-panel";

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
  const [state, dispatch] = useReducer(pagoDialogReducer, undefined, () => ({
    ...pagoDialogInitialState,
    montoPago: initialMonto,
    numeroBoleta: initialNumeroBoleta,
  }));

  const {
    montoPago,
    metodoPago,
    referencia,
    numeroBoleta,
    observaciones,
    imprimirComprobante,
    isPending,
    isSuccess,
    lastPaymentData,
  } = state;

  useEffect(() => {
    if (open && cronograma) {
      dispatch({
        type: "INIT",
        monto:
          initialMonto ||
          (cronograma.monto - cronograma.montoPagado).toString(),
        numeroBoleta: initialNumeroBoleta,
      });
    }
  }, [open, cronograma, initialMonto, initialNumeroBoleta]);

  const handlePago = async () => {
    if (!cronograma || !montoPago) return;

    dispatch({ type: "PATCH", patch: { isPending: true } });
    let res: Awaited<ReturnType<typeof registrarPagoAction>>;
    try {
      res = await registrarPagoAction({
        cronogramaId: cronograma.id,
        monto: parseFloat(montoPago),
        metodoPago,
        referencia,
        numeroBoleta,
        observaciones,
      });
    } finally {
      dispatch({ type: "PATCH", patch: { isPending: false } });
    }

    if (!res) return;
    if (res.success) {
      dispatch({
        type: "PATCH",
        patch: {
          lastPaymentData: {
            numeroBoleta,
            fechaPago: new Date(),
            monto: parseFloat(montoPago),
            metodoPago,
            referenciaPago: referencia,
            concepto: cronograma.concepto.nombre,
            observaciones,
          },
          isSuccess: true,
        },
      });
      toast.success(res.success);
      onSuccess?.();
    }
    if (res.error) toast.error(res.error);
  };

  const resetForm = () => {
    dispatch({ type: "RESET" });
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
          {/* Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain outline-none h-[calc(100svh-120px)] sm:h-auto">
            <div className="flex flex-col md:flex-row min-h-min">
              {/* LEFT: Student & Summary */}
              <PagoSummaryPanel
                cronograma={cronograma}
                deudaCalculada={deudaCalculada}
                montoCobrado={montoCobrado}
                saldoRestante={saldoRestante}
                isOverpaying={isOverpaying}
                progressPct={progressPct}
                initials={initials}
              />

              {/* RIGHT: Form */}
              <PagoFormPanel
                state={{
                  montoPago,
                  metodoPago,
                  referencia,
                  numeroBoleta,
                  observaciones,
                  imprimirComprobante,
                  isPending,
                }}
                onPatch={(patch) => dispatch({ type: "PATCH", patch })}
                onSubmit={handlePago}
              />
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

export type { PagoDialogProps };
