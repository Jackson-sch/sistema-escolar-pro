"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  IconSwitchHorizontal,
  IconCircleCheck,
  IconMessageDots,
  IconLoader2,
  IconRosetteDiscountCheck,
  IconX,
  IconAlertTriangle,
  IconCheck,
  IconUser,
  IconBuildingBank,
  IconReceipt,
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Comprobante } from "./types";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";

interface VerificacionActionPanelProps {
  comprobante: Comprobante;
  loading: boolean;
  onAprobar: (id: string) => void;
  onRechazar: (comprobante: Comprobante) => void;
  motivoRechazo: string;
  setMotivoRechazo: (val: string) => void;
}

export function VerificacionActionPanel({
  comprobante,
  loading,
  onAprobar,
  onRechazar,
  motivoRechazo,
  setMotivoRechazo,
}: VerificacionActionPanelProps) {
  const diffMonto = comprobante.monto - comprobante.cronograma.monto;
  const isExactMatch = Math.abs(diffMonto) < 0.01;

  return (
    <div className="space-y-4">
      {/* Banner de Validación de Coincidencia de Monto */}
      {isExactMatch ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IconCircleCheck className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Coincidencia Exacta de Monto
              </p>
              <p className="text-[11px] text-muted-foreground">
                El importe transferido ({formatCurrency(comprobante.monto)}) coincide al 100% con la cuota esperada.
              </p>
            </div>
          </div>
          <Badge className="bg-emerald-600 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-lg shrink-0">
            Validado
          </Badge>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <IconAlertTriangle className="size-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Diferencia en el Importe
              </p>
              <p className="text-[11px] text-muted-foreground">
                Transferido: <strong className="text-foreground">{formatCurrency(comprobante.monto)}</strong> | Esperado: <strong className="text-foreground">{formatCurrency(comprobante.cronograma.monto)}</strong> ({diffMonto > 0 ? `+${formatCurrency(diffMonto)}` : formatCurrency(diffMonto)})
              </p>
            </div>
          </div>
          <Badge className="bg-amber-600 text-white font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-lg shrink-0">
            Revisar
          </Badge>
        </div>
      )}

      {/* Tarjetas Comparativas de Validación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Remitente Padre */}
        <div className="p-4 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/20">
            <IconUser className="size-4 text-indigo-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Datos del Declarado
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">Remitente</span>
              <span className="font-bold text-foreground capitalize">
                {comprobante.padre.name} {comprobante.padre.apellidoPaterno}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-medium text-muted-foreground block">Banco Origen</span>
                <span className="font-semibold text-foreground capitalize">
                  {comprobante.bancoOrigen || "No especificado"}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-muted-foreground block">N° Operación</span>
                <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                  {comprobante.numeroOperacion || "—"}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">Fecha de Operación</span>
              <span className="font-medium text-foreground">
                {formatDate(comprobante.fechaOperacion)}
              </span>
            </div>
          </div>
        </div>

        {/* Sistema Escolar */}
        <div className="p-4 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-border/20">
            <IconReceipt className="size-4 text-emerald-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Registro del Sistema
            </h4>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">Alumno Asignado</span>
              <span className="font-bold text-foreground capitalize">
                {comprobante.cronograma.estudiante.name}{" "}
                {comprobante.cronograma.estudiante.apellidoPaterno}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-medium text-muted-foreground block">Concepto</span>
                <span className="font-semibold text-foreground">
                  {comprobante.cronograma.concepto.nombre}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-muted-foreground block">Monto Programado</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(comprobante.cronograma.monto)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notas del Administrador */}
      <div className="p-3.5 rounded-2xl bg-background/50 border border-border/30 shadow-xs space-y-2">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-1.5">
          <IconMessageDots className="size-4 text-indigo-500" />
          Observaciones / Motivo de Rechazo (Opcional)
        </h3>
        <Textarea
          className="w-full bg-background border-border/40 rounded-xl text-xs min-h-[60px] p-2.5 resize-none"
          placeholder="Escriba alguna observación o el motivo en caso de rechazo..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
      </div>

      {/* Guía de Atajos de Teclado */}
      <FormKeyboardHelpBar
        shortcuts={[
          { key: "↵ Enter / A", description: "Aprobar Comprobante" },
          { key: "R", description: "Rechazar Comprobante" },
          { key: "↑ / ↓", description: "Navegar Lista" },
        ]}
      />

      {/* Acciones Principales */}
      <div className="flex flex-col sm:flex-row gap-3 pt-1">
        <Button
          disabled={loading}
          onClick={() => onAprobar(comprobante.id)}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl h-11 shadow-md shadow-indigo-500/20 gap-2 transition-colors cursor-pointer"
        >
          {loading ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconRosetteDiscountCheck className="size-4" />
          )}
          <span>Aprobar Comprobante de Pago</span>
        </Button>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => onRechazar(comprobante)}
          className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold border-rose-500/20 rounded-xl h-11 gap-2 transition-colors cursor-pointer"
        >
          <IconX className="size-4" />
          <span>Rechazar Pago</span>
        </Button>
      </div>
    </div>
  );
}
