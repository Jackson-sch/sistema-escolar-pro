"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface StaffTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
}

export function StaffTable<TData, TValue>({
  columns,
  data,
  meta,
}: StaffTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="personal"
      searchPlaceholder="Nombre, DNI o cargo..."
      meta={meta}
    >
      {(table) => (
        <div className="flex items-center gap-3">
          <Select onValueChange={(v) => table.getColumn("estado")?.setFilterValue(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-10 bg-background border-primary/10">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Cualquier Estado</SelectItem>
              {meta?.estados?.map((e: any) => (
                <SelectItem key={e.id} value={e.nombre}>{e.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => table.getColumn("rol")?.setFilterValue(v === "ALL" ? "" : v)}>
            <SelectTrigger className="w-[140px] h-10 bg-background border-primary/10">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los Roles</SelectItem>
              <SelectItem value="profesor">Profesores</SelectItem>
              <SelectItem value="admin">Administrativos</SelectItem>
              <SelectItem value="director">Directivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </DataTable>
  )
}
