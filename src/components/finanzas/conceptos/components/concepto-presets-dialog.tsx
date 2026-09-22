"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { IconSparkles, IconLoader2 } from "@tabler/icons-react";
import { createBatchConceptosAction } from "@/actions/finance";
import { formatCurrency } from "@/lib/formats";

const PRESET_CONCEPTOS = [
  {
    nombre: "Matrícula Anual 2026",
    montoSugerido: 450,
    moraDiaria: 0,
    moneda: "PEN",
    descripcion: "Cuota única de matrícula por año escolar",
  },
  {
    nombre: "Pensión Escolar Mensual",
    montoSugerido: 450,
    moraDiaria: 1.5,
    moneda: "PEN",
    descripcion: "Cuota ordinaria mensual (Marzo a Diciembre)",
  },
  {
    nombre: "Cuota APAFA / Familias",
    montoSugerido: 80,
    moraDiaria: 0,
    moneda: "PEN",
    descripcion: "Aporte anual de la Asociación de Padres de Familia",
  },
  {
    nombre: "Emisión de Carnet Escolar",
    montoSugerido: 25,
    moraDiaria: 0,
    moneda: "PEN",
    descripcion: "Carnet oficial de identificación con código QR",
  },
  {
    nombre: "Constancia de Matrícula / Estudios",
    montoSugerido: 30,
    moraDiaria: 0,
    moneda: "PEN",
    descripcion: "Trámite administrativo de constancia oficial MINEDU",
  },
];

interface ConceptoPresetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institucionId?: string;
  onSuccess?: () => void;
}

export function ConceptoPresetsDialog({
  open,
  onOpenChange,
  onSuccess,
}: ConceptoPresetsDialogProps) {
  const router = useRouter();
  const [selectedIndices, setSelectedIndices] = useState<number[]>([
    0, 1, 2, 3, 4,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const handleApplyPresets = async () => {
    if (selectedIndices.length === 0) {
      toast.error("Seleccione al menos un concepto de la plantilla.");
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedPresets = selectedIndices.map((idx) => {
        const p = PRESET_CONCEPTOS[idx];
        return {
          nombre: p.nombre,
          descripcion: p.descripcion,
          montoSugerido: p.montoSugerido,
          moraDiaria: p.moraDiaria,
          moneda: p.moneda,
          activo: true,
        };
      });

      const res = await createBatchConceptosAction({
        conceptos: selectedPresets,
      });

      if (res?.success) {
        toast.success(res.success as string);
        onOpenChange(false);
        router.refresh();
        onSuccess?.();
      } else if (res?.error) {
        toast.error(res.error);
      }
    } catch {
      toast.error("Error al aplicar las plantillas de conceptos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl p-6 bg-card border-border/60">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <IconSparkles size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-black text-foreground">
                Plantillas de Conceptos Escolares
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Selecciona los conceptos estándar para añadirlos al catálogo en 1 clic.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {PRESET_CONCEPTOS.map((p, idx) => {
            const isChecked = selectedIndices.includes(idx);

            return (
              <label
                key={p.nombre}
                className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleIndex(idx)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground truncate">
                      {p.nombre}
                    </p>
                    <span className="text-xs font-mono font-black text-primary">
                      {formatCurrency(p.montoSugerido)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {p.descripcion}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-xl text-xs"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isSubmitting || selectedIndices.length === 0}
            onClick={handleApplyPresets}
            className="h-9 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-primary text-primary-foreground"
          >
            {isSubmitting ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconSparkles className="size-4" />
            )}
            <span>Crear Seleccionados ({selectedIndices.length})</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
