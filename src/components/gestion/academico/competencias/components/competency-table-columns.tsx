"use client";

import { useState } from "react";
import { ColumnDef, Row } from "@tanstack/react-table";
import { IconTarget, IconEye, IconSparkles } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompetencyRowActions } from "./competency-row-actions";
import { CapacidadesInspectDialog } from "./capacidades-inspect-dialog";

export type CompetencyTableType = {
  id: string;
  nombre: string;
  descripcion: string | null;
  areaCurricularId: string;
  areaCurricular: {
    nombre: string;
    color: string | null;
  };
  capacidades: {
    id: string;
    nombre: string;
    descripcion?: string | null;
  }[];
};

function CapacidadesCell({ row }: { row: Row<CompetencyTableType> }) {
  const [open, setOpen] = useState(false);
  const comp = row.original;
  const capacidades = comp.capacidades;
  const displayCapacidades = capacidades.slice(0, 2);
  const remaining = capacidades.length - 2;

  return (
    <>
      <div className="flex flex-wrap items-center gap-1.5 max-w-[340px]">
        {capacidades.length > 0 ? (
          <>
            {displayCapacidades.map((cap) => (
              <Badge
                key={cap.id}
                variant="secondary"
                className="text-[10px] h-5.5 font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 max-w-[155px] truncate px-2"
                title={cap.nombre}
              >
                {cap.nombre}
              </Badge>
            ))}
            {remaining > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-5.5 px-2 text-[10px] font-extrabold text-foreground bg-muted/60 hover:bg-muted rounded-md border border-border/60 transition-colors cursor-pointer"
              >
                +{remaining} más
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(true)}
                className="h-5.5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-md cursor-pointer gap-1"
                title="Ver detalle de capacidades"
              >
                <IconEye className="size-3" />
                <span>Ver</span>
              </Button>
            )}
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground/50 italic font-medium px-1">
            Sin capacidades
          </span>
        )}
      </div>

      <CapacidadesInspectDialog
        open={open}
        onOpenChange={setOpen}
        competencia={comp}
      />
    </>
  );
}

function CompetenciaNameCell({ row }: { row: Row<CompetencyTableType> }) {
  const [open, setOpen] = useState(false);
  const comp = row.original;
  const areaColor = comp.areaCurricular?.color || "#6366f1";

  return (
    <>
      <div className="flex items-start gap-3 py-1">
        <div
          className="size-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs"
          style={{
            backgroundColor: `${areaColor}15`,
            color: areaColor,
            borderColor: `${areaColor}30`,
          }}
        >
          <IconTarget className="size-4" />
        </div>

        <div className="flex flex-col gap-1 min-w-0 max-w-[460px]">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="text-left font-bold text-xs text-foreground leading-snug hover:text-primary transition-colors cursor-pointer"
            >
              {comp.nombre}
            </button>
            <Badge
              variant="secondary"
              className="h-4.5 px-1.5 text-[9px] font-black bg-primary/10 text-primary border-primary/20 shrink-0"
            >
              {comp.capacidades.length} cap.
            </Badge>
          </div>

          {comp.descripcion ? (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {comp.descripcion}
            </p>
          ) : (
            <p className="text-[10px] text-muted-foreground/50 italic">
              Competencia oficial CNEB MINEDU
            </p>
          )}
        </div>
      </div>

      <CapacidadesInspectDialog
        open={open}
        onOpenChange={setOpen}
        competencia={comp}
      />
    </>
  );
}

export const columns: ColumnDef<CompetencyTableType>[] = [
  {
    accessorKey: "nombre",
    header: "Competencia Curricular",
    cell: ({ row }) => <CompetenciaNameCell row={row} />,
  },
  {
    id: "area",
    header: "Área Curricular",
    cell: ({ row }) => {
      const area = row.original.areaCurricular;
      const color = area.color || "#6366f1";
      return (
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full shadow-xs shrink-0"
            style={{ backgroundColor: color }}
          />
          <Badge
            variant="outline"
            className="text-[10px] font-bold tracking-wide border-border/60"
            style={{
              backgroundColor: `${color}10`,
              color: color,
              borderColor: `${color}30`,
            }}
          >
            {area.nombre}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "capacidades",
    header: "Capacidades CNEB",
    cell: ({ row }) => <CapacidadesCell row={row} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <CompetencyRowActions row={row} />,
  },
];
