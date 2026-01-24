"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  IconTrash,
  IconEdit,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SeccionTableType } from "../seccion-table";

// --- Internal Cell Components ---

interface SeccionCellProps {
  seccion: string;
  gradoNombre: string;
  nivelNombre: string;
  anioAcademico: number;
}

function SeccionCell({
  seccion,
  gradoNombre,
  nivelNombre,
  anioAcademico,
}: SeccionCellProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm border border-primary/20 shrink-0">
        {seccion}
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground">
          {gradoNombre} "{seccion}"
        </span>
        <span className="text-xs text-muted-foreground">
          {nivelNombre} • {anioAcademico}
        </span>
      </div>
    </div>
  );
}

interface TutorCellProps {
  tutor: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
  } | null;
}

function TutorCell({ tutor }: TutorCellProps) {
  if (!tutor) {
    return (
      <span className="text-sm text-muted-foreground italic">Sin asignar</span>
    );
  }

  const initials = `${tutor.name[0]}${(tutor.apellidoPaterno || "")[0]}`;

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-7 w-7 border border-border/50">
        <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium uppercase">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium text-foreground capitalize">
        {tutor.name} {tutor.apellidoPaterno} {tutor.apellidoMaterno}
      </span>
    </div>
  );
}

interface CapacidadCellProps {
  matriculados: number;
  capacidad: number;
}

function CapacidadCell({ matriculados, capacidad }: CapacidadCellProps) {
  const current = matriculados || 0;
  const max = capacidad || 1;
  const percentage = Math.min((current / max) * 100, 100);
  const isFull = current >= max;

  return (
    <div className="flex flex-col gap-1.5 w-28 text-left">
      <div className="flex items-center justify-between text-[11px] font-semibold">
        <div className="flex items-center gap-1.5 text-muted-foreground text-left">
          <IconUsers className="size-3.5" />
          <span>Alumnos</span>
        </div>
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-md",
            isFull
              ? "bg-red-500/10 text-red-500"
              : "bg-primary/10 text-primary",
          )}
        >
          {current} / {max}
        </span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-px border border-border/50">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-in-out",
            isFull
              ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
              : "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]",
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// --- Column Definitions ---

interface GetColumnsProps {
  onEdit: (seccion: SeccionTableType) => void;
  onDelete: (seccion: SeccionTableType) => void;
}

export const getSeccionColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<SeccionTableType>[] => [
  {
    id: "seccion",
    accessorKey: "seccion",
    header: "Sección",
    cell: ({ row }) => {
      const s = row.original;
      return (
        <SeccionCell
          seccion={s.seccion}
          gradoNombre={s.grado.nombre}
          nivelNombre={s.nivel.nombre}
          anioAcademico={s.anioAcademico}
        />
      );
    },
  },
  {
    id: "nivel",
    accessorFn: (row) => row.nivel.nombre,
    header: "Nivel",
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value === "ALL" || row.getValue(id) === value;
    },
    cell: () => null,
  },
  {
    id: "grado",
    accessorFn: (row) => row.grado.nombre,
    header: "Grado",
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value === "ALL" || row.getValue(id) === value;
    },
    cell: () => null,
  },
  {
    id: "tutor",
    header: "Tutor",
    cell: ({ row }) => <TutorCell tutor={row.original.tutor} />,
  },
  {
    accessorKey: "turno",
    id: "turno",
    header: "Turno",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-medium bg-slate-50/50">
        {row.original.turno}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value === "ALL" || row.getValue(id) === value;
    },
  },
  {
    id: "capacidad",
    header: "Alumnos",
    cell: ({ row }) => (
      <CapacidadCell
        matriculados={row.original._count?.matriculas}
        capacidad={row.original.capacidad}
      />
    ),
  },
  {
    accessorKey: "aulaAsignada",
    header: "Aula",
    cell: ({ row }) => {
      const aula = row.original.aulaAsignada;
      return (
        <div className="flex items-center gap-1.5 text-sm">
          {aula ? (
            <>
              <IconMapPin className="size-3.5 text-muted-foreground" />
              <span className="font-medium text-xs">{aula}</span>
            </>
          ) : (
            <span className="text-muted-foreground italic text-xs">N/A</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors"
          onClick={() => onEdit(row.original)}
          aria-label="Editar sección"
        >
          <IconEdit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => onDelete(row.original)}
          aria-label="Eliminar sección"
        >
          <IconTrash className="size-4" />
        </Button>
      </div>
    ),
  },
];
