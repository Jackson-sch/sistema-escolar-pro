"use client";

import { useState } from "react";
import {
  IconSchool,
  IconDownload,
  IconLoader2,
  IconFileCertificate,
  IconCopy, // <-- Nuevo import
  IconCheck, // <-- Nuevo import
} from "@tabler/icons-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ConstanciaMatriculaPDF } from "@/components/gestion/matriculas/components/constancia-pdf";
import { getEnrollmentDataAction } from "@/actions/reports";
import { registerDocumentAction } from "@/actions/documents";
import { generateVerificationCode } from "@/lib/pdf-utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface EnrollmentCertificateActionsProps {
  studentId: string;
  studentName: string;
  trigger?: React.ReactNode;
}

export function EnrollmentCertificateActions({
  studentId,
  studentName,
  trigger,
}: EnrollmentCertificateActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const handlePrepareCert = async () => {
    setLoading(true);
    try {
      const res = await getEnrollmentDataAction(studentId);
      if (res.data) {
        const vCode = generateVerificationCode();

        // Registrar documento en la BD
        const regRes = await registerDocumentAction({
          tipoDocumentoCodigo: "CONSTANCIA_MATRICULA",
          titulo: `Constancia de Matrícula - ${studentName}`,
          estudianteId: studentId,
          emisorId: "admin-id",
          codigoVerificacion: vCode,
          datosAdicionales: {
            anioAcademico: res.data.enrollment.anioAcademico,
          },
        });

        if (regRes.error) {
          toast.error("Error al registrar el documento para verificación");
        }

        setData(res.data);
        setVerificationCode(regRes.data?.codigoVerificacion || vCode);
        toast.success("Constancia preparada y verificada");
      } else {
        toast.error(res.error || "Error al preparar constancia");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // <-- Nueva función para copiar
  const handleCopyCode = () => {
    copy(verificationCode, "Código copiado al portapapeles");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full rounded-full">
            <IconSchool className="size-4 mr-2 text-blue-500" /> Matrícula
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileCertificate className="size-5 text-blue-500" />
            Constancia de Matrícula
          </DialogTitle>
          <DialogDescription>
            Emisión de certificado oficial de matrícula para {studentName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {data ? (
            <div className=" flex flex-col space-y-4">
              {/* SECCIÓN DEL CÓDIGO MODIFICADA */}
              <button
                onClick={handleCopyCode}
                className={cn(
                  "p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center w-full",
                  "hover:bg-blue-500/10 transition-colors group relative cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/20",
                )}
                title="Clic para copiar código"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
                  CONTROL INSTITUCIONAL
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-mono font-black text-foreground">
                    {verificationCode}
                  </p>
                  <div className="text-muted-foreground/50 group-hover:text-blue-600 transition-colors">
                    {copied ? (
                      <IconCheck className="size-4 animate-in zoom-in" />
                    ) : (
                      <IconCopy className="size-4" />
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-1 left-0 right-0">
                  Clic para copiar
                </span>
              </button>
              {/* FIN SECCIÓN MODIFICADA */}

              <PDFDownloadLink
                document={
                  <ConstanciaMatriculaPDF
                    enrollment={data.enrollment}
                    institucion={data.institucion}
                    verificationCode={verificationCode}
                  />
                }
                fileName={`Matricula-${studentName}.pdf`}
              >
                {({ loading: pdfLoading }) => (
                  <Button className="w-full rounded-full" disabled={pdfLoading}>
                    <IconDownload className="mr-2 h-5 w-5" />
                    {pdfLoading ? "Generando PDF..." : "Descargar Constancia"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                variant="outline"
                className="w-full rounded-full"
                onClick={() => {
                  setData(null);
                }}
              >
                Regenerar Documento
              </Button>
            </div>
          ) : (
            <Button
              onClick={handlePrepareCert}
              className="w-full rounded-full"
              disabled={loading}
            >
              {loading ? (
                <IconLoader2 className="animate-spin mr-2" />
              ) : (
                <IconSchool className="mr-2 h-5 w-5" />
              )}
              Generar Constancia Oficial
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
