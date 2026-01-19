"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  IconUser,
  IconSchool,
  IconCalendarEvent
} from "@tabler/icons-react"
import { formatDate } from "@/lib/formats"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EnrollmentRowActions } from "./row-actions"

export type EnrollmentTableType = {
  id: string
  anioAcademico: number
  fechaMatricula: Date
  estado: string
  esPrimeraVez: boolean
  esRepitente: boolean
  procedencia: string | null
  observaciones: string | null
  estudiante: {
    id: string
    name: string
    apellidoPaterno: string
    apellidoMaterno: string
    dni: string
    image: string | null
  }
  nivelAcademico: {
    seccion: string
    grado: { nombre: string }
    nivel: { nombre: string }
  }
}

export const columns: ColumnDef<EnrollmentTableType>[] = [
  {
    id: "estudiante",
    header: "Estudiante",
    accessorFn: (row) => `${row.estudiante.name} ${row.estudiante.apellidoPaterno} ${row.estudiante.dni}`,
    cell: ({ row }) => {
      const { estudiante } = row.original
      const fullName = `${estudiante.name} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border shadow-sm">
            <AvatarImage src={estudiante.image || ""} />
            <AvatarFallback className="bg-primary/5 text-primary">
              <IconUser className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-sm leading-none mb-1 text-nowrap">{fullName}</span>
            <span className="text-xs text-muted-foreground">DNI: {estudiante.dni}</span>
          </div>
        </div>
      )
    },
  },
  {
    id: "nivel",
    header: "Grado y Sección",
    accessorFn: (row) => `${row.nivelAcademico.nivel.nombre} ${row.nivelAcademico.grado.nombre}`,
    cell: ({ row }) => {
      const { nivelAcademico } = row.original
      return (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{nivelAcademico.grado.nombre} - "{nivelAcademico.seccion}"</span>
          <span className="text-[10px] text-muted-foreground uppercase font-bold">{nivelAcademico.nivel.nombre}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "anioAcademico",
    header: "Periodo",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-bold text-primary border-primary/20 bg-primary/5">
        AÑO {row.getValue("anioAcademico")}
      </Badge>
    ),
  },
  {
    id: "tipo",
    header: "Tipo",
    cell: ({ row }) => {
      const { esPrimeraVez, esRepitente } = row.original
      if (esRepitente) return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200">Repitente</Badge>
      if (esPrimeraVez) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Nuevo Ingreso</Badge>
      return <Badge variant="secondary">Regular</Badge>
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string
      const colors: any = {
        activo: "bg-green-500",
        retirado: "bg-red-500",
        suspendido: "bg-yellow-500",
        egresado: "bg-blue-500"
      }
      return (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${colors[estado] || "bg-gray-400"}`} />
          <span className="capitalize text-sm font-medium">{estado}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "fechaMatricula",
    header: "Fecha Matrícula",
    cell: ({ row }) => (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <IconCalendarEvent className="size-3" />
        {formatDate(row.getValue("fechaMatricula"))}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <EnrollmentRowActions
        row={row}
        institucion={(table.options.meta as any)?.institucion}
      />
    ),
  },
]
