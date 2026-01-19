"use client"

import { format, isWeekend } from "date-fns"
import { es } from "date-fns/locale"
import { IconCircleFilled } from "@tabler/icons-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ReporteTableProps {
  reportData: any[]
  daysInMonth: number
  anio: number
  mes: number
}

export function ReporteTable({ reportData, daysInMonth, anio, mes }: ReporteTableProps) {
  const getDayStatus = (asistencias: any[], day: number) => {
    const asistencia = asistencias.find(a => new Date(a.fecha).getDate() === day)
    if (!asistencia) return null
    if (asistencia.tardanza) return "tarde"
    if (asistencia.justificada) return "justificado"
    if (!asistencia.presente) return "ausente"
    return "presente"
  }

  const renderStatusIcon = (status: string | null) => {
    switch (status) {
      case "presente": return <IconCircleFilled className="size-3 text-emerald-500 mx-auto" />
      case "ausente": return <IconCircleFilled className="size-3 text-red-500 mx-auto" />
      case "tarde": return <IconCircleFilled className="size-3 text-amber-500 mx-auto" />
      case "justificado": return <IconCircleFilled className="size-3 text-sky-500 mx-auto" />
      default: return null
    }
  }

  return (
    <div className="relative w-full overflow-x-auto flex-1">
      <div className="inline-block min-w-full align-middle">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="w-[220px] sticky left-0 bg-background z-20 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] text-xs font-semibold py-3 text-left text-foreground/80">
                Estudiante
              </TableHead>

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const date = new Date(anio, mes, day)
                const weekend = isWeekend(date)
                return (
                  <TableHead
                    key={day}
                    className={cn(
                      "text-center p-0 min-w-[36px] text-[10px] font-medium border-r text-foreground/70",
                      weekend && "bg-muted/30 text-muted-foreground"
                    )}
                  >
                    <div className="flex flex-col items-center py-2 h-12 justify-center">
                      <span className="opacity-50 font-normal scale-90">{format(date, "eee", { locale: es }).charAt(0)}</span>
                      <span>{day}</span>
                    </div>
                  </TableHead>
                )
              })}

              <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-emerald-50/50 text-emerald-700 border-l">P</TableHead>
              <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-red-50/50 text-red-700 border-r">F</TableHead>
              <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-amber-50/50 text-amber-700 border-r">T</TableHead>
              <TableHead className="text-center text-[11px] font-semibold px-2 min-w-[40px] bg-sky-50/50 text-sky-700">J</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((alumno) => {
              const stats = {
                P: alumno.asistencias.filter((a: any) => a.presente && !a.tardanza && !a.justificada).length,
                F: alumno.asistencias.filter((a: any) => !a.presente && !a.justificada).length,
                T: alumno.asistencias.filter((a: any) => a.tardanza).length,
                J: alumno.asistencias.filter((a: any) => a.justificada).length
              }

              return (
                <TableRow key={alumno.id} className="hover:bg-muted/50/50 group">
                  <TableCell className="sticky left-0 bg-background group-hover:bg-muted/50/50 z-10 border-r font-medium text-xs py-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] min-w-[220px] capitalize">
                    <div className="truncate max-w-[200px]" title={`${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`}>
                      {alumno.apellidoPaterno} {alumno.apellidoMaterno}, {alumno.name}
                    </div>
                  </TableCell>

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const date = new Date(anio, mes, day)
                    const weekend = isWeekend(date)
                    const status = getDayStatus(alumno.asistencias, day)
                    return (
                      <TableCell
                        key={day}
                        className={cn(
                          "text-center p-0 border-r min-w-[36px] h-11",
                          weekend && "bg-muted/10"
                        )}
                      >
                        <div className="flex items-center justify-center h-full">
                          {renderStatusIcon(status)}
                        </div>
                      </TableCell>
                    )
                  })}

                  <TableCell className="text-center font-bold text-xs bg-emerald-50/20 text-emerald-700 border-l min-w-[40px]">{stats.P}</TableCell>
                  <TableCell className="text-center font-bold text-xs bg-red-50/20 text-red-700 border-r min-w-[40px]">{stats.F}</TableCell>
                  <TableCell className="text-center font-bold text-xs bg-amber-50/20 text-amber-700 border-r min-w-[40px]">{stats.T}</TableCell>
                  <TableCell className="text-center font-bold text-xs bg-sky-50/20 text-sky-700 min-w-[40px]">{stats.J}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
