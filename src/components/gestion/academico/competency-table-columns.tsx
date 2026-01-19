"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconTarget, IconTrash, IconEdit, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompetencyRowActions } from "./competency-row-actions";

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
  }[];
};

export const columns: ColumnDef<CompetencyTableType>[] = [
  {
    accessorKey: "nombre",
    header: "Competencia",
    cell: ({ row }) => {
      const comp = row.original;
      return (
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-violet-600/10 flex items-center justify-center shrink-0 mt-0.5">
            <IconTarget className="size-4 text-violet-600" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground leading-tight uppercase text-[11px]">
                {comp.nombre}
              </span>
              <Badge
                variant="secondary"
                className="h-4 px-1 text-[9px] font-black bg-violet-100 text-violet-700 border-violet-200"
              >
                {comp.capacidades.length}
              </Badge>
            </div>
            {comp.descripcion && (
              <span className="text-[10px] text-muted-foreground line-clamp-1 max-w-[400px]">
                {comp.descripcion}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "area",
    header: "Área Curricular",
    cell: ({ row }) => {
      const area = row.original.areaCurricular;
      return (
        <div className="flex items-center gap-2">
          <div
            className="size-2 rounded-full shadow-sm"
            style={{ backgroundColor: area.color || "gray" }}
          />
          <Badge
            variant="outline"
            className="text-[10px] font-bold uppercase tracking-widest border-primary/10 bg-primary/5"
          >
            {area.nombre}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "capacidades",
    header: "Capacidades Detalladas",
    cell: ({ row }) => {
      const capacidades = row.original.capacidades;
      const displayCapacidades = capacidades.slice(0, 3);
      const remaining = capacidades.length - 3;

      return (
        <div className="flex flex-wrap gap-1.5 max-w-[320px]">
          {capacidades.length > 0 ? (
            <>
              {displayCapacidades.map((cap) => (
                <Badge
                  key={cap.id}
                  variant="secondary"
                  className="text-[9px] h-5 bg-emerald-500/5 text-emerald-600 border-emerald-500/10 hover:bg-emerald-500/10 transition-colors"
                >
                  {cap.nombre}
                </Badge>
              ))}
              {remaining > 0 && (
                <Badge
                  variant="outline"
                  className="text-[9px] h-5 border-dashed"
                >
                  +{remaining} más
                </Badge>
              )}
            </>
          ) : (
            <span className="text-[10px] text-muted-foreground/50 italic font-medium px-1">
              Sin capacidades asociadas
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <CompetencyRowActions row={row} />,
  },
];
