"use client"

import { useState } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import {
  IconClipboardList,
  IconTrash,
  IconNotes,
  IconCalendar,
  IconPercentage,
  IconSchool,
  IconTarget
} from "@tabler/icons-react"
import { toast } from "sonner"

import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConfirmModal } from "@/components/modals/confirm-modal"
import { deleteEvaluacionAction } from "@/actions/evaluations"
import { formatDate } from "@/lib/formats"
import { EditEvaluacionButton } from "./edit-evaluacion-button"
import { useQueryState, parseAsString } from "nuqs"
import { useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type EvaluacionTableType = {
  id: string
  nombre: string
  descripcion: string | null
  fecha: string
  peso: number
  activa: boolean
  tipoEvaluacion: { id: string; nombre: string }
  curso: {
    id: string
    nombre: string
    areaCurricular: { nombre: string; color: string | null }
    nivelAcademico: { seccion: string; grado: { nombre: string } }
  }
  periodo: { id: string; nombre: string }
  capacidad: {
    id: string;
    nombre: string;
    competencia: { nombre: string }
  } | null
  _count: { notas: number }
}

interface EvaluacionTableProps {
  data: EvaluacionTableType[]
  meta?: any
}

export function EvaluacionTable({ data, meta }: EvaluacionTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<EvaluacionTableType | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados para filtros con nuqs (persistidos en URL)
  const [cursoId, setCursoId] = useQueryState("cursoId", parseAsString)
  const [tipoId, setTipoId] = useQueryState("tipoId", parseAsString)
  const [periodoId, setPeriodoId] = useQueryState("periodoId", parseAsString)
  const [searchQuery, setSearchQuery] = useQueryState("nombre", parseAsString.withDefault(""))

  const hasActiveFilters = !!cursoId || !!tipoId || !!periodoId || !!searchQuery

  const clearFilters = () => {
    setCursoId(null)
    setTipoId(null)
    setPeriodoId(null)
    setSearchQuery("")
  }

  const columns: ColumnDef<EvaluacionTableType>[] = [
    {
      accessorKey: "nombre",
      header: "Evaluación",
      cell: ({ row }) => {
        const { tipoEvaluacion } = row.original
        return (
          <div className="flex items-start gap-3 min-w-[180px]">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <IconClipboardList className="size-4 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-sm text-foreground leading-tight">
                {row.original.nombre}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {tipoEvaluacion.nombre}
              </span>
              {row.original.capacidad && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-violet-600 bg-violet-600/10 px-1.5 py-0.5 rounded border border-violet-600/20 max-w-fit">
                  <IconTarget className="size-2.5" />
                  <span className="truncate max-w-[150px] uppercase tracking-tighter">
                    {row.original.capacidad.competencia.nombre}: {row.original.capacidad.nombre}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: "curso",
      header: "Ubicación Académica",
      cell: ({ row }) => {
        const { curso } = row.original
        return (
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-foreground/90">
                {curso.nivelAcademico.grado.nombre} "{curso.nivelAcademico.seccion}"
              </span>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <IconSchool className="size-3" /> {curso.nombre}
            </span>
          </div>
        )
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
      id: "tipoId"
    },
    {
      accessorFn: (row) => row.curso?.id,
      header: "",
      cell: () => null,
      enableColumnFilter: true,
      id: "cursoId"
    },
    {
      accessorFn: (row) => row.periodo?.id,
      header: "",
      cell: () => null,
      enableColumnFilter: true,
      id: "periodoId"
    },
    {
      id: "notas",
      header: "Registros",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original._count.notas > 0 ? (
            <Badge variant="secondary" className="font-medium text-xs">
              {row.original._count.notas} Notas
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground/60 italic px-2">
              Sin registros
            </span>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {/* Botón Principal: Registrar Notas */}
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

          <EditEvaluacionButton
            evaluacion={row.original}
            tipos={meta?.tipos || []}
            periodos={meta?.periodos || []}
            cursos={meta?.cursos || []}
          />

          {/* Botón Secundario: Eliminar */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => {
              setSelectedEvaluacion(row.original)
              setShowDeleteModal(true)
            }}
            title="Eliminar evaluación"
          >
            <IconTrash className="size-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      ),
    },
  ]

  const onConfirm = async () => {
    if (!selectedEvaluacion) return
    setIsDeleting(true)
    try {
      const res = await deleteEvaluacionAction(selectedEvaluacion.id)
      if (res.success) {
        toast.success(res.success)
        setShowDeleteModal(false)
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
        searchPlaceholder="Buscar por nombre..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        onClearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
        meta={meta}
        initialState={{
          columnVisibility: {
            tipoId: false,
            cursoId: false,
            periodoId: false,
          },
        }}
      >
        {(table: any) => {
          // Sincronizar filtros de URL con filtros de columna (TanStack Table)
          useEffect(() => {
            table.getColumn("cursoId")?.setFilterValue(cursoId)
          }, [cursoId])

          useEffect(() => {
            table.getColumn("tipoId")?.setFilterValue(tipoId)
          }, [tipoId])

          useEffect(() => {
            table.getColumn("periodoId")?.setFilterValue(periodoId)
          }, [periodoId])

          return (
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <Select value={cursoId || "all"} onValueChange={(v) => setCursoId(v === "all" ? null : v)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background border-primary/10 text-xs shadow-sm">
                  <div className="flex items-center gap-2 truncate">
                    <IconSchool className="size-3.5 opacity-60 shrink-0" />
                    <SelectValue placeholder="Curso" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Cursos</SelectItem>
                  {meta?.cursos?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre} - {c.nivelAcademico?.seccion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={tipoId || "all"} onValueChange={(v) => setTipoId(v === "all" ? null : v)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background border-primary/10 text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <IconClipboardList className="size-3.5 opacity-60 shrink-0" />
                    <SelectValue placeholder="Tipo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Tipos</SelectItem>
                  {meta?.tipos?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={periodoId || "all"} onValueChange={(v) => setPeriodoId(v === "all" ? null : v)}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 bg-background border-primary/10 text-xs shadow-sm">
                  <div className="flex items-center gap-2">
                    <IconCalendar className="size-3.5 opacity-60 shrink-0" />
                    <SelectValue placeholder="Periodo" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los Periodos</SelectItem>
                  {meta?.periodos?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }}
      </DataTable>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onConfirm}
        loading={isDeleting}
        title="Eliminar Evaluación"
        description={`¿Estás seguro de eliminar la evaluación "${selectedEvaluacion?.nombre}"? Esta acción no se puede deshacer y eliminará todas las calificaciones asociadas.`}
      />
    </>
  )
}