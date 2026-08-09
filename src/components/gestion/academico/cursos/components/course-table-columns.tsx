"use client";

import { ColumnDef } from "@tanstack/react-table";
import { IconBook, IconClock, IconMapPin } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CourseRowActions } from "./course-row-actions";
import { InlineTeacherSelect } from "./inline-teacher-select";

export type CourseTableType = {
  id: string;
  nombre: string;
  codigo: string;
  anioAcademico: number;
  horasSemanales: number | null;
  creditos: number | null;
  areaCurricularId: string;
  nivelAcademicoId: string;
  profesorId: string | null;
  profesor: {
    id: string;
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    image: string;
  } | null;
  areaCurricular: {
    id: string;
    nombre: string;
    color: string | null;
  };
  nivelAcademico: {
    id: string;
    seccion: string;
    grado: { nombre: string };
    nivel: { nombre: string };
  };
};

const ColHeader = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-bold uppercase text-muted-foreground">
    {children}
  </span>
);

export const columns: ColumnDef<CourseTableType>[] = [
  /* ── Curso / Área ── */
  {
    id: "area",
    accessorFn: (row) => row.areaCurricular.nombre,
    header: () => <ColHeader>Curso / Área</ColHeader>,
    size: 250,
    cell: ({ row }) => {
      const course = row.original;
      const areaColor = course.areaCurricular.color || "hsl(var(--primary))";

      return (
        <div className="flex items-center gap-3 py-0.5">
          <div
            className="size-8 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              backgroundColor: `${areaColor}18`,
              borderColor: `${areaColor}30`,
              color: areaColor,
            }}
          >
            <IconBook className="size-4" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm text-foreground leading-snug capitalize truncate">
              {course.nombre}
            </span>
            <span className="text-[11px] text-muted-foreground truncate mt-0.5"
              style={{ color: `${areaColor}99` }}
            >
              {course.areaCurricular.nombre}
            </span>
          </div>
        </div>
      );
    },
  },

  /* ── Grado y Sección ── */
  {
    id: "aula",
    accessorFn: (row) =>
      `${row.nivelAcademico.nivel.nombre} ${row.nivelAcademico.grado.nombre} ${row.nivelAcademico.seccion}`,
    header: () => <ColHeader>Grado y Sección</ColHeader>,
    size: 180,
    cell: ({ row }) => {
      const { nivelAcademico } = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center shrink-0">
            <IconMapPin className="size-3.5 text-muted-foreground" strokeWidth={2} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-foreground leading-snug">
              {nivelAcademico.grado.nombre}{" "}
              <span className="text-muted-foreground font-medium">
                &quot;{nivelAcademico.seccion}&quot;
              </span>
            </span>
            <span className="text-[11px] text-muted-foreground capitalize">
              {nivelAcademico.nivel.nombre}
            </span>
          </div>
        </div>
      );
    },
  },

  /* ── Docente ── */
  {
    id: "profesor",
    accessorFn: (row) =>
      `${row.profesor?.name || "N/A"} ${row.profesor?.apellidoPaterno || ""}`.trim(),
    header: () => <ColHeader>Docente Asignado</ColHeader>,
    size: 220,
    cell: ({ row, table }) => {
      const course = row.original;
      const meta = table.options.meta as any;
      return (
        <InlineTeacherSelect
          courseId={course.id}
          currentProfesorId={course.profesorId}
          currentProfesor={course.profesor}
          profesores={meta?.profesores || []}
        />
      );
    },
  },

  /* ── Horas/Sem ── */
  {
    id: "horas",
    accessorFn: (row) => row.horasSemanales,
    header: () => <ColHeader>Hrs/Sem</ColHeader>,
    size: 80,
    cell: ({ row }) => {
      const horas = row.original.horasSemanales;
      return (
        <Badge
          variant="outline"
          className="gap-1.5 font-semibold text-[11px] border-border/60 px-2 py-0.5 rounded-md w-fit"
        >
          <IconClock className="size-3 text-muted-foreground" strokeWidth={2.5} />
          {horas ?? "—"}h
        </Badge>
      );
    },
  },

  /* ── Periodo ── */
  {
    id: "periodo",
    accessorFn: (row) => String(row.anioAcademico),
    header: () => <ColHeader>Periodo</ColHeader>,
    size: 100,
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="text-[11px] font-semibold px-2 py-0.5 rounded-md border-primary/25 text-primary bg-primary/5"
      >
        {row.original.anioAcademico}
      </Badge>
    ),
  },

  /* ── Actions ── */
  {
    id: "actions",
    header: () => <ColHeader>Acciones</ColHeader>,
    size: 110,
    cell: ({ row, table }) => (
      <CourseRowActions row={row} table={table as any} />
    ),
  },

  /* ── Hidden filter columns ── */
  {
    id: "aulaId",
    accessorFn: (row) => row.nivelAcademico.id || row.nivelAcademicoId,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
  },
  {
    id: "profesorId",
    accessorFn: (row) => row.profesor?.id || row.profesorId || "unassigned",
    header: "",
    cell: () => null,
    enableColumnFilter: true,
  },
  {
    id: "areaId",
    accessorFn: (row) => row.areaCurricular.id || row.areaCurricularId,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
  },
  {
    id: "nombre",
    accessorFn: (row) => row.nombre,
    header: "",
    cell: () => null,
    enableColumnFilter: true,
  },
];