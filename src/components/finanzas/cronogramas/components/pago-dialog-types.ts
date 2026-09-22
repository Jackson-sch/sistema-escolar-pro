import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";
import type { FormatoComprobante } from "@/lib/comprobante-constants";

export interface PagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cronograma: CronogramaTableType | null;
  institucion?: any;
  initialMonto?: string;
  initialNumeroBoleta?: string;
  formatoComprobante?: FormatoComprobante;
  onSuccess?: () => void;
}

export interface PagoDialogState {
  montoPago: string;
  metodoPago: string;
  referencia: string;
  numeroBoleta: string;
  observaciones: string;
  imprimirComprobante: boolean;
  isPending: boolean;
  isSuccess: boolean;
  lastPaymentData: any;
}

export type PagoDialogAction =
  | { type: "PATCH"; patch: Partial<PagoDialogState> }
  | { type: "INIT"; monto: string; numeroBoleta: string }
  | { type: "RESET" };

export const pagoDialogInitialState: PagoDialogState = {
  montoPago: "",
  metodoPago: "Efectivo",
  referencia: "",
  numeroBoleta: "",
  observaciones: "",
  imprimirComprobante: true,
  isPending: false,
  isSuccess: false,
  lastPaymentData: null,
};

export function pagoDialogReducer(
  state: PagoDialogState,
  action: PagoDialogAction,
): PagoDialogState {
  switch (action.type) {
    case "PATCH":
      return { ...state, ...action.patch };
    case "INIT":
      return {
        ...state,
        montoPago: action.monto,
        numeroBoleta: action.numeroBoleta,
      };
    case "RESET":
      return {
        ...state,
        montoPago: "",
        metodoPago: "Efectivo",
        referencia: "",
        numeroBoleta: "",
        observaciones: "",
        isSuccess: false,
        lastPaymentData: null,
      };
    default:
      return state;
  }
}
