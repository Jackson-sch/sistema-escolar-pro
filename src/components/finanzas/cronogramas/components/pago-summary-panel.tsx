"use client";

import { IconCalendarEvent, IconAlertTriangle } from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";

interface PagoSummaryPanelProps {
  cronograma: CronogramaTableType;
  deudaCalculada: number;
  montoCobrado: number;
  saldoRestante: number;
  isOverpaying: boolean;
  progressPct: number;
  initials: string;
}

export function PagoSummaryPanel({
  cronograma,
  deudaCalculada,
  montoCobrado,
  saldoRestante,
  isOverpaying,
  progressPct,
  initials,
}: PagoSummaryPanelProps) {
  return (
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
                "h-full rounded-full transition-[background-color,width] duration-500",
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
          <span className="text-sm font-bold text-white">Saldo restante</span>
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
