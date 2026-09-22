"use client";

import React from "react";
import {
  IconLayoutGrid,
  IconFileText,
  IconCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BatchCardsLayoutSelectorProps {
  layout: "grid8" | "duplex";
  onLayoutChange: (layout: "grid8" | "duplex") => void;
}

export function BatchCardsLayoutSelector({
  layout,
  onLayoutChange,
}: BatchCardsLayoutSelectorProps) {
  return (
    <div className="space-y-2 pt-2 border-t border-border/50">
      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
        <IconLayoutGrid className="size-3.5 text-primary" />
        Formato de Impresión (A4)
      </label>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onLayoutChange("grid8")}
          className={cn(
            "p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative",
            layout === "grid8"
              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 shadow-2xs"
              : "border-border/60 hover:border-border text-muted-foreground"
          )}
        >
          {layout === "grid8" && (
            <div className="absolute top-2 right-2 p-0.5 rounded-full bg-primary text-primary-foreground">
              <IconCheck className="size-3" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <IconLayoutGrid className="size-4 text-primary" />
              8 por Hoja A4
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Ahorro del 50% de papel. QR frontal de 50pt para control rápido de asistencia.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="mt-2 text-[9px] w-fit font-bold bg-primary/10 text-primary border-none"
          >
            Recomendado
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => onLayoutChange("duplex")}
          className={cn(
            "p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative",
            layout === "duplex"
              ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary/40 shadow-2xs"
              : "border-border/60 hover:border-border text-muted-foreground"
          )}
        >
          {layout === "duplex" && (
            <div className="absolute top-2 right-2 p-0.5 rounded-full bg-primary text-primary-foreground">
              <IconCheck className="size-3" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
              <IconFileText className="size-4 text-primary" />
              Plegable (4 por Hoja)
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Anverso y reverso contiguos listos para doblar al centro y plastificar.
            </p>
          </div>
          <Badge
            variant="outline"
            className="mt-2 text-[9px] w-fit font-medium text-muted-foreground"
          >
            Doble Cara
          </Badge>
        </button>
      </div>
    </div>
  );
}
