"use client"

import { IconLoader2, IconSearch, IconCalendarMonth, IconSchool, IconAlertTriangle, IconUser, IconFileCheck } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { MESES_OPTIONS } from "@/lib/constants"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ReporteFiltrosProps {
  anio: number
  setAnio: (anio: number) => void
  mes: number
  setMes: (mes: number) => void
  seccionId: string
  setSeccionId: (id: string) => void
  studentId?: string
  setStudentId?: (id: string) => void
  reportType: "mensual" | "institucional" | "alertas" | "individual" | "justificaciones"
  setReportType: (type: "mensual" | "institucional" | "alertas" | "individual" | "justificaciones") => void
  secciones: any[]
  alumnos?: any[]
  aniosAcademicos: number[]
  isLoadingSecciones: boolean
  isLoadingAlumnos?: boolean
  isPending: boolean
  onConsultar: () => void
}

export function ReporteFiltros({
  anio,
  setAnio,
  mes,
  setMes,
  seccionId,
  setSeccionId,
  studentId,
  setStudentId,
  reportType,
  setReportType,
  secciones,
  alumnos = [],
  aniosAcademicos,
  isLoadingSecciones,
  isLoadingAlumnos,
  isPending,
  onConsultar
}: ReporteFiltrosProps) {
  return (
    <div className="space-y-6">
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 border border-border/40 rounded-xl w-fit">
          {[
            { id: 'mensual', label: 'Mensual', icon: IconCalendarMonth },
            { id: 'institucional', label: 'Institucional', icon: IconSchool },
            { id: 'alertas', label: 'Alertas', icon: IconAlertTriangle },
            { id: 'individual', label: 'Individual', icon: IconUser },
            { id: 'justificaciones', label: 'Justificaciones', icon: IconFileCheck },
          ].map((type) => (
            <Tooltip key={type.id} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    setReportType(type.id as any)
                    if (type.id !== 'individual' && setStudentId) setStudentId("")
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm transition-all rounded-lg outline-none",
                    reportType === type.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  <type.icon className="size-4" />
                  <span className="hidden sm:inline-block">{type.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="sm:hidden font-semibold text-[11px] py-1.5 px-3 bg-primary text-primary-foreground border-none">
                {type.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="bg-card/20 border border-border/40 rounded-2xl p-6 backdrop-blur-sm shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="space-y-2.5 md:col-span-2">
            <label className="text-[11px] font-semibold text-muted-foreground ml-1">Periodo</label>
            <Select
              onValueChange={(v) => setAnio(Number(v))}
              value={anio.toString()}
              disabled={isLoadingSecciones}
            >
              <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {aniosAcademicos.map((a) => (
                  <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(reportType === "mensual" || reportType === "justificaciones") && (
            <div className="space-y-2.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-muted-foreground ml-1">Mes de Análisis</label>
              <Select
                onValueChange={(v) => setMes(Number(v))}
                value={mes.toString()}
                disabled={isLoadingSecciones}
              >
                <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {MESES_OPTIONS.map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>{m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className={cn(
            "space-y-2.5",
            (reportType === "mensual" || reportType === "justificaciones") ? "md:col-span-3" :
              (reportType === "individual") ? "md:col-span-3" : "md:col-span-8"
          )}>
            <label className="text-[11px] font-semibold text-muted-foreground ml-1">Sección / Grado</label>
            <Select onValueChange={setSeccionId} value={seccionId} disabled={isLoadingSecciones}>
              <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full">
                <SelectValue placeholder={isLoadingSecciones ? "Cargando..." : "Seleccione sección"} />
              </SelectTrigger>
              <SelectContent>
                {secciones.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nivel.nombre} - {s.grado.nombre} "{s.seccion}"
                  </SelectItem>
                ))}
                {(reportType === "institucional" || reportType === "justificaciones" || reportType === "alertas") && (
                  <SelectItem value="all">Todas las secciones</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {(reportType === "individual") && (
            <div className="space-y-2.5 md:col-span-5">
              <label className="text-[11px] font-semibold text-muted-foreground ml-1">Estudiante</label>
              <Select
                onValueChange={setStudentId}
                value={studentId}
                disabled={!seccionId || isLoadingAlumnos}
              >
                <SelectTrigger className="bg-background/20 border-border/40 transition-all hover:bg-background/40 w-full">
                  <SelectValue placeholder={!seccionId ? "Seleccione sección primero" : isLoadingAlumnos ? "Cargando alumnos..." : "Seleccione estudiante"} />
                </SelectTrigger>
                <SelectContent>
                  {alumnos.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.apellidoPaterno} {a.apellidoMaterno}, {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={onConsultar}
            disabled={
              (reportType !== "institucional" && reportType !== "justificaciones" && reportType !== "alertas" && reportType !== "individual" && !seccionId) ||
              (reportType === "individual" && !studentId) ||
              isPending
            }
            className="md:col-span-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isPending ? <IconLoader2 className="animate-spin mr-2 h-4 w-4" /> : <IconSearch className="mr-2 h-4 w-4" />}
            Consultar
          </Button>
        </div>
      </div>
    </div>
  )
}
