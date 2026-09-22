"use client";

import {
  IconCash,
  IconPrinter,
  IconCircleCheck,
  IconLoader2,
  IconCategory,
  IconReceipt2,
  IconNotes,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { METODOS } from "@/lib/constants";
import { PagoDialogState } from "./pago-dialog-types";

interface PagoFormPanelProps {
  state: {
    montoPago: string;
    metodoPago: string;
    referencia: string;
    numeroBoleta: string;
    observaciones: string;
    imprimirComprobante: boolean;
    isPending: boolean;
  };
  onPatch: (patch: Partial<PagoDialogState>) => void;
  onSubmit: () => void;
}

export function PagoFormPanel({
  state,
  onPatch,
  onSubmit,
}: PagoFormPanelProps) {
  return (
    <div className="w-full md:w-[58%] p-6 sm:p-8 bg-[#0a0a0f]">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
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
              value={state.montoPago}
              onChange={(e) => onPatch({ montoPago: e.target.value })}
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
          <PaymentMethodGrid
            metodoPago={state.metodoPago}
            onSelect={(id) => onPatch({ metodoPago: id })}
          />
        </FieldWrapper>

        {/* N° Comprobante */}
        <FieldWrapper
          icon={<IconReceipt2 className="size-3.5 text-blue-500" />}
          label="N° Comprobante / Operación"
        >
          <Input
            placeholder="Ej. B001-000005"
            type="text"
            value={state.numeroBoleta}
            onChange={(e) => onPatch({ numeroBoleta: e.target.value })}
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
            value={state.observaciones}
            onChange={(e) => onPatch({ observaciones: e.target.value })}
          />
        </FieldWrapper>

        {/* Switch Impresión */}
        <div className="flex items-center justify-between px-4 py-3 bg-white/3 rounded-xl border border-white/7 hover:border-white/11 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="size-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <IconPrinter className="size-3.5 text-blue-400" strokeWidth={2} />
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
            checked={state.imprimirComprobante}
            onCheckedChange={(v) => onPatch({ imprimirComprobante: v })}
            className="data-[state=checked]:bg-blue-600 shrink-0"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={state.isPending || !state.montoPago}
          className={cn(
            "relative w-full h-12 rounded-xl font-bold text-sm tracking-wide overflow-hidden transition-[box-shadow,opacity,transform] duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer",
            "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:from-blue-500 hover:to-blue-400",
          )}
        >
          {!state.isPending && (
            <span className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          )}
          <span className="relative flex items-center justify-center gap-2.5">
            {state.isPending ? (
              <IconLoader2 className="size-5 animate-spin" />
            ) : (
              <>
                <IconCircleCheck className="size-5" strokeWidth={2.5} />
                CONFIRMAR COBRO
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}

function PaymentMethodGrid({
  metodoPago,
  onSelect,
}: {
  metodoPago: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
      {METODOS.map((m) => {
        const isActive = metodoPago === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-shadow duration-200 outline-none focus-visible:ring-1 focus-visible:ring-blue-500/60 overflow-hidden cursor-pointer",
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
  );
}

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
