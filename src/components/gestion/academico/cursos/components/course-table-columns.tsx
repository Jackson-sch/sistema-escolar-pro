"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  IconBook,
  IconClock,
  IconMapPin
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CourseRowActions } from "./course-row-actions"

export type CourseTableType = {
  id: string
  nombre: string
  codigo: string
  anioAcademico: number
  horasSemanales: number | null
  creditos: number | null
  profesor: {
    id: string
    name: string
    apellidoPaterno: string
    apellidoMaterno: string
  }
  areaCurricular: {
    nombre: string
    color: string | null
  }
  nivelAcademico: {
    seccion: string
    grado: { nombre: string }
    nivel: { nombre: string }
  }
}

export const columns: ColumnDef<CourseTableType>[] = [
  {
    accessorKey: "nombre",
    header: "Curso / Asignatura",
    cell: ({ row }) => {
      const course = row.original
      const areaColor = course.areaCurricular.color || "hsl(var(--primary))"
      
      return (
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-lg flex items-center justify-center border bg-background/50 shadow-sm shrink-0"
            style={{ 
              backgroundColor: `${areaColor}15`, // 15% opacidad para fondo
              borderColor: `${areaColor}30`,   // 30% opacidad para borde
              color: areaColor
            }}
          >
            <IconBook className="size-4.5" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-tight capitalize">
              {course.nombre}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide mt-0.5">
              {course.areaCurricular.nombre}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: "aula",
    header: "Grado y Sección",
    accessorFn: (row) => `${row.nivelAcademico.nivel.nombre} ${row.nivelAcademico.grado.nombre} ${row.nivelAcademico.seccion}`,
    cell: ({ row }) => {
      const { nivelAcademico } = row.original
      return (
        <div className="flex items-center gap-2">
           <div className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground">
            <IconMapPin className="size-3.5" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              {nivelAcademico.grado.nombre} "{nivelAcademico.seccion}"
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {nivelAcademico.nivel.nombre}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    id: "profesor",
    header: "Docente Asignado",
    accessorFn: (row) => `${row.profesor.name} ${row.profesor.apellidoPaterno}`,
    cell: ({ row }) => {
      const { profesor } = row.original
      const fullName = `${profesor.name} ${profesor.apellidoPaterno} ${profesor.apellidoMaterno}`
      const initials = `${profesor.name[0]}${profesor.apellidoPaterno[0]}`
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-border/50">
            <AvatarFallback className="bg-muted text-foreground font-medium text-xs uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground capitalize">
            {fullName}
          </span>
        </div>
      )
    },
  },
  {
    id: "horas",
    header: "Horas/Sem",
    accessorFn: (row) => row.horasSemanales,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground bg-muted px-2.5 py-1 rounded-full w-fit border border-border/50">
        <IconClock className="size-3.5 text-muted-foreground" strokeWidth={2.5} />
        {row.original.horasSemanales}h
      </div>
    ),
  },
  {
    id: "periodo",
    header: "Periodo",
    accessorFn: (row) => row.anioAcademico,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal whitespace-nowrap">
        {row.original.anioAcademico}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => <CourseRowActions row={row} table={table as any} />,
  },
]