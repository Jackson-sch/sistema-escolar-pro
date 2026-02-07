"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowBackUp,
  IconUser,
  IconBuildingBank,
} from "@tabler/icons-react";
import { formatCurrency } from "@/lib/formats";
import { Comprobante } from "./types";

interface VerificacionHeaderProps {
  comprobante: Comprobante;
  onBack?: () => void;
}

export function VerificacionHeader({
  comprobante,
  onBack,
}: VerificacionHeaderProps) {
  return (
    <>
      {/* Mobile Header (Back Button) */}
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-4 sm:hidden flex items-center gap-2 text-zinc-400 rounded-full px-0"
        >
          <IconArrowBackUp className="size-5" />
          <span className="font-bold uppercase text-[10px]">
            Volver a la lista
          </span>
        </Button>
      )}

      {/* Header Info */}
      <div className="mb-6 sm:mb-2 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 pb-6 sm:pb-2 border-b border-muted dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs font-bold bg-blue-600/10 text-blue-600 px-2 py-1 rounded-full"
            >
              Pendiente de Revisión
            </Badge>
            <span className="text-zinc-400">•</span>
            <span className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase font-mono">
              ID: {comprobante.id.slice(0, 12).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl sm:text-xl font-extrabold tracking-tight mb-2 text-zinc-900 dark:text-white leading-tight">
            {comprobante.cronograma.concepto.nombre}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <IconUser className="size-4 sm:size-5" />
              <span className="font-semibold capitalize text-xs sm:text-base">
                {comprobante.cronograma.estudiante.name}{" "}
                {comprobante.cronograma.estudiante.apellidoPaterno}{" "}
                {comprobante.cronograma.estudiante.apellidoMaterno}
              </span>
            </div>
            <span className="hidden sm:inline text-zinc-300 dark:text-zinc-700">
              |
            </span>
            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
              <IconBuildingBank className="size-4 sm:size-5" />
              <span className="font-medium text-xs sm:text-base">
                {comprobante.cronograma.estudiante.nivelAcademico
                  ? `${comprobante.cronograma.estudiante.nivelAcademico.grado.nombre} - ${comprobante.cronograma.estudiante.nivelAcademico.nivel.nombre}`
                  : "Grado no asignado"}
              </span>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0 mt-2 sm:mt-0">
          <p className="text-[10px] sm:text-xs font-bold uppercase text-zinc-400 mb-1">
            Monto a Validar
          </p>
          <p className="text-3xl sm:text-4xl font-black text-blue-600 font-mono tracking-tighter tabular-nums leading-none">
            {formatCurrency(comprobante.monto)}
          </p>
        </div>
      </div>
    </>
  );
}
