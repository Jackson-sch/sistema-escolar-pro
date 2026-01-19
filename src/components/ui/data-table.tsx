"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconSearch,
  IconX,
  IconAdjustmentsHorizontal,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconTrash,
  IconFilterOff,
} from "@tabler/icons-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  searchValue?: string // External controlled search value (for nuqs)
  onSearchChange?: (value: string) => void // External search change handler
  onClearFilters?: () => void // External callback when filters are cleared (for nuqs)
  hasActiveFilters?: boolean // Whether external filters are active (for nuqs)
  children?: React.ReactNode | ((table: any) => React.ReactNode) // Support for render props
  initialState?: any // Initial state for the table (column visibility, etc)
  meta?: any // Extra context for columns
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
  children,
  initialState,
  meta
}: DataTableProps<TData, TValue>) {

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialState?.columnVisibility || {})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
      ...initialState
    },
    meta
  })

  return (
    <div className="space-y-4">
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-3 w-full">
          {searchKey && (
            <InputGroup className="flex-1 w-full sm:max-w-xs bg-background border-primary/10 shadow-none">
              <InputGroupAddon>
                <IconSearch className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder={searchPlaceholder}
                value={searchValue !== undefined
                  ? searchValue
                  : (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) => {
                  const value = event.target.value
                  if (onSearchChange) {
                    onSearchChange(value)
                  }
                  table.getColumn(searchKey)?.setFilterValue(value)
                }}
                className="h-9 w-full text-sm"
              />
              <InputGroupAddon align="inline-end" className="text-[10px] uppercase font-bold opacity-50 hidden sm:flex">
                {table.getFilteredRowModel().rows.length} res
              </InputGroupAddon>
            </InputGroup>
          )}
          <div className="flex items-center gap-2">
            {typeof children === "function" ? children(table) : children}
            {(table.getState().columnFilters.length > 0 || hasActiveFilters) && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  table.resetColumnFilters()
                  onClearFilters?.()
                }}
                className="shrink-0"
                title="Limpiar filtros"
              >
                <IconFilterOff className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto hidden lg:flex"
              >
                <IconAdjustmentsHorizontal className="mr-2 h-4 w-4" />
                Columnas
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Alternar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border-2 border-primary/5 bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-primary/5">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-2 border-primary/5">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "h-12 font-bold text-primary/80 py-3 uppercase text-[11px] tracking-wider transition-colors",
                        header.column.getCanSort() && "cursor-pointer select-none hover:bg-primary/5 hover:text-primary"
                      )}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center gap-2">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="shrink-0">
                              {{
                                asc: <IconSortAscending className="h-3.5 w-3.5 text-primary" />,
                                desc: <IconSortDescending className="h-3.5 w-3.5 text-primary" />,
                              }[header.column.getIsSorted() as string] ?? (
                                  <IconArrowsSort className="h-3.5 w-3.5 opacity-20" />
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-primary/5 transition-colors border-b last:border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-40 text-center text-muted-foreground animate-pulse font-medium"
                >
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground font-medium">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} fila(s) seleccionadas.
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-8">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium whitespace-nowrap">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value))
              }}
            >
              <SelectTrigger className="h-8 w-[70px] border-primary/10">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-primary/10"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la primera página</span>
              <IconChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-primary/10"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0 border-primary/10"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la siguiente página</span>
              <IconChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex border-primary/10"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Ir a la última página</span>
              <IconChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
