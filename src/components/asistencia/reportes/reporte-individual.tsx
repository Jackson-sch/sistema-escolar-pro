"use client"

import { IconCalendar, IconCircleFilled, IconLoader2 } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MESES_OPTIONS } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface ReporteIndividualProps {
  data: any[]
  estudianteNombre: string
  isPending: boolean
}

export function ReporteIndividual({ data, estudianteNombre, isPending }: ReporteIndividualProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <IconLoader2 className="h-10 w-10 animate-spin text-primary relative" />
        </div>
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Recuperando historial académico...</span>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-card p-6 rounded-2xl border border-border shadow-2xl">
            <IconCalendar className="w-14 h-14 text-primary/60" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Historial Vacío</h2>
        <p className="max-w-[380px] text-center text-muted-foreground">
          Seleccione un estudiante válido para visualizar la analítica de asistencia y puntualidad anual.
        </p>
      </div>
    )
  }

  const totales = data.reduce((acc, curr) => ({
    P: acc.P + curr.presentes,
    F: acc.F + curr.ausentes,
    T: acc.T + curr.tardanzas,
    J: acc.J + curr.justificadas
  }), { P: 0, F: 0, T: 0, J: 0 })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-card/30 border border-border/40 rounded-2xl p-8 backdrop-blur-sm shadow-xs">
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-primary/60">Análisis Individual</span>
          <h3 className="text-3xl font-bold tracking-tighter capitalize leading-tight max-w-[400px]">
            {estudianteNombre.toLowerCase()}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">Reporte consolidado de asistencia — Periodo Actual</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-background/50 p-2 rounded-2xl border border-border/40">
          {[
            { label: 'Asistencias', value: totales.P, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Inasistencias', value: totales.F, color: 'text-red-500', bg: 'bg-red-500/10' },
            { label: 'Tardanzas', value: totales.T, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Justificadas', value: totales.J, color: 'text-sky-500', bg: 'bg-sky-500/10' },
          ].map((stat) => (
            <div key={stat.label} className="text-center min-w-[100px] py-4 px-2 rounded-xl transition-all hover:bg-muted/30">
              <span className={cn("block text-2xl font-bold tracking-tighter", stat.color)}>{stat.value}</span>
              <span className="text-[10px] font-semibold text-muted-foreground/80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between bg-muted/20">
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight">Evolución Cronológica</h3>
            <p className="text-xs text-muted-foreground font-medium">Desglose porcentual por periodos mensuales.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 pl-8 text-[11px] font-semibold text-muted-foreground/80 w-[200px]">Periodo Mensual</TableHead>
                <TableHead className="py-4 text-center text-[11px] font-semibold text-emerald-600">P</TableHead>
                <TableHead className="py-4 text-center text-[11px] font-semibold text-red-600">F</TableHead>
                <TableHead className="py-4 text-center text-[11px] font-semibold text-amber-600">T</TableHead>
                <TableHead className="py-4 text-center text-[11px] font-semibold text-sky-600">J</TableHead>
                <TableHead className="py-4 pr-8 text-right text-[11px] font-semibold text-muted-foreground/80">Tasa de Asistencia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((mesData) => {
                const totalDias = mesData.presentes + mesData.ausentes + mesData.tardanzas + mesData.justificadas
                const tasa = totalDias > 0 ? ((mesData.presentes + mesData.tardanzas + mesData.justificadas) / totalDias) * 100 : 0

                return (
                  <TableRow key={mesData.mes} className="group border-b border-border/20 hover:bg-primary/2 transition-colors">
                    <TableCell className="py-4 pl-8 font-semibold text-xs tracking-tight text-muted-foreground group-hover:text-foreground transition-colors">
                      {MESES_OPTIONS[mesData.mes].nombre}
                    </TableCell>
                    <TableCell className="py-4 text-center font-bold text-xs text-emerald-600">{mesData.presentes}</TableCell>
                    <TableCell className="py-4 text-center font-bold text-xs text-red-600">{mesData.ausentes}</TableCell>
                    <TableCell className="py-4 text-center font-semibold text-xs text-amber-600">{mesData.tardanzas}</TableCell>
                    <TableCell className="py-4 text-center font-semibold text-xs text-sky-600">{mesData.justificadas}</TableCell>
                    <TableCell className="py-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div className="flex-1 max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all duration-1000",
                              tasa > 90 ? "bg-emerald-500" : tasa > 75 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${tasa}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-bold min-w-[45px]",
                          tasa > 90 ? "text-emerald-500" : tasa > 75 ? "text-amber-500" : "text-red-500"
                        )}>
                          {tasa.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
