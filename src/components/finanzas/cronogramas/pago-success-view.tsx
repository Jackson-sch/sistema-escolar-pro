"use client";

import { IconCheck, IconFileDownload, IconPrinter } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";
import { ComprobanteHtml } from "@/components/finanzas/cronogramas/comprobante-html";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";

const ReceiptDownloadButton = dynamic(
  () =>
    import("@/components/finanzas/cronogramas/receipt-download-button").then(
      (mod) => mod.ReceiptDownloadButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        className="w-full h-11 gap-2 font-medium"
        disabled
      >
        <IconFileDownload className="size-4" />
        Cargando...
      </Button>
    ),
  }
);

interface PagoSuccessViewProps {
  paymentData: {
    numeroBoleta: string;
    fechaPago: Date;
    monto: number;
    metodoPago: string;
    referenciaPago?: string;
    concepto: string;
    observaciones?: string;
  };
  cronograma: CronogramaTableType;
  institucion?: {
    nombreInstitucion?: string;
    direccion?: string;
    telefono?: string;
    codigoModular?: string;
  };
  onClose: () => void;
}

export function PagoSuccessView({
  paymentData,
  cronograma,
  institucion,
  onClose,
}: PagoSuccessViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center py-10 px-6 space-y-6 animate-in fade-in zoom-in duration-300">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          body > * {
            display: none !important;
          }
          #print-portal-root {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `,
        }}
      />

      {/* Printable receipt in portal */}
      {mounted &&
        createPortal(
          <div id="print-portal-root" className="hidden">
            <ComprobanteHtml
              pago={paymentData}
              estudiante={{
                ...cronograma.estudiante,
                codigoEstudiante:
                  cronograma.estudiante.codigoEstudiante ?? undefined,
              }}
              institucion={{
                nombre: institucion?.nombreInstitucion || "SISTEMA ESCOLAR PRO",
                direccion: institucion?.direccion,
                telefono: institucion?.telefono,
                ruc: institucion?.codigoModular,
              }}
            />
          </div>,
          document.body
        )}

      <div className="relative">
        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-background">
          <IconCheck className="size-10 text-primary" strokeWidth={3} />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-foreground">¡Cobro Exitoso!</h3>
        <p className="text-muted-foreground">
          El comprobante ha sido generado y el saldo actualizado.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {mounted ? (
          <>
            <ReceiptDownloadButton
              paymentData={paymentData}
              estudiante={{
                ...cronograma.estudiante,
                codigoEstudiante:
                  cronograma.estudiante.codigoEstudiante ?? undefined,
              }}
              institucion={{
                nombre: institucion?.nombreInstitucion || "SISTEMA ESCOLAR PRO",
                direccion: institucion?.direccion,
                telefono: institucion?.telefono,
                ruc: institucion?.codigoModular,
              }}
            />

            <Button
              variant="secondary"
              className="col-span-1 h-11 gap-2 font-medium"
              onClick={handlePrint}
            >
              <IconPrinter className="size-4" />
              Imprimir
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              className="w-full h-11 gap-2 font-medium"
              disabled
            >
              <IconFileDownload className="size-4" />
              Descargar PDF
            </Button>
            <Button
              variant="secondary"
              className="w-full h-11 gap-2 font-medium"
              disabled
            >
              <IconPrinter className="size-4" />
              Imprimir
            </Button>
          </>
        )}
      </div>

      <Button variant="ghost" className="w-full mt-2" onClick={onClose}>
        Finalizar y Cerrar
      </Button>
    </div>
  );
}
