"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { ComprobantePDF } from "@/components/finanzas/cronogramas/comprobante-pdf";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";

interface BoletaDownloadButtonProps {
  pago: {
    id: string;
    numeroBoleta?: string;
    fechaPago: Date | string;
    monto: number;
    concepto: string;
    metodoPago?: string;
    referenciaPago?: string;
  };
  estudiante: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    codigoEstudiante?: string;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
  };
  institucion?: {
    nombre: string;
    direccion?: string;
    telefono?: string;
    ruc?: string;
  };
}

export function BoletaDownloadButton({
  pago,
  estudiante,
  institucion = {
    nombre: "Institución Educativa",
    direccion: "Dirección de la Institución",
    telefono: "-",
    ruc: "-",
  },
}: BoletaDownloadButtonProps) {
  const pagoData = {
    numeroBoleta: pago.numeroBoleta || `B-${pago.id.slice(-6).toUpperCase()}`,
    fechaPago: new Date(pago.fechaPago),
    monto: pago.monto,
    metodoPago: pago.metodoPago || "Transferencia Bancaria",
    referenciaPago: pago.referenciaPago,
    concepto: pago.concepto,
  };

  const estudianteData = {
    name: estudiante.name,
    apellidoPaterno: estudiante.apellidoPaterno,
    apellidoMaterno: estudiante.apellidoMaterno || "",
    codigoEstudiante: estudiante.codigoEstudiante,
    nivelAcademico: estudiante.nivelAcademico,
  };

  const fileName = `Boleta_${pago.concepto.replace(/\s/g, "_")}_${
    estudiante.apellidoPaterno
  }.pdf`;

  return (
    <PDFDownloadLink
      document={
        <ComprobantePDF
          pago={pagoData}
          estudiante={estudianteData}
          institucion={institucion}
        />
      }
      fileName={fileName}
      className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-bold hover:bg-muted/50 transition-colors"
    >
      {({ loading }) =>
        loading ? (
          <>
            <IconLoader2 className="size-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <IconDownload className="size-4" />
            Descargar
          </>
        )
      }
    </PDFDownloadLink>
  );
}
