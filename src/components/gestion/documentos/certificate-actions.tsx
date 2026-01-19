"use client";

import { useState } from "react";
import {
  IconFileCertificate,
  IconDownload,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ConstanciaEstudiosPDF } from "./constancia-estudios-pdf";
import { getConstanciaDataAction } from "@/actions/reports";
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full font-black uppercase tracking-widest text-[10px] h-11 border-border/40 hover:bg-muted/50 transition-all rounded-xl"
        >
          <IconFileCertificate className="size-4 mr-2 text-amber-500" />{" "}
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
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">
                  CÓDIGO GENERADO
                </p>
                <p className="text-xl font-mono font-black text-foreground">
                  {verificationCode}
                </p>
              </div>

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
                  <Button
                    className="w-full h-12 bg-amber-600 hover:bg-amber-700 font-bold rounded-xl shadow-lg shadow-amber-600/20"
                    disabled={pdfLoading}
                  >
                    <IconDownload className="mr-2 h-5 w-5" />
                    {pdfLoading ? "Generando PDF..." : "Descargar Constancia"}
                  </Button>
                )}
              </PDFDownloadLink>

              <Button
                variant="ghost"
                className="w-full text-xs"
                onClick={() => setData(null)}
              >
                Regenerar Código
              </Button>
            </div>
          ) : (
            <Button
              onClick={handlePrepareCert}
              className="w-full h-12 bg-primary font-bold rounded-xl"
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
