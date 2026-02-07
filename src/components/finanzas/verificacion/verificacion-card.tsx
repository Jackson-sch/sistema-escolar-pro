import { IconCalendarEvent } from "@tabler/icons-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/formats";
import { cn } from "@/lib/utils";
import { Comprobante } from "./types";

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
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 sm:p-4 mt-2 rounded-xl transition-all cursor-pointer group",
        isActive
          ? "ring-2 ring-blue-600/50 bg-white dark:bg-zinc-800/50 shadow-lg"
          : "bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-blue-600/50",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isActive
              ? "text-blue-600"
              : "text-zinc-400 group-hover:text-blue-600",
          )}
        >
          {comprobante.cronograma.concepto.nombre}
        </span>
        <span className="text-xs font-bold font-sans">
          {formatCurrency(comprobante.monto)}
        </span>
      </div>

      <h3 className="font-bold text-zinc-800 dark:text-zinc-100 truncate capitalize">
        {comprobante.cronograma.estudiante.name}{" "}
        {comprobante.cronograma.estudiante.apellidoPaterno}{" "}
        {comprobante.cronograma.estudiante.apellidoMaterno}
      </h3>

      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
        <IconCalendarEvent className="size-3.5" />
        {formatDate(comprobante.createdAt)} •{" "}
        {formatTime(comprobante.createdAt, "HH:mm:ss")}
      </p>
    </div>
  );
}
