"use client";

import {
  IconCalculator,
  IconCircleCheck,
  IconLoader2,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CronogramaItem, METODOS_PAGO } from "./pos-types";

interface POSPaymentPanelProps {
  numeroBoleta: string;
  cuotasSeleccionadas: CronogramaItem[];
  totalCobrar: number;
  metodoPago: string;
  setMetodoPago: (m: string) => void;
  montoEfectivoRecibido: string;
  setMontoEfectivoRecibido: (m: string) => void;
  vuelto: number;
  numeroOperacion: string;
  setNumeroOperacion: (op: string) => void;
  isProcessing: boolean;
  onProcesarCobro: () => void;
}

export function POSPaymentPanel({
  numeroBoleta,
  cuotasSeleccionadas,
  totalCobrar,
  metodoPago,
  setMetodoPago,
  montoEfectivoRecibido,
  setMontoEfectivoRecibido,
  vuelto,
  numeroOperacion,
  setNumeroOperacion,
  isProcessing,
  onProcesarCobro,
}: POSPaymentPanelProps) {
  return (
    <Card className="rounded-2xl border-border/60 bg-card shadow-xs">
      <CardHeader className="p-4 sm:p-5 pb-3">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>Liquidación de Cobranza</span>
          <Badge variant="outline" className="text-[10px] font-mono">
            {numeroBoleta || "B001-000001"}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 pt-0 space-y-4">
        {/* Resumen de Items Seleccionados */}
        <div className="space-y-1.5 p-3.5 rounded-xl bg-muted/20 border border-border/40 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Cuotas seleccionadas:</span>
            <span className="font-bold text-foreground">
              {cuotasSeleccionadas.length}
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-foreground">
              S/ {totalCobrar.toFixed(2)}
            </span>
          </div>
          <Separator className="my-2 bg-border/40" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-extrabold text-foreground">
              TOTAL A COBRAR:
            </span>
            <span className="text-lg font-black font-mono text-primary">
              S/ {totalCobrar.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Métodos de Pago (Pastillas de 1 Toque) */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-foreground">
            Método de Pago
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {METODOS_PAGO.map((m) => {
              const Icon = m.icon;
              const isSelected = metodoPago === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMetodoPago(m.id)}
                  className={cn(
                    "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background border-border/60 hover:bg-muted/30 text-foreground",
                  )}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculadora de Vuelto (Si es Efectivo) */}
        {metodoPago === "Efectivo" && (
          <div className="space-y-2 p-3.5 rounded-xl bg-muted/20 border border-border/40">
            <Label className="text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <IconCalculator size={14} className="text-primary" /> Paga con
                Efectivo:
              </span>
              {vuelto > 0 && (
                <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                  Vuelto: S/ {vuelto.toFixed(2)}
                </span>
              )}
            </Label>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.10"
                value={montoEfectivoRecibido}
                onChange={(e) => setMontoEfectivoRecibido(e.target.value)}
                placeholder={`Ej: ${Math.ceil(totalCobrar / 50) * 50 || 100}`}
                className="h-9 text-xs font-mono font-bold bg-background rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setMontoEfectivoRecibido(totalCobrar.toString())}
                className="h-9 px-3 text-[11px] font-bold rounded-xl shrink-0"
              >
                Exacto
              </Button>
            </div>

            {/* Botones de billetes comunes */}
            <div className="flex items-center gap-1.5 pt-1">
              {[50, 100, 200].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMontoEfectivoRecibido(b.toString())}
                  className="flex-1 py-1 text-[10px] font-bold font-mono rounded-lg bg-background border border-border/50 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors"
                >
                  S/ {b}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Campo de Operación (Si es Yape/Plin/POS) */}
        {metodoPago !== "Efectivo" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">
              N° Operación / Referencia (Opcional)
            </Label>
            <Input
              value={numeroOperacion}
              onChange={(e) => setNumeroOperacion(e.target.value)}
              placeholder="Ej: 128490 (Código Yape / POS)"
              className="h-9 text-xs font-mono bg-background rounded-xl"
            />
          </div>
        )}

        {/* BOTÓN MAESTRO DE COBRO */}
        <div className="pt-2">
          <Button
            type="button"
            onClick={onProcesarCobro}
            disabled={isProcessing || cuotasSeleccionadas.length === 0}
            className="w-full h-12 rounded-xl text-sm font-extrabold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/25 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <IconLoader2 className="size-5 animate-spin" />
                <span>Procesando Cobranza...</span>
              </>
            ) : (
              <>
                <IconCircleCheck className="size-5" />
                <span>Cobrar S/ {totalCobrar.toFixed(2)} [Ctrl + Enter]</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
