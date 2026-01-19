"use client"

import { useState, useTransition, useEffect } from "react"
import {
  IconClipboardList,
  IconDownload,
  IconLoader2,
  IconCalendarEvent
} from "@tabler/icons-react"
import { toast } from "sonner"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { BoletaNotasPDF } from "./boleta-notas-pdf"
import { getQualitativeReportDataAction } from "@/actions/reports"
import { getPeriodosByAnioAction } from "@/actions/academic-structure"
import { registerDocumentAction } from "@/actions/documents"
import { generateVerificationCode } from "@/lib/pdf-utils"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ReportActionsProps {
  studentId: string
  anioAcademico: number
}

export function ReportActions({ studentId, anioAcademico }: ReportActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [periodos, setPeriodos] = useState<any[]>([])
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("")
  const [reportData, setReportData] = useState<any>(null)
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Cargar periodos al abrir
  useEffect(() => {
    if (isOpen) {
      const loadPeriodos = async () => {
        const res = await getPeriodosByAnioAction(anioAcademico)
        if (res.data) {
          setPeriodos(res.data)
        }
      }
      loadPeriodos()
    }
  }, [isOpen, anioAcademico])

  const handlePrepareReport = async () => {
    if (!selectedPeriodo) {
      toast.error("Seleccione un periodo")
      return
    }

    setIsLoadingData(true)
    try {
      const res = await getQualitativeReportDataAction(studentId, selectedPeriodo)
      if (res.data) {
        const vCode = generateVerificationCode()
        
        // Registrar documento en la BD
        const regRes = await registerDocumentAction({
          tipoDocumentoCodigo: "BOLETA_NOTAS",
          titulo: `Boleta de Notas - ${res.data.periodoNombre}`,
          estudianteId: studentId,
          emisorId: "admin-id", // Esto debería venir de la sesión
          codigoVerificacion: vCode,
          datosAdicionales: {
            periodoId: selectedPeriodo,
            anioAcademico: anioAcademico
          }
        })

        if (regRes.error) {
          toast.error("Error al registrar el documento para verificación")
          // Opcional: podrías decidir no continuar si el registro falla
        }

        setReportData(res.data)
        setVerificationCode(vCode)
        toast.success("Reporte preparado y certificado para descarga")
      } else {
        toast.error(res.error || "Error al preparar el reporte")
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado")
    } finally {
      setIsLoadingData(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full font-black uppercase tracking-widest text-[10px] h-11 border-border/40 hover:bg-muted/50 transition-all rounded-xl">
          <IconClipboardList className="size-4 mr-2 text-emerald-500" /> Boleta de Notas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCalendarEvent className="size-5 text-emerald-500" />
            Certificación Académica
          </DialogTitle>
          <DialogDescription>
            Seleccione el periodo académico para generar la boleta de información.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Periodo Académico</label>
            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Seleccionar periodo..." />
              </SelectTrigger>
              <SelectContent>
                {periodos.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3">
            {!reportData ? (
              <Button
                onClick={handlePrepareReport}
                disabled={isLoadingData || !selectedPeriodo}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl"
              >
                {isLoadingData ? <IconLoader2 className="animate-spin mr-2" /> : <IconClipboardList className="mr-2 h-4 w-4" />}
                Procesar Calificaciones
              </Button>
            ) : (
              <PDFDownloadLink
                document={
                  <BoletaNotasPDF
                    student={reportData.student}
                    notas={reportData.notas}
                    periodoNombre={reportData.periodoNombre}
                    anioAcademico={reportData.anioAcademico}
                    institucion={reportData.institucion}
                    verificationCode={verificationCode}
                  />
                }
                fileName={`Boleta-${reportData.periodoNombre}-${reportData.student.dni}.pdf`}
              >
                {({ loading }) => (
                  <Button
                    className="w-full h-11 bg-primary hover:bg-primary/90 font-bold rounded-xl"
                    disabled={loading}
                  >
                    <IconDownload className="mr-2 h-4 w-4" />
                    {loading ? "Generando PDF..." : "Descargar Boleta de Notas"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            {reportData && (
              <Button variant="ghost" size="sm" onClick={() => setReportData(null)} className="text-[10px] font-bold uppercase">
                Cambiar Periodo
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
