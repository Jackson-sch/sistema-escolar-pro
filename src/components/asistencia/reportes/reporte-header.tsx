"use client"

import { IconCalendarMonth, IconCircleFilled, IconDownload } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { MESES_OPTIONS } from "@/lib/constants"
import * as XLSX from 'xlsx'

interface ReporteHeaderProps {
  mes: number
  anio: number
  totalEstudiantes: number
  data?: any[]
  daysInMonth?: number
}

export function ReporteHeader({ mes, anio, totalEstudiantes, data = [], daysInMonth = 0 }: ReporteHeaderProps) {
  const handleExportXLSX = () => {
    if (!data || data.length === 0) return

    const excelData = data.map(alumno => {
      const stats = {
        P: alumno.asistencias.filter((a: any) => a.presente && !a.tardanza && !a.justificada).length,
        F: alumno.asistencias.filter((a: any) => !a.presente && !a.justificada).length,
        T: alumno.asistencias.filter((a: any) => a.tardanza).length,
        J: alumno.asistencias.filter((a: any) => a.justificada).length
      }

      const row: any = {
        "ESTUDIANTE": `${alumno.apellidoPaterno} ${alumno.apellidoMaterno}, ${alumno.name}`.toUpperCase()
      }

      for (let day = 1; day <= daysInMonth; day++) {
        const asistencia = alumno.asistencias.find((a: any) => new Date(a.fecha).getDate() === day)
        let status = "-"
        if (asistencia) {
          if (asistencia.tardanza) status = "T"
          else if (asistencia.justificada) status = "J"
          else if (!asistencia.presente) status = "F"
          else status = "P"
        }
        row[day.toString()] = status
      }

      row["PRES."] = stats.P
      row["FALT."] = stats.F
      row["TARD."] = stats.T
      row["JUST."] = stats.J

      return row
    })

    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Asistencia")

    // Ajustar anchos de columna básicos
    const wscols = [
      { wch: 40 }, // Estudiante
      ...Array.from({ length: daysInMonth }, () => ({ wch: 4 })), // Días
      { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 } // Totales
    ]
    ws['!cols'] = wscols

    XLSX.writeFile(wb, `Reporte_Asistencia_${MESES_OPTIONS[mes].nombre}_${anio}.xlsx`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6 py-5 bg-muted/5">
      <div className="flex items-center gap-4">
        <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20 shadow-sm shadow-primary/5">
          <IconCalendarMonth className="h-5 w-5 text-primary" />
        </div>
        <div className="space-y-0.5">
          <h3 className="text-lg font-bold tracking-tight leading-tight">
            Consolidado {MESES_OPTIONS[mes].nombre}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-muted-foreground">
              Periodo {anio}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="text-[11px] font-semibold text-primary/90">
              {totalEstudiantes} Alumnos
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        {/* Leyenda Técnica */}
        <div className="flex items-center gap-4 text-[10px] font-medium text-muted-foreground bg-background/40 border border-border/40 rounded-full px-5 py-2 backdrop-blur-md">
          <div className="flex items-center gap-1.5"><IconCircleFilled className="size-2 text-emerald-500 shadow-sm shadow-emerald-500/20" /> Presente</div>
          <div className="flex items-center gap-1.5"><IconCircleFilled className="size-2 text-red-500 shadow-sm shadow-red-500/20" /> Falta</div>
          <div className="flex items-center gap-1.5"><IconCircleFilled className="size-2 text-amber-500 shadow-sm shadow-amber-500/20" /> Tarde</div>
          <div className="flex items-center gap-1.5"><IconCircleFilled className="size-2 text-sky-500 shadow-sm shadow-sky-500/20" /> Justif.</div>
        </div>

        <Button
          size="sm"
          onClick={handleExportXLSX}
          disabled={!data || data.length === 0}
          className="h-9 w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-6 shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
        >
          <IconDownload className="mr-2 h-3.5 w-3.5" />
          Exportar Excel
        </Button>
      </div>
    </div>
  )
}
