import { IconFileDownload } from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ComprobantePDF } from "@/components/finanzas/cronogramas/comprobante-pdf";
import { ComprobanteTicketPDF } from "@/components/finanzas/cronogramas/comprobante-ticket-pdf";
import { Button } from "@/components/ui/button";
import type { FormatoComprobante } from "@/lib/comprobante-constants";

interface ReceiptDownloadButtonProps {
  paymentData: {
    numeroBoleta: string;
    fechaPago: Date;
    monto: number;
    metodoPago: string;
    referenciaPago?: string;
    concepto: string;
    observaciones?: string;
  };
  estudiante: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante?: string;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
  };
  institucion: {
    nombre: string;
    direccion?: string;
    telefono?: string;
    ruc?: string;
  };
  formato?: FormatoComprobante;
}

export const ReceiptDownloadButton = ({
  paymentData,
  estudiante,
  institucion,
  formato = "A4",
}: ReceiptDownloadButtonProps) => {
  const PdfComponent =
    formato === "TICKET" ? ComprobanteTicketPDF : ComprobantePDF;

  return (
    <PDFDownloadLink
      document={
        <PdfComponent
          pago={paymentData}
          estudiante={estudiante}
          institucion={institucion}
        />
      }
      fileName={`Recibo-${paymentData.numeroBoleta}.pdf`}
      className="col-span-1"
    >
      {({ loading }) => (
        <Button
          variant="outline"
          className="w-full h-11 gap-2 font-medium"
          disabled={loading}
        >
          <IconFileDownload className="size-4" />
          {loading ? "Generando..." : "Descargar PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
