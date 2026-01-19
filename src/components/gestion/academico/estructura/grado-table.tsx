"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { IconGrain, IconLayersSubtract, IconTrash, IconUsers } from "@tabler/icons-react"
import { toast } from "sonner"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { deleteGradoAction } from "@/actions/academic-structure"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { useState } from "react"

export type GradoTableType = {
  id: string
  nombre: string
  codigo: string
  orden: number
  nivel: { nombre: string }
  _count: { nivelesAcademicos: number }
}

interface GradoTableProps {
  data: GradoTableType[]
  meta?: any
}

export function GradoTable({ data, meta }: GradoTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedGrado, setSelectedGrado] = useState<GradoTableType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const columns: ColumnDef<GradoTableType>[] = [
    {
      accessorKey: "nombre",
      header: "Grado",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {/* Icono con color primario semántico */}
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <IconGrain className="size-5 text-green-500" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground">{row.original.nombre}</span>
            <span className="text-xs text-muted-foreground font-mono">
              {row.original.codigo}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "nivel.nombre",
      header: "Nivel",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-normal">
          {row.original.nivel.nombre}
        </Badge>
      ),
    },
    {
      accessorKey: "orden",
      header: "Orden",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground font-medium">
          #{row.original.orden}
        </span>
      ),
    },
    {
      id: "secciones",
      header: "Secciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center size-6 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {row.original._count.nivelesAcademicos}
          </div>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {row.original._count.nivelesAcademicos === 1 ? 'Sección' : 'Secciones'}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => {
              setSelectedGrado(row.original)
              setShowDeleteModal(true)
            }}
            aria-label={`Eliminar grado ${row.original.nombre}`}
          >
            <IconTrash className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      ),
    },
  ]

  const onConfirm = async () => {
    if (!selectedGrado) return
    setIsDeleting(true)
    try {
      const res = await deleteGradoAction(selectedGrado.id)
      if (res.success) {
        toast.success(res.success)
        setShowDeleteModal(false)
        setSelectedGrado(null) // Limpiar selección
      }
      if (res.error) toast.error(res.error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar grado..."
        meta={meta}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="¿Eliminar Grado?"
        description={`¿Estás seguro de eliminar el grado "${selectedGrado?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </>
  )
}