import { IconFileDownload } from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ComprobantePDF } from "@/components/finanzas/cronogramas/comprobante-pdf";
import { Button } from "@/components/ui/button";

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
}

export const ReceiptDownloadButton = ({
  paymentData,
  estudiante,
  institucion,
}: ReceiptDownloadButtonProps) => {
  return (
    <PDFDownloadLink
      document={
        <ComprobantePDF
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
