"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import {
  IconClipboardList,
  IconTrash,
  IconNotes,
  IconCalendar,
  IconPercentage,
  IconSchool,
  IconTarget,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formats";
import { EvaluacionButton } from "./evaluacion-button";
import { EvaluacionTableType } from "./evaluacion-table";

interface GetEvaluacionColumnsProps {
  meta: any;
  setSelectedEvaluacion: (evaluacion: EvaluacionTableType) => void;
  setShowDeleteModal: (show: boolean) => void;
}

export const getEvaluacionColumns = ({
  meta,
  setSelectedEvaluacion,
  setShowDeleteModal,
}: GetEvaluacionColumnsProps): ColumnDef<EvaluacionTableType>[] => [
  {
    accessorKey: "nombre",
    header: "Evaluación",
    cell: ({ row }) => {
      const { tipoEvaluacion, _count } = row.original;
      const isGraded = _count.notas > 0;
      return (
        <div className="flex items-start gap-3 min-w-[180px]">
          <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
            isGraded 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]" 
              : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.05)]"
          }`}>
            <IconClipboardList className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors duration-200">
              {row.original.nombre}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">
              {tipoEvaluacion.nombre}
            </span>
            {row.original.capacidad && (
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-600 bg-violet-600/10 px-1.5 py-0.5 rounded border border-violet-600/20 max-w-fit">
                <IconTarget className="size-2.5" />
                <span className="truncate max-w-[150px] uppercase tracking-tighter">
                  {row.original.capacidad.competencia.nombre}:{" "}
                  {row.original.capacidad.nombre}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "curso",
    header: "Ubicación Académica",
    cell: ({ row }) => {
      const { curso } = row.original;
      return (
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-sm text-foreground/90">
              {curso.nivelAcademico.grado.nombre} &quot;
              {curso.nivelAcademico.seccion}&quot;
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
            <IconSchool className="size-3" /> {curso.nombre}
          </span>
        </div>
      );
    },
  },
  {
    id: "fecha",
    header: "Fecha",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
        <IconCalendar className="size-4 opacity-70" />
        {formatDate(row.original.fecha)}
      </div>
    ),
  },
  {
    accessorKey: "peso",
    header: "Ponderación",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 gap-1 px-2.5 py-0.5"
      >
        <IconPercentage className="size-3" />
        {row.original.peso}%
      </Badge>
    ),
  },
  {
    accessorFn: (row) => row.tipoEvaluacion?.id,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "tipoId",
  },
  {
    accessorFn: (row) => row.curso?.nivelAcademico?.id,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "nivelAcademicoId",
  },
  {
    accessorFn: (row) => row.curso?.id,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "cursoId",
  },
  {
    accessorFn: (row) => row.periodo?.id,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "periodoId",
  },
  {
    id: "notas",
    header: "Registros",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original._count.notas > 0 ? (
          <Badge className="bg-emerald-500/5 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-[0_2px_8px_rgba(16,185,129,0.03)] transition-[color,background-color,border-color,box-shadow,padding,letter-spacing]">
            {row.original._count.notas} Notas
          </Badge>
        ) : (
          <Badge className="bg-amber-500/5 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-[0_2px_8px_rgba(245,158,11,0.03)] transition-[color,background-color,border-color,box-shadow,padding,letter-spacing] animate-pulse">
            Pendiente
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-medium"
        >
          <Link href={`/evaluaciones/${row.original.id}/notas`}>
            <IconNotes className="size-4 mr-2" />
            Calificar
          </Link>
        </Button>

        <EvaluacionButton
          evaluacion={row.original}
          tipos={meta?.tipos || []}
          periodos={meta?.periodos || []}
          cursos={meta?.cursos || []}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => {
            setSelectedEvaluacion(row.original);
            setShowDeleteModal(true);
          }}
          title="Eliminar evaluación"
        >
          <IconTrash className="size-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>
    ),
  },
];
