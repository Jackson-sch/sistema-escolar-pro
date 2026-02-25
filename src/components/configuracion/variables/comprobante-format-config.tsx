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
    label: "Hoja A4",
    description: "Formato carta completa, ideal para impresoras láser/tinta",
    icon: IconFile,
    preview: "210 × 297 mm",
  },
  {
    id: "TICKET",
    label: "Ticket 80mm",
    description: "Formato compacto para impresoras térmicas POS",
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
          `Formato cambiado a ${formato === "A4" ? "Hoja A4" : "Ticket 80mm"}`,
        );
      } else {
        toast.error(result.error || "Error al guardar la configuración");
        setSelected(selected);
      }
    } catch {
      toast.error("Error inesperado al guardar");
      setSelected(selected);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <IconReceipt className="size-4 text-emerald-500" />
          Formato de Comprobante de Pago
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Selecciona el formato en el que se generarán los comprobantes de pago
          al momento de cobrar
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
              "relative flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-200 text-left group cursor-pointer",
              selected === fmt.id
                ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                : "border-border hover:border-emerald-500/40 hover:bg-accent/50",
              saving && "opacity-50 pointer-events-none",
            )}
          >
            {/* Checkmark */}
            {selected === fmt.id && (
              <div className="absolute top-2.5 right-2.5 size-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <IconCheck className="size-3 text-white" strokeWidth={3} />
              </div>
            )}

            <div
              className={cn(
                "size-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                selected === fmt.id
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground group-hover:text-emerald-500",
              )}
            >
              <fmt.icon className="size-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {fmt.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {fmt.description}
              </p>
              <span className="inline-block mt-1.5 text-[10px] font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                {fmt.preview}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
