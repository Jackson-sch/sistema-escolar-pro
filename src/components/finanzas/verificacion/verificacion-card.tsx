"use client";

import { IconCalendarEvent, IconCircleCheck, IconAlertTriangle } from "@tabler/icons-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { Comprobante } from "./types";
import { Badge } from "@/components/ui/badge";

interface VerificacionCardProps {
  comprobante: Comprobante;
  isActive: boolean;
  onClick: () => void;
}

export function VerificacionCard({
  comprobante,
  isActive,
  onClick,
}: VerificacionCardProps) {
  const isExactMatch = Math.abs(comprobante.monto - comprobante.cronograma.monto) < 0.01;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "p-3.5 rounded-2xl transition-[background-color,border-color,box-shadow,backdrop-filter,padding] cursor-pointer select-none border outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "bg-indigo-600/10 border-indigo-500/40 shadow-md shadow-indigo-500/10"
          : "bg-background/40 hover:bg-background border-border/40 hover:border-border/60",
      )}
    >
      <div className="flex justify-between items-start mb-1.5">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider",
            isActive ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground",
          )}
        >
          {comprobante.cronograma.concepto.nombre}
        </span>
        <div className="flex items-center gap-1.5">
          {isExactMatch ? (
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0 rounded-md">
              <IconCircleCheck className="size-3 mr-0.5" /> Ok
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold px-1.5 py-0 rounded-md">
              <IconAlertTriangle className="size-3 mr-0.5" /> Diferencia
            </Badge>
          )}
          <span className="text-xs font-bold font-mono text-foreground">
            {formatCurrency(comprobante.monto)}
          </span>
        </div>
      </div>

      <h3 className="font-bold text-xs text-foreground truncate capitalize">
        {comprobante.cronograma.estudiante.name}{" "}
        {comprobante.cronograma.estudiante.apellidoPaterno}{" "}
        {comprobante.cronograma.estudiante.apellidoMaterno}
      </h3>

      <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
        <IconCalendarEvent className="size-3 text-muted-foreground/70" />
        {formatDate(comprobante.createdAt)} • {formatTime(comprobante.createdAt, "HH:mm")}
      </p>
    </div>
  );
}
