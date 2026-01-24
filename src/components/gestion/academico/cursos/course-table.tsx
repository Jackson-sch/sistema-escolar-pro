"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CourseTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
}

export function CourseTable<TData, TValue>({
  columns,
  data,
  meta,
}: CourseTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar curso, docente..."
      meta={meta}
    >
      {(table) => (
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <Select onValueChange={(v) => table.getColumn("aula")?.setFilterValue(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background rounded-full">
              <SelectValue placeholder="Grado/Sección" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas las Aulas</SelectItem>
              {meta?.nivelesAcademicos?.map((n: any) => (
                <SelectItem key={n.id} value={`${n.nivel.nombre} ${n.grado.nombre} ${n.seccion}`}>
                  {n.nivel.nombre} - {n.grado.nombre} "{n.seccion}"
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </DataTable>
  )
}
