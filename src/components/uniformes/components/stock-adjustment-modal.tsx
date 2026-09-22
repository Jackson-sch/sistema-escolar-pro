"use client";

import { useState, useTransition } from "react";
import {
  IconPlus,
  IconMinus,
  IconArrowsSort,
  IconAlertTriangle,
  IconLoader2,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FormModal } from "@/components/modals/form-modal";
import { FormKeyboardHelpBar } from "@/components/common/form-keyboard-help-bar";
import { registrarMovimientoInventarioAction } from "@/actions/uniformes";
import { cn } from "@/lib/utils";

interface StockAdjustmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variante: any;
}

export function StockAdjustmentModal({
  open,
  onOpenChange,
  variante,
}: StockAdjustmentModalProps) {
  const [isPending, startTransition] = useTransition();
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA" | "AJUSTE">("ENTRADA");
  const [cantidad, setCantidad] = useState(1);
  const [motivo, setMotivo] = useState("");

  const handleAdjust = () => {
    if (cantidad <= 0 && tipo !== "AJUSTE") {
      toast.error("La cantidad debe ser mayor a cero");
      return;
    }

    startTransition(async () => {
      const res = await registrarMovimientoInventarioAction({
        varianteId: variante.id,
        tipo,
        cantidad,
        motivo:
          motivo ||
          (tipo === "ENTRADA"
            ? "Ingreso de stock"
            : tipo === "SALIDA"
              ? "Salida de mercadería"
              : "Ajuste manual"),
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Inventario actualizado correctamente");
        onOpenChange(false);
      }
    });
  };

  return (
    <FormModal
      isOpen={open}
      onOpenChange={onOpenChange}
      title="Ajuste de Stock e Inventario"
      description={`${variante?.uniforme?.nombre} — Talla ${variante?.talla} (${variante?.sede?.nombre})`}
      className="sm:max-w-[450px]"
    >
      <div className="space-y-4 px-1 py-1">
        {/* Selector de Tipo de Movimiento */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-background/50 rounded-xl border border-border/40">
          <Button
            type="button"
            variant={tipo === "ENTRADA" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("ENTRADA")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "ENTRADA"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-muted-foreground",
            )}
          >
            <IconPlus className="size-3.5 mr-1" /> Entrada
          </Button>
          <Button
            type="button"
            variant={tipo === "SALIDA" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("SALIDA")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "SALIDA"
                ? "bg-rose-600 text-white shadow-md"
                : "text-muted-foreground",
            )}
          >
            <IconMinus className="size-3.5 mr-1" /> Salida
          </Button>
          <Button
            type="button"
            variant={tipo === "AJUSTE" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTipo("AJUSTE")}
            className={cn(
              "rounded-lg font-semibold text-xs h-8 cursor-pointer",
              tipo === "AJUSTE"
                ? "bg-sky-600 text-white shadow-md"
                : "text-muted-foreground",
            )}
          >
            <IconArrowsSort className="size-3.5 mr-1" /> Ajuste
          </Button>
        </div>

        {/* Input de Cantidad con Botones + / - */}
        <div className="space-y-1.5">
          <label
            htmlFor="inventario-cantidad"
            className="text-xs font-medium text-foreground/80"
          >
            {tipo === "AJUSTE"
              ? "Stock Final Reemplazante"
              : "Unidades del Movimiento"}
          </label>
          <div className="flex items-center gap-3 bg-background/50 p-2 rounded-xl border border-border/40">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Disminuir cantidad"
              onClick={() => setCantidad(Math.max(0, cantidad - 1))}
              className="rounded-lg size-8 border-border/40 bg-background cursor-pointer"
            >
              <IconMinus className="size-3.5" />
            </Button>
            <Input
              id="inventario-cantidad"
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
              className="text-center font-mono font-bold text-lg h-9 bg-transparent border-none focus-visible:ring-0 shadow-none"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Aumentar cantidad"
              onClick={() => setCantidad(cantidad + 1)}
              className="rounded-lg size-8 border-border/40 bg-background cursor-pointer"
            >
              <IconPlus className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* Motivo o Guía */}
        <div className="space-y-1.5">
          <label
            htmlFor="inventario-motivo"
            className="text-xs font-medium text-foreground/80"
          >
            Motivo / Documento de Referencia
          </label>
          <Input
            id="inventario-motivo"
            placeholder="Ej. Ingreso por Guía de remisión #4582"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="bg-background border-border/40 h-9 rounded-xl text-xs"
          />
        </div>

        {/* Banner de Aviso */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <IconAlertTriangle className="size-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Este movimiento actualizará el stock inmediatamente en la sede de{" "}
            <strong>{variante?.sede?.nombre}</strong>.
          </p>
        </div>

        {/* Guía de Atajos de Teclado */}
        <FormKeyboardHelpBar />

        {/* Acciones */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/30">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="rounded-xl px-5 h-10 font-semibold text-xs border-border/40 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleAdjust}
            disabled={isPending}
            className="rounded-xl px-6 h-10 font-semibold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 gap-2 min-w-[160px] cursor-pointer"
          >
            {isPending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <IconDeviceFloppy className="size-4" />
                <span>Confirmar Ajuste</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </FormModal>
  );
}
