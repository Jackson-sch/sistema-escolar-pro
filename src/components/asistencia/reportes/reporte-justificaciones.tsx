"use client"

import { format } from "date-fns"
import { es } from "date-fns/locale"
import { IconFileCheck, IconLoader2, IconCalendar } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ReporteJustificacionesProps {
  justificaciones: any[]
  isPending: boolean
}

export function ReporteJustificaciones({ justificaciones, isPending }: ReporteJustificacionesProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <IconLoader2 className="h-10 w-10 animate-spin text-primary relative" />
        </div>
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Recuperando registros...</span>
      </div>
    )
  }

  if (justificaciones.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-sky-500/20 blur-3xl rounded-full" />
          <div className="relative bg-card p-6 rounded-2xl border border-border shadow-2xl">
            <IconFileCheck className="w-14 h-14 text-sky-500/60" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Sin Justificaciones</h2>
        <p className="max-w-[380px] text-center text-muted-foreground">
          No se han registrado inasistencias justificadas en el periodo o sección seleccionada.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight">Historial de Justificaciones</h3>
            <p className="text-xs text-muted-foreground font-medium">Registro detallado de motivos de inasistencia.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 pl-8 text-[11px] font-semibold text-muted-foreground/80 w-[150px]">Fecha</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold text-muted-foreground/80 w-[250px]">Estudiante</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold text-muted-foreground/80 w-[180px]">Sección</TableHead>
                <TableHead className="py-4 pr-8 text-[11px] font-semibold text-muted-foreground/80">Motivo / Observación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {justificaciones.map((item) => (
                <TableRow key={item.id} className="group border-b border-border/20 hover:bg-primary/2 transition-colors">
                  <TableCell className="py-5 pl-8">
                    <div className="flex items-center gap-2">
                      <IconCalendar className="size-3.5 text-primary/60" />
                      <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
                        {format(new Date(item.fecha), "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-sm font-semibold tracking-tight text-foreground/90">{item.estudiante}</span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground/80 border border-border/50">
                      {item.seccion}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 pr-8">
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                      {item.justificacion}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
