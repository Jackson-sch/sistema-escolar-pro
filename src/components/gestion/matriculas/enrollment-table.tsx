"use client"

import * as React from "react"
import { useEffect } from "react"
import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EnrollmentTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
}

export function EnrollmentTable<TData, TValue>({
  columns,
  data,
  meta,
}: EnrollmentTableProps<TData, TValue>) {
  const currentYear = new Date().getFullYear()

  // Estados con nuqs (persistidos en URL)
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    parseAsString.withDefault("")
  )
  const [anioFilter, setAnioFilter] = useQueryState(
    "anio",
    parseAsInteger.withDefault(currentYear)
  )
  const [estadoFilter, setEstadoFilter] = useQueryState(
    "estado",
    parseAsString.withDefault("ALL")
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="estudiante"
      searchPlaceholder="Buscar por DNI o nombre..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      meta={meta}
    >
      {(table: any) => {
        // Sincronizar filtros de URL con filtros de columna
        useEffect(() => {
          table.getColumn("anioAcademico")?.setFilterValue(anioFilter)
        }, [anioFilter])

        useEffect(() => {
          table.getColumn("estado")?.setFilterValue(estadoFilter === "ALL" ? "" : estadoFilter)
        }, [estadoFilter])

        return (
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <Button
                variant={anioFilter === currentYear ? "secondary" : "ghost"}
                onClick={() => setAnioFilter(currentYear)}
                className="h-8 text-xs font-bold"
              >
                {currentYear}
              </Button>
              <Button
                variant={anioFilter === currentYear + 1 ? "secondary" : "ghost"}
                onClick={() => setAnioFilter(currentYear + 1)}
                className="h-8 text-xs font-bold"
              >
                {currentYear + 1}
              </Button>
            </div>

            <Select
              value={estadoFilter}
              onValueChange={setEstadoFilter}
            >
              <SelectTrigger className="w-[140px] h-10 bg-background border-primary/10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="retirado">Retirado</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="egresado">Egresado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )
      }}
    </DataTable>
  )
}
