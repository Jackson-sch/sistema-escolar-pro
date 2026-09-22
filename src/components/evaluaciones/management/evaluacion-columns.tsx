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
    size: 380,
    cell: ({ row }) => {
      const { tipoEvaluacion, _count } = row.original;
      const isGraded = _count.notas > 0;
      return (
        <div className="flex items-start gap-3 max-w-[320px] sm:max-w-[380px] lg:max-w-[420px]">
          <div
            className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
              isGraded
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_2px_8px_rgba(16,185,129,0.05)]"
                : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_2px_8px_rgba(245,158,11,0.05)]"
            }`}
          >
            <IconClipboardList className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span
              className="font-bold text-sm text-foreground leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-2 break-words"
              title={row.original.nombre}
            >
              {row.original.nombre}
            </span>
            <span className="text-xs text-muted-foreground font-semibold truncate">
              {tipoEvaluacion.nombre}
            </span>
            {row.original.capacidad && (
              <div
                className="flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-600/10 px-1.5 py-0.5 rounded border border-violet-600/20 max-w-fit truncate"
                title={`${row.original.capacidad.competencia.nombre}: ${row.original.capacidad.nombre}`}
              >
                <IconTarget className="size-2.5 shrink-0" />
                <span className="truncate max-w-[180px] uppercase tracking-tighter">
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
    size: 180,
    cell: ({ row }) => {
      const { curso } = row.original;
      return (
        <div className="flex flex-col gap-1 min-w-[120px] max-w-[180px]">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-sm text-foreground/90 truncate">
              {curso.nivelAcademico.grado.nombre} &quot;
              {curso.nivelAcademico.seccion}&quot;
            </span>
          </div>
          <span
            className="text-xs text-muted-foreground flex items-center gap-1 truncate"
            title={curso.nombre}
          >
            <IconSchool className="size-3 shrink-0" />
            <span className="truncate">{curso.nombre}</span>
          </span>
        </div>
      );
    },
  },
  {
    id: "fecha",
    header: "Fecha",
    size: 120,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        <IconCalendar className="size-3.5 opacity-70 shrink-0" />
        {formatDate(row.original.fecha)}
      </div>
    ),
  },
  {
    accessorKey: "peso",
    header: "Ponderación",
    size: 100,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="bg-primary/5 border-primary/20 text-primary hover:bg-primary/10 gap-1 px-2.5 py-0.5 font-bold text-xs whitespace-nowrap"
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
    accessorFn: (row) =>
      row.curso?.nivelAcademico?.nivel?.id ||
      (row.curso?.nivelAcademico as any)?.nivelId,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "nivelId",
  },
  {
    accessorFn: (row) =>
      row.curso?.nivelAcademico?.grado?.id ||
      (row.curso?.nivelAcademico as any)?.gradoId,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "gradoId",
  },
  {
    accessorFn: (row) => row.curso?.nivelAcademico?.id,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "nivelAcademicoId",
  },
  {
    accessorFn: (row) => `${row.curso?.id}___${row.curso?.nombre}`,
    filterFn: (row, columnId, filterValue) => {
      if (!filterValue) return true;
      const val = row.getValue(columnId) as string;
      if (!val) return false;
      const [id, nombre] = val.split("___");
      if (typeof filterValue === "string" && filterValue.startsWith("name:")) {
        return nombre?.toLowerCase() === filterValue.slice(5).toLowerCase();
      }
      return id === filterValue || nombre?.toLowerCase() === (filterValue as string).toLowerCase();
    },
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
    accessorFn: (row) => (row._count.notas > 0 ? "calificada" : "pendiente"),
    header: "",
    cell: () => null,
    enableColumnFilter: true,
    id: "estadoNotas",
  },
  {
    id: "notas",
    header: "Registros",
    size: 120,
    cell: ({ row }) => (
      <div className="flex items-center whitespace-nowrap">
        {row.original._count.notas > 0 ? (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl font-black text-[9px] uppercase tracking-wider">
            {row.original._count.notas} Notas
          </Badge>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-xl font-black text-[9px] uppercase tracking-wider animate-pulse">
            Pendiente
          </Badge>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 160,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="h-8 px-2.5 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 border-primary/20 shadow-2xs gap-1"
        >
          <Link href={`/evaluaciones/${row.original.id}/notas`}>
            <IconNotes className="size-3.5" />
            <span>Calificar</span>
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
          className="h-8 w-8 rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => { setSelectedEvaluacion(row.original); setShowDeleteModal(true); }}
          title="Eliminar evaluación"
        >
          <IconTrash className="size-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </div>
    ),
  },
];
