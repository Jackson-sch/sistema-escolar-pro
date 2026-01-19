import { IconFileDownload } from "@tabler/icons-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ComprobantePDF } from "@/components/finanzas/cronogramas/comprobante-pdf";
import { Button } from "@/components/ui/button";

interface DownloadWrapperProps {
  pago: any;
  estudiante: any;
  institucion: any;
  fileName: string;
}

export const DownloadWrapper = ({
  pago,
  estudiante,
  institucion,
  fileName,
}: DownloadWrapperProps) => {
  return (
    <PDFDownloadLink
      document={
        <ComprobantePDF
          pago={pago}
          estudiante={estudiante}
          institucion={institucion}
        />
      }
      fileName={fileName}
    >
      {({ loading }) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
        >
          <IconFileDownload className="size-3.5" />
          {loading ? "..." : "PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};
