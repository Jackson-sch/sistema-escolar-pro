"use client"

import { LazyMotion, domAnimation, m } from "framer-motion"
import { IconLoader2 } from "@tabler/icons-react"
import { StatsGrid } from "./institucional/stats-grid"
import { TrendChart } from "./institucional/trend-chart"
import { GradePerformance } from "./institucional/grade-performance"
import { ClassroomMonitor } from "./institucional/classroom-monitor"

interface ReporteInstitucionalProps {
  resumen: any[]
  stats?: {
    current: {
      presentes: number
      tardanzas: number
      perc: number
      tasaTardanza: number
    }
    previous: {
      presentes: number
      tardanzas: number
      perc: number
      tasaTardanza: number
    }
    deltaAsistencia: number
    deltaTardanza: number
  }
  trendData?: any[]
  meta?: {
    isToday: boolean
    periodLabel: string
    scope: string
  }
  isPending: boolean
}

export function ReporteInstitucional({ 
  resumen, 
  stats, 
  trendData, 
  meta, 
  isPending 
}: ReporteInstitucionalProps) {
  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
          <LazyMotion features={domAnimation}>
            <m.div
               animate={{ rotate: 360 }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            >
              <IconLoader2 className="h-12 w-12 text-primary" />
            </m.div>
          </LazyMotion>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold tracking-wide uppercase text-primary/80 animate-pulse">
            Sincronizando Analítica
          </p>
          <p className="text-[11px] text-muted-foreground/60">Calculando métricas y tendencias institucionales...</p>
        </div>
      </div>
    )
  }

  const totalAlumnos = resumen.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <div className="space-y-8 pb-10">
      {/* 1. KPIs Cards Grid */}
      <StatsGrid stats={stats} meta={meta} totalAlumnos={totalAlumnos} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Gráfica de Tendencia */}
        <div className="lg:col-span-2">
          <TrendChart trendData={trendData} />
        </div>

        {/* 3. Rendimiento por Grado */}
        <GradePerformance resumen={resumen} />
      </div>

      {/* 4. Monitor de Aulas Premium */}
      <ClassroomMonitor resumen={resumen} />
    </div>
  )
}
