"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table"

interface AreaTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: any
}

export function AreaTable<TData, TValue>({
  columns,
  data,
  meta,
}: AreaTableProps<TData, TValue>) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="nombre"
      searchPlaceholder="Buscar por nombre o código..."
      meta={meta}
    />
  )
}
