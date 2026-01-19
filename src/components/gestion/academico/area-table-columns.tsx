"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  IconListNumbers,
  IconCircleCheckFilled,
  IconCircleXFilled
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { AreaRowActions } from "./area-row-actions"

export type AreaTableType = {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  orden: number | null
  color: string | null
  activa: boolean
}

export const columns: ColumnDef<AreaTableType>[] = [
  {
    accessorKey: "nombre",
    header: "Área Curricular",
    cell: ({ row }) => {
      const area = row.original
      return (
        <div className="flex items-center gap-3">
          {/* Indicador de Color: Usamos ring-2 ring-background para separarlo del fondo */}
          <div
            className="size-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: area.color || "hsl(var(--muted-foreground))" }}
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-foreground leading-tight">{area.nombre}</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">
              {area.codigo}
            </span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
        {row.getValue("descripcion") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "orden",
    header: "Orden",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full w-fit border border-transparent">
        <IconListNumbers className="size-3.5" strokeWidth={2.5} />
        <span className="text-xs">{row.getValue("orden") || 0}</span>
      </div>
    ),
  },
  {
    accessorKey: "activa",
    header: "Estado",
    cell: ({ row }) => {
      const activa = row.getValue("activa") as boolean
      return activa ? (
        <Badge className="bg-green-600 text-white hover:bg-green-700 border-transparent gap-1.5">
          <IconCircleCheckFilled className="size-3" fill="currentColor" />
          Activa
        </Badge>
      ) : (
        <Badge variant="secondary" className="gap-1.5">
          <IconCircleXFilled className="size-3 text-muted-foreground" />
          Inactiva
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <AreaRowActions row={row} />,
  },
]