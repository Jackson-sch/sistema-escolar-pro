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
} from "@tabler/icons-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Comprobante } from "./types";

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
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase text-zinc-400 flex items-center gap-2">
          <IconSwitchHorizontal className="size-4" /> Validación de Datos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sender Card (Glass style) */}
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h4 className="text-xs font-bold text-blue-600 mb-4 uppercase">
              Datos del Padre
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Nombre remitente
                </p>
                <p className="font-bold mt-1 capitalize text-zinc-900 dark:text-white">
                  {comprobante.padre.name} {comprobante.padre.apellidoPaterno}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Fecha Operación
                </p>
                <p className="font-bold mt-1 text-zinc-900 dark:text-white">
                  {formatDate(comprobante.fechaOperacion)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Entidad Bancaria
                </p>
                <p className="font-bold mt-1 text-zinc-900 dark:text-white capitalize">
                  {comprobante.bancoOrigen || "No especificado"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  N° Operación
                </p>
                <p className="font-bold mt-1 tracking-wider text-blue-600 font-mono">
                  {comprobante.numeroOperacion || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* System Card */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h4 className="text-xs font-bold text-emerald-600 mb-4 uppercase">
              Sugerencia Sistema
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Monto Esperado
                </p>
                <p className="font-bold mt-1 flex items-center gap-2 text-zinc-900 dark:text-white">
                  {formatCurrency(comprobante.cronograma.monto)}
                  {Math.abs(comprobante.monto - comprobante.cronograma.monto) <
                    0.01 && (
                    <IconCircleCheck className="size-4 text-emerald-500" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Alumno Asignado
                </p>
                <p className="font-bold mt-1 text-zinc-900 dark:text-white capitalize">
                  {comprobante.cronograma.estudiante.name}{" "}
                  {comprobante.cronograma.estudiante.apellidoPaterno}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Deuda Pendiente
                </p>
                <p className="font-bold mt-1 text-amber-600">
                  {formatCurrency(comprobante.cronograma.monto)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase">
                  Prioridad
                </p>
                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-blue-700 dark:text-blue-400 text-[10px] font-bold"
                  >
                    ALTA
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase text-zinc-400 mb-4 flex items-center gap-2">
          <IconMessageDots className="size-4" /> Notas del Administrador
          (Interno)
        </h3>
        <Textarea
          className="w-full bg-transparent border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-sm min-h-[80px] border shadow-sm dark:text-white"
          placeholder="Escribe alguna observación o nota interna..."
          value={motivoRechazo}
          onChange={(e) => setMotivoRechazo(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          disabled={loading}
          onClick={() => onAprobar(comprobante.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-full shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group active:scale-95 h-auto text-base"
        >
          {loading ? (
            <IconLoader2 className="size-5 animate-spin" />
          ) : (
            <IconRosetteDiscountCheck className="size-5 group-hover:scale-120 transition-transform" />
          )}
          APROBAR PAGO
        </Button>

        <Button
          variant="outline"
          disabled={loading}
          onClick={() => onRechazar(comprobante)}
          className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-bold py-4 px-6 rounded-full border border-red-600/20 transition-all flex items-center justify-center gap-2 active:scale-95 h-auto text-base"
        >
          <IconX className="size-5" />
          RECHAZAR
        </Button>
      </div>

      <p className="text-center text-[10px] text-zinc-400 uppercase font-medium">
        Los pagos aprobados se reflejarán instantáneamente en el estado de
        cuenta del padre.
      </p>
    </div>
  );
}
