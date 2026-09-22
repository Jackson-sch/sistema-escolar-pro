"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconAlertTriangle,
  IconBolt,
  IconCalendar,
  IconCheck,
  IconClock,
  IconReceipt,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";

export interface PaymentItemData {
  id: string;
  conceptoId: string;
  conceptoNombre: string;
  montoBase: number;
  moraAcumulada: number;
  montoTotal: number;
  montoPagado: number;
  saldoPendiente: number;
  fechaVencimiento: Date | string;
  estado: "PAID" | "PENDING" | "EXPIRED" | "PARTIALLY_PAID";
  pagado: boolean;
  diasVencido?: number;
  ultimosPagos?: {
    id: string;
    monto: number;
    metodoPago?: string;
    numeroBoleta?: string;
    fechaPago?: Date | string;
  }[];
}

interface EnrollmentPaymentItemProps {
  payment: PaymentItemData;
  estudianteId: string;
}

export function EnrollmentPaymentItem({
  payment,
  estudianteId,
}: EnrollmentPaymentItemProps) {
  const isPaid = payment.estado === "PAID" || payment.pagado;
  const isExpired = payment.estado === "EXPIRED";
  const isPartial = payment.estado === "PARTIALLY_PAID";
  const ultimoPago = payment.ultimosPagos?.[0];

  return (
    <div
      className={cn(
        "p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-2.5",
        isPaid
          ? "bg-card/40 border-border/50 hover:bg-card/70"
          : isExpired
            ? "bg-rose-500/[0.04] dark:bg-rose-500/[0.06] border-rose-500/30 hover:border-rose-500/50"
            : "bg-card border-border/60 hover:border-primary/40",
      )}
    >
      {/* Cabecera de la cuota: Concepto, Estado y Monto */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-foreground tracking-tight">
              {payment.conceptoNombre}
            </span>
            {isExpired && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 px-1.5 py-0.5 rounded-md uppercase tracking-wider animate-pulse">
                Venció hace {payment.diasVencido || 1} días
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <IconCalendar className="size-3.5 text-muted-foreground/70" />
              <span>Vence: {formatDate(payment.fechaVencimiento)}</span>
            </span>
            {payment.moraAcumulada > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-semibold text-[11px]">
                (+{formatCurrency(payment.moraAcumulada)} mora)
              </span>
            )}
          </div>
        </div>

        {/* Monto e Insignia */}
        <div className="flex flex-col items-end shrink-0 gap-1">
          <span className="text-base font-extrabold text-foreground tabular-nums tracking-tight">
            {formatCurrency(payment.montoTotal)}
          </span>
          {isPaid ? (
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 gap-1 shadow-2xs"
            >
              <IconCheck className="size-3" /> Pagado
            </Badge>
          ) : isExpired ? (
            <Badge
              variant="destructive"
              className="bg-rose-600 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider px-2 py-0.5 gap-1 shadow-2xs"
            >
              <IconAlertTriangle className="size-3" /> Vencido
            </Badge>
          ) : isPartial ? (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 font-black text-[10px] uppercase tracking-wider px-2 py-0.5 gap-1 shadow-2xs"
            >
              <IconClock className="size-3" /> Pago Parcial
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-muted/60 text-muted-foreground border-border/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 gap-1"
            >
              <IconClock className="size-3" /> Pendiente
            </Badge>
          )}
        </div>
      </div>

      {/* Detalle secundario: Si está pagado muestra comprobante, si está pendiente muestra acción de cobro */}
      {isPaid && ultimoPago ? (
        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-[11px] text-muted-foreground flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 font-mono font-bold text-foreground/80">
              <IconReceipt className="size-3.5 text-primary" />
              {ultimoPago.numeroBoleta || "Recibo Registrado"}
            </span>
            {ultimoPago.metodoPago && (
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md border border-border/40 font-medium">
                {ultimoPago.metodoPago}
              </span>
            )}
          </div>
          {ultimoPago.fechaPago && (
            <span className="text-[10px] text-muted-foreground/80">
              Pagado el {formatDate(ultimoPago.fechaPago)}
            </span>
          )}
        </div>
      ) : !isPaid ? (
        <div className="flex items-center justify-between pt-2 border-t border-border/30 text-xs gap-2">
          <div className="text-xs text-muted-foreground">
            {isPartial && (
              <span>Resta pagar: <strong className="text-foreground">{formatCurrency(payment.saldoPendiente)}</strong></span>
            )}
          </div>
          <Button
            size="sm"
            asChild
            className="h-7 text-[11px] font-bold px-2.5 rounded-xl gap-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-2xs cursor-pointer"
          >
            <Link href={`/finanzas/caja?estudianteId=${estudianteId}`}>
              <IconBolt className="size-3.5 text-amber-600 dark:text-amber-400" />
              Cobrar en POS
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
