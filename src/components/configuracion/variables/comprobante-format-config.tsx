"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IconFile, IconReceipt, IconCheck } from "@tabler/icons-react";
import { upsertVariableAction } from "@/actions/variables";
import {
  FORMATO_COMPROBANTE_KEY,
  type FormatoComprobante,
} from "@/lib/comprobante-constants";
import { Card } from "@/components/ui/card";

interface ComprobanteFormatConfigProps {
  currentValue?: string;
}

const FORMATS: {
  id: FormatoComprobante;
  label: string;
  description: string;
  icon: typeof IconFile;
  preview: string;
}[] = [
  {
    id: "A4",
    label: "Hoja A4 Estandarizada",
    description: "Formato de hoja completa para impresoras láser o inyección de tinta",
    icon: IconFile,
    preview: "210 × 297 mm",
  },
  {
    id: "TICKET",
    label: "Ticket 80mm POS",
    description: "Formato de tira continua compacto para impresoras térmicas de caja",
    icon: IconReceipt,
    preview: "80mm × auto",
  },
];

export function ComprobanteFormatConfig({
  currentValue = "A4",
}: ComprobanteFormatConfigProps) {
  const [selected, setSelected] = React.useState<FormatoComprobante>(
    (currentValue as FormatoComprobante) || "A4",
  );
  const [saving, setSaving] = React.useState(false);

  const handleSelect = async (formato: FormatoComprobante) => {
    if (formato === selected) return;

    setSelected(formato);
    setSaving(true);

    try {
      const result = await upsertVariableAction({
        clave: FORMATO_COMPROBANTE_KEY,
        valor: formato,
        tipo: "string",
        descripcion: "Formato de impresión para comprobantes de pago",
        seccion: "finanzas",
      });

      if (result.data) {
        toast.success(
          `Formato de comprobante actualizado a: ${formato === "A4" ? "Hoja A4" : "Ticket 80mm"}`,
        );
      } else {
        toast.error(result.error || "Error al guardar la configuración");
        setSelected(selected);
      }
    } catch {
      toast.error("Error inesperado al guardar el formato");
      setSelected(selected);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-border/40 bg-card/80 shadow-xl p-5 space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <IconReceipt className="size-4 text-emerald-500" />
          Formato de Impresión de Comprobantes de Pago
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Selecciona el formato predeterminado en el que se generarán los recibos al procesar cobros y ventas.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.id}
            type="button"
            disabled={saving}
            onClick={() => handleSelect(fmt.id)}
            className={cn(
              "relative flex items-start gap-3 p-4 rounded-xl border transition-[background-color,border-color,box-shadow,opacity] text-left group cursor-pointer bg-background/50",
              selected === fmt.id
                ? "border-emerald-500/60 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "border-border/40 hover:border-emerald-500/30 hover:bg-background/80",
              saving && "opacity-50 pointer-events-none",
            )}
          >
            {/* Checkmark */}
            {selected === fmt.id && (
              <div className="absolute top-3 right-3 size-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-xs">
                <IconCheck className="size-3 text-white" strokeWidth={3} />
              </div>
            )}

            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors border",
                selected === fmt.id
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-muted/30 border-border/30 text-muted-foreground group-hover:text-emerald-500",
              )}
            >
              <fmt.icon className="size-5" />
            </div>

            <div className="min-w-0 pr-4">
              <p className="text-xs font-bold text-foreground">
                {fmt.label}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                {fmt.description}
              </p>
              <span className="inline-block mt-2 text-[10px] font-mono bg-muted/40 px-2 py-0.5 rounded-md text-muted-foreground border border-border/30">
                {fmt.preview}
              </span>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
