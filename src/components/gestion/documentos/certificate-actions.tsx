"use client";

import { useState } from "react";
import {
  IconFileCertificate,
  IconDownload,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ConstanciaEstudiosPDF } from "@/components/gestion/documentos/constancia-estudios-pdf";
import { getConstanciaDataAction } from "@/actions/reports";
import { registerDocumentAction } from "@/actions/documents";
import { generateVerificationCode } from "@/lib/pdf-utils";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CertificateActionsProps {
  studentId: string;
  studentName: string;
}

export function CertificateActions({
  studentId,
  studentName,
}: CertificateActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { copied, copy } = useCopyToClipboard();

  const handlePrepareCert = async () => {
    setLoading(true);
    try {
      const res = await getConstanciaDataAction(studentId);
      if (res.data) {
        const vCode = generateVerificationCode();

        // Registrar documento en la BD
        const regRes = await registerDocumentAction({
          tipoDocumentoCodigo: "CONSTANCIA_ESTUDIOS", // Asegúrate que este código exista en tu BD
          titulo: `Constancia de Estudios - ${studentName}`,
          estudianteId: studentId,
          emisorId: "admin-id",
          codigoVerificacion: vCode,
          datosAdicionales: {
            anioAcademico: res.data.anioAcademico,
          },
        });

        if (regRes.error) {
          toast.error("Error al registrar el documento para verificación");
        }

        setData(res.data);
        setVerificationCode(regRes.data?.codigoVerificacion || vCode);
        toast.success("Certificado preparado y verificado");
      } else {
        toast.error(res.error || "Error al preparar certificado");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Función para copiar el código
  const handleCopyCode = () => {
    copy(verificationCode, "Código copiado al portapapeles");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <IconFileCertificate className="size-4 mr-2 text-amber-500" />
          Constancia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconFileCertificate className="size-5 text-amber-500" />
            Emisión de Certificados
          </DialogTitle>
          <DialogDescription>
            Genera un certificado oficial de estudios para {studentName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {data ? (
            <div className="flex flex-col space-y-4">
              <button
                onClick={handleCopyCode}
                className={cn(
                  "p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center w-full",
                  "hover:bg-amber-500/10 transition-colors group relative cursor-pointer outline-none focus:ring-2 focus:ring-amber-500/20",
                )}
                title="Clic para copiar código"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                  CÓDIGO GENERADO
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xl font-mono font-black text-foreground">
                    {verificationCode}
                  </p>
                  <div className="text-muted-foreground/50 group-hover:text-amber-600 transition-colors">
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

              <PDFDownloadLink
                document={
                  <ConstanciaEstudiosPDF
                    student={data.student}
                    anioAcademico={data.anioAcademico}
                    institucion={data.institucion}
                    verificationCode={verificationCode}
                  />
                }
                fileName={`Constancia-${studentName}.pdf`}
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
                onClick={() => setData(null)}
              >
                Regenerar Código
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
                <IconFileCertificate className="mr-2 h-5 w-5" />
              )}
              Preparar Documento Oficial
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
