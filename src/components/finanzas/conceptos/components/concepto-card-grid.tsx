"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formats";
import {
  IconEdit,
  IconTrash,
  IconClock,
  IconReceipt,
  IconSchool,
  IconCertificate,
  IconShirt,
} from "@tabler/icons-react";
import { ConceptoTableType } from "../concepto-columns";

interface ConceptoCardGridProps {
  conceptos: ConceptoTableType[];
  onEdit: (concepto: ConceptoTableType) => void;
  onDelete: (concepto: ConceptoTableType) => void;
  onToggleActivo: (concepto: ConceptoTableType, activo: boolean) => void;
}

function getCategoryMeta(nombre: string) {
  if (/pensi[oó]n/i.test(nombre)) {
    return {
      label: "Pensión Escolar",
      icon: IconSchool,
      color: "text-blue-600 bg-blue-500/10 border-blue-500/20",
    };
  }
  if (/matr[ií]cula/i.test(nombre)) {
    return {
      label: "Matrícula & Admisión",
      icon: IconReceipt,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
    };
  }
  if (/constancia|certificado|carnet/i.test(nombre)) {
    return {
      label: "Trámites & Certificados",
      icon: IconCertificate,
      color: "text-violet-600 bg-violet-500/10 border-violet-500/20",
    };
  }
  if (/uniforme|taller/i.test(nombre)) {
    return {
      label: "Uniformes & Talleres",
      icon: IconShirt,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/20",
    };
  }
  return {
    label: "Cobro General",
    icon: IconReceipt,
    color: "text-slate-600 bg-slate-500/10 border-slate-500/20",
  };
}

export function ConceptoCardGrid({
  conceptos,
  onEdit,
  onDelete,
  onToggleActivo,
}: ConceptoCardGridProps) {
  if (conceptos.length === 0) {
    return (
      <Card className="rounded-2xl border border-dashed border-border/60 bg-card p-12 text-center shadow-xs">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <IconReceipt className="size-6" />
        </div>
        <h4 className="text-sm font-bold text-foreground">
          No se encontraron conceptos
        </h4>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          Crea un nuevo concepto o aplica las plantillas predeterminadas para comenzar.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {conceptos.map((concepto) => {
        const cat = getCategoryMeta(concepto.nombre);
        const CatIcon = cat.icon;

        return (
          <Card
            key={concepto.id}
            className={`bg-card border rounded-2xl shadow-xs transition-all duration-300 overflow-hidden flex flex-col justify-between ${
              concepto.activo
                ? "border-border/60 hover:shadow-md hover:border-primary/30"
                : "border-border/30 opacity-75 bg-muted/10"
            }`}
          >
            <CardContent className="p-5 space-y-3.5">
              {/* Header de la tarjeta con Switch */}
              <div className="flex items-start justify-between gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cat.color}`}
                >
                  <CatIcon size={12} />
                  <span>{cat.label}</span>
                </Badge>

                <div className="flex items-center gap-1.5">
                  <Switch
                    checked={concepto.activo}
                    onCheckedChange={(checked) =>
                      onToggleActivo(concepto, checked)
                    }
                    className="scale-75 cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {concepto.activo ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              {/* Nombre y Monto */}
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground line-clamp-1">
                  {concepto.nombre}
                </h4>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-primary">
                    {formatCurrency(concepto.montoSugerido)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">
                    {concepto.moneda || "PEN"}
                  </span>
                </div>
              </div>

              {/* Mora Diaria & Parámetros */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <IconClock size={14} className="text-amber-500" />
                  <span className="text-[11px] font-medium">
                    {concepto.moraDiaria && concepto.moraDiaria > 0
                      ? `Mora: S/ ${Number(concepto.moraDiaria).toFixed(2)} / día`
                      : "Sin mora"}
                  </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(concepto)}
                    aria-label={`Editar concepto ${concepto.nombre}`}
                    className="size-7 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-500/10 cursor-pointer"
                  >
                    <IconEdit className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(concepto)}
                    aria-label={`Eliminar concepto ${concepto.nombre}`}
                    className="size-7 rounded-lg text-destructive hover:bg-destructive/10 cursor-pointer"
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
