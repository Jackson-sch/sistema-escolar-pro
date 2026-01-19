"use client"

import { IconCalendarMonth, IconLoader2, IconUsers } from "@tabler/icons-react"
import { Card } from "@/components/ui/card"

interface ReporteEmptyStateProps {
  type: "initial" | "empty" | "loading"
}

export function ReporteEmptyState({ type }: ReporteEmptyStateProps) {
  if (type === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-3 text-muted-foreground">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm font-medium">Generando reporte...</span>
      </div>
    )
  }

  if (type === "empty") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-6 bg-muted/20/50">
        <div className="rounded-full bg-muted p-4 mb-4">
          <IconUsers className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground">Sin datos para mostrar</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          No se encontraron registros de asistencia para esta sección en el periodo seleccionado.
        </p>
      </div>
    )
  }

  return (
    <Card className="border-dashed border-2 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
      <div className="rounded-full bg-muted p-6 mb-4">
        <IconCalendarMonth className="h-10 w-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">Consulta de Reportes</h3>
        <p className="text-muted-foreground text-sm">
          Selecciona un periodo, mes y sección para visualizar el consolidado mensual de asistencia.
        </p>
      </div>
    </Card>
  )
}
