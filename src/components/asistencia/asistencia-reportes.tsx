"use client"

import React, { useState, useTransition, useEffect, useRef } from "react"
import { toast } from "sonner"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useQueryState, parseAsString, parseAsInteger } from "nuqs"
import {
  getMonthlyAsistenciaReportAction,
  getAttendanceAlertsAction,
  getInstitutionalSummaryAction,
  getStudentAnnualAttendanceAction,
  getJustificacionesAction
} from "@/actions/attendance"
import { getSeccionesAction, getStudentsInSeccionAction } from "@/actions/academic-structure"

import { ReporteFiltros } from "./reportes/reporte-filtros"
import { ReporteHeader } from "./reportes/reporte-header"
import { ReporteTable } from "./reportes/reporte-table"
import { ReporteEmptyState } from "./reportes/reporte-empty-state"
import { ReporteAlertas } from "./reportes/reporte-alertas"
import { ReporteInstitucional } from "./reportes/reporte-institucional"
import { ReporteIndividual } from "./reportes/reporte-individual"
import { ReporteJustificaciones } from "./reportes/reporte-justificaciones"

interface AsistenciaReportesProps {
  initialSecciones: any[]
  aniosAcademicos: number[]
  defaultYear: number
}

export function AsistenciaReportes({ initialSecciones, aniosAcademicos, defaultYear }: AsistenciaReportesProps) {
  const [anio, setAnio] = useQueryState(
    "anio",
    parseAsInteger.withDefault(defaultYear)
  )
  const [mes, setMes] = useQueryState(
    "mes",
    parseAsInteger.withDefault(new Date().getMonth())
  )
  const [secciones, setSecciones] = useState<any[]>(initialSecciones)
  const [seccionId, setSeccionId] = useQueryState(
    "seccion",
    parseAsString.withDefault("")
  )
  const [reportType, setReportType] = useQueryState(
    "type",
    parseAsString.withDefault("mensual")
  ) as any
  const [studentId, setStudentId] = useQueryState(
    "student",
    parseAsString.withDefault("")
  )

  const [reportData, setReportData] = useState<any[]>([])
  const [daysInMonth, setDaysInMonth] = useState<number>(0)

  // Estados para otros reportes
  const [alertsData, setAlertsData] = useState<any[]>([])
  const [instData, setInstData] = useState<any[]>([])
  const [studentData, setStudentData] = useState<any[]>([])
  const [justificationsData, setJustificationsData] = useState<any[]>([])

  const [isPending, startTransition] = useTransition()
  const [isLoadingSecciones, setIsLoadingSecciones] = useState(false)
  const [isLoadingAlumnos, setIsLoadingAlumnos] = useState(false)
  const [alumnos, setAlumnos] = useState<any[]>([])

  const isFirstRender = useRef(true)

  // Cargar secciones cuando cambie el año
  useEffect(() => {
    const loadSecciones = async () => {
      setIsLoadingSecciones(true)
      const res = await getSeccionesAction({ anioAcademico: anio })
      if (res.data) {
        setSecciones(res.data)
        // Solo limpiar si no es el primer render
        if (!isFirstRender.current) {
          setSeccionId("")
          setStudentId("")
          setReportData([])
        }
      }
      setIsLoadingSecciones(false)
    }
    loadSecciones()
  }, [anio])

  // Cargar alumnos cuando cambie la sección (solo para reporte individual)
  useEffect(() => {
    if (reportType === "individual" && seccionId && seccionId !== "all") {
      const loadAlumnos = async () => {
        setIsLoadingAlumnos(true)
        const res = await getStudentsInSeccionAction(seccionId)
        if (res.data) setAlumnos(res.data)
        setIsLoadingAlumnos(false)
      }
      loadAlumnos()
    } else {
      setAlumnos([])
    }
  }, [seccionId, reportType])

  const loadReport = () => {
    startTransition(async () => {
      // Limpiar datos previos
      setReportData([])
      setAlertsData([])
      setInstData([])
      setStudentData([])
      setJustificationsData([])

      if (reportType === "mensual") {
        if (!seccionId) return
        const res = await getMonthlyAsistenciaReportAction(seccionId, mes, anio)
        if (res.data && res.meta) {
          setReportData(res.data)
          setDaysInMonth(res.meta.totalDias)
        } else if (res.error) toast.error(res.error)
      }

      else if (reportType === "alertas") {
        const res = await getAttendanceAlertsAction(anio, seccionId === "all" ? undefined : seccionId)
        if (res.data) setAlertsData(res.data)
        else if (res.error) toast.error(res.error)
      }

      else if (reportType === "institucional") {
        const res = await getInstitutionalSummaryAction(new Date())
        if (res.data) setInstData(res.data)
        else if (res.error) toast.error(res.error)
      }

      else if (reportType === "individual") {
        if (!studentId) return
        const res = await getStudentAnnualAttendanceAction(studentId, anio)
        if (res.data) setStudentData(res.data)
        else if (res.error) toast.error(res.error)
      }

      else if (reportType === "justificaciones") {
        const res = await getJustificacionesAction(anio, seccionId === "all" ? undefined : seccionId)
        if (res.data) setJustificationsData(res.data)
        else if (res.error) toast.error(res.error)
      }
    })
  }

  // Cargar reporte automáticamente al cambiar parámetros
  useEffect(() => {
    if (reportType === "institucional" || reportType === "alertas" || reportType === "justificaciones") {
      loadReport()
    } else if (reportType === "mensual" && seccionId) {
      loadReport()
    } else if (reportType === "individual" && studentId) {
      loadReport()
    }
  }, [seccionId, studentId, mes, reportType, anio])

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">

      <ReporteFiltros
        anio={anio}
        setAnio={setAnio}
        mes={mes}
        setMes={setMes}
        seccionId={seccionId}
        setSeccionId={setSeccionId}
        studentId={studentId}
        setStudentId={setStudentId}
        reportType={reportType}
        setReportType={setReportType}
        secciones={secciones}
        alumnos={alumnos}
        aniosAcademicos={aniosAcademicos}
        isLoadingSecciones={isLoadingSecciones}
        isLoadingAlumnos={isLoadingAlumnos}
        isPending={isPending}
        onConsultar={loadReport}
      />

      {reportType === "mensual" && seccionId && (
        <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          {isPending ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <ReporteEmptyState type="loading" />
            </div>
          ) : (
            <>
              <ReporteHeader
                mes={mes}
                anio={anio}
                totalEstudiantes={reportData.length}
                data={reportData}
                daysInMonth={daysInMonth}
              />
              <Separator className="bg-border/40" />
              <div className="overflow-hidden">
                {reportData.length > 0 ? (
                  <ReporteTable
                    reportData={reportData}
                    daysInMonth={daysInMonth}
                    anio={anio}
                    mes={mes}
                  />
                ) : (
                  <ReporteEmptyState type="empty" />
                )}
              </div>
            </>
          )}
        </div>
      )}

      {reportType === "alertas" && (
        <ReporteAlertas alertas={alertsData} isPending={isPending} />
      )}

      {reportType === "institucional" && (
        <ReporteInstitucional
          resumen={seccionId && seccionId !== "all"
            ? instData.filter(d => d.id === seccionId)
            : instData
          }
          isPending={isPending}
        />
      )}

      {reportType === "individual" && studentId && (
        <ReporteIndividual
          data={studentData}
          estudianteNombre={alumnos.find(a => a.id === studentId)
            ? `${alumnos.find(a => a.id === studentId).apellidoPaterno} ${alumnos.find(a => a.id === studentId).apellidoMaterno}, ${alumnos.find(a => a.id === studentId).name}`
            : ""
          }
          isPending={isPending}
        />
      )}

      {reportType === "justificaciones" && (
        <ReporteJustificaciones justificaciones={justificationsData} isPending={isPending} />
      )}

      {!seccionId && !studentId && reportType !== "institucional" && reportType !== "alertas" && reportType !== "justificaciones" && !isPending && (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/40 bg-muted/5">
          <ReporteEmptyState type="initial" />
        </div>
      )}
    </div>
  )
}