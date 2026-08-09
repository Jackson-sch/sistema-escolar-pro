"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ComprobantePDF } from "@/components/finanzas/cronogramas/comprobante-pdf";
import { IconDownload, IconLoader2, IconFileDownload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

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
  // true solo después de la hidratación (SSR-safe) sin efecto de montaje.
  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

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

  if (!isMounted) {
    return (
      <Button
        disabled
        size="sm"
        className="rounded-xl h-8 px-3 text-xs font-semibold bg-muted text-muted-foreground opacity-60 gap-1.5"
      >
        <IconLoader2 className="size-3.5 animate-spin" />
        <span>Cargando...</span>
      </Button>
    );
  }

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
      className="inline-block"
    >
      {({ loading }) => (
        <Button
          size="sm"
          disabled={loading}
          className="rounded-xl h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 cursor-pointer"
        >
          {loading ? (
            <>
              <IconLoader2 className="size-3.5 animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <IconFileDownload className="size-3.5" />
              <span>Descargar PDF</span>
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
