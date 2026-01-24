"use client"

import { useState } from "react"
import { IconFileText, IconLoader2 } from "@tabler/icons-react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { getGradeReportDataAction } from "@/actions/reports"
import { GradeReportPDF } from "./grade-report-pdf"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface GradeReportButtonProps {
  studentId: string
  studentName: string
  anioAcademico?: number
}

export function GradeReportButton({ studentId, studentName, anioAcademico = 2025 }: GradeReportButtonProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleFetchData = async () => {
    if (data) return // Ya tenemos los datos

    setLoading(true)
    try {
      const res = await getGradeReportDataAction(studentId, anioAcademico)
      if (res.data) {
        setData(res.data)
      } else {
        toast.error(res.error || "No se pudieron obtener los datos de la libreta")
      }
    } catch (error) {
      toast.error("Error al procesar la libreta de notas")
    } finally {
      setLoading(false)
    }
  }

  // Si ya tenemos los datos, mostramos el link de descarga directo
  if (data) {
    return (
      <PDFDownloadLink
        document={<GradeReportPDF data={data} />}
        fileName={`Libreta-${studentName}-${anioAcademico}.pdf`}
        className="w-full"
      >
        {({ loading: pdfLoading }) => (
          <Button
            variant="outline"
            className="w-full font-semibold border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-95 text-emerald-600 rounded-full"
            disabled={pdfLoading}
          >
            <IconFileText className="size-4 mr-2" />
            {pdfLoading ? "Preparando PDF..." : "Descargar Libreta"}
          </Button>
        )}
      </PDFDownloadLink>
    )
  }

  return (
    <Button
      variant="outline"
      className="w-full rounded-full"
      onClick={handleFetchData}
      disabled={loading}
    >
      {loading ? (
        <IconLoader2 className="size-4 mr-2 animate-spin" />
      ) : (
        <IconFileText className="size-4 mr-2 text-emerald-500" />
      )}
      {loading ? "Generando..." : "Generar Libreta"}
    </Button>
  )
}
