"use client"

import { IconAlertTriangle, IconUser, IconLoader2 } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ReporteAlertasProps {
  alertas: any[]
  isPending: boolean
}

export function ReporteAlertas({ alertas, isPending }: ReporteAlertasProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <IconLoader2 className="h-10 w-10 animate-spin text-primary relative" />
        </div>
        <span className="text-sm font-medium text-muted-foreground animate-pulse">Analizando tasas de deserción...</span>
      </div>
    )
  }

  if (alertas.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/10">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="relative bg-card p-6 rounded-2xl border border-border shadow-2xl">
            <IconUser className="w-14 h-14 text-emerald-500/60" />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-2">Sin Alertas Críticas</h2>
        <p className="max-w-[380px] text-center text-muted-foreground">
          Excelente desempeño institucional. Todos los estudiantes mantienen niveles de asistencia óptimos.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {alertas.slice(0, 3).map((alerta) => (
          <div key={alerta.id} className="relative group overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/2 p-6 transition-all hover:bg-red-500/5 hover:border-red-500/40">
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/20">
                <IconAlertTriangle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold">Riesgo Alto</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight pr-12">{alerta.nombre}</h3>
                <p className="text-[10px] font-semibold text-muted-foreground/80">{alerta.seccion}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] font-medium text-muted-foreground/80">Tasa de Inasistencia</span>
                    <span className="text-2xl font-bold text-red-500 tracking-tighter">{alerta.porcentaje}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold">{alerta.faltas} faltas</span>
                    <span className="block text-[8px] text-muted-foreground">de {alerta.totalDias} días</span>
                  </div>
                </div>
                <Progress
                  value={alerta.porcentaje}
                  className="h-2.5 bg-red-500/10"
                  indicatorClassName="bg-linear-to-r from-red-500 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-border/40 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold tracking-tight">Registro General de Vulnerabilidad</h3>
            <p className="text-xs text-muted-foreground">Monitor de estudiantes con deserción potencial registrada.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 pl-6 text-[11px] font-semibold text-muted-foreground/80">Estudiante</TableHead>
                <TableHead className="py-4 text-[11px] font-semibold text-muted-foreground/80">Sección / Nivel</TableHead>
                <TableHead className="py-4 text-center text-[11px] font-semibold text-muted-foreground/80">Registros</TableHead>
                <TableHead className="py-4 pr-6 text-right text-[11px] font-semibold text-muted-foreground/80">Índice de Riesgo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alertas.map((alerta) => (
                <TableRow key={alerta.id} className="group border-b border-border/20 hover:bg-red-500/2 transition-colors">
                  <TableCell className="py-4 pl-6 font-semibold text-xs">{alerta.nombre}</TableCell>
                  <TableCell className="py-4 text-[11px] font-medium text-muted-foreground">{alerta.seccion}</TableCell>
                  <TableCell className="py-4 text-center">
                    <span className="text-xs font-bold text-red-600">{alerta.faltas} F</span>
                    <span className="mx-1 text-muted-foreground opacity-30">/</span>
                    <span className="text-[11px] font-medium text-muted-foreground">{alerta.totalDias} D</span>
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center justify-end gap-3">
                      <div className="w-24">
                        <Progress
                          value={alerta.porcentaje}
                          className="h-1.5 bg-muted"
                          indicatorClassName={cn(
                            alerta.porcentaje > 30 ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                          )}
                        />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{alerta.porcentaje}%</span>
                    </div>
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
