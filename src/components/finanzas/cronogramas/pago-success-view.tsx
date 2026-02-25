"use client";

import { IconCheck, IconFileDownload, IconPrinter } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";
import { ComprobanteHtml } from "@/components/finanzas/cronogramas/comprobante-html";
import { ComprobanteTicketHtml } from "@/components/finanzas/cronogramas/comprobante-ticket-html";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import type { FormatoComprobante } from "@/lib/comprobante-constants";

const ReceiptDownloadButton = dynamic(
  () =>
    import("@/components/finanzas/cronogramas/receipt-download-button").then(
      (mod) => mod.ReceiptDownloadButton,
    ),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        className="rounded-full gap-2 font-medium"
        disabled
      >
        <IconFileDownload className="size-4" />
        Cargando...
      </Button>
    ),
  },
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
  formatoComprobante?: FormatoComprobante;
  onClose: () => void;
}

export function PagoSuccessView({
  paymentData,
  cronograma,
  institucion,
  formatoComprobante = "A4",
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

  const isTicket = formatoComprobante === "TICKET";

  const estudianteData = {
    ...cronograma.estudiante,
    codigoEstudiante: cronograma.estudiante.codigoEstudiante ?? undefined,
  };

  const institucionData = {
    nombre: institucion?.nombreInstitucion || "SISTEMA ESCOLAR PRO",
    direccion: institucion?.direccion,
    telefono: institucion?.telefono,
    ruc: institucion?.codigoModular,
  };

  // Print CSS: for ticket, constrain width to 80mm
  const printCss = isTicket
    ? `
      @media print {
        body > * {
          display: none !important;
        }
        #print-portal-root {
          display: block !important;
          position: absolute;
          left: 0;
          top: 0;
          width: 80mm;
        }
        @page {
          size: 80mm auto;
          margin: 0;
        }
      }
    `
    : `
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
    `;

  return (
    <div className="flex flex-col items-center py-10 px-6 space-y-6 animate-in fade-in zoom-in duration-300">
      <style
        dangerouslySetInnerHTML={{
          __html: printCss,
        }}
      />

      {/* Printable receipt in portal */}
      {mounted &&
        createPortal(
          <div id="print-portal-root" className="hidden">
            {isTicket ? (
              <ComprobanteTicketHtml
                pago={paymentData}
                estudiante={estudianteData}
                institucion={institucionData}
              />
            ) : (
              <ComprobanteHtml
                pago={paymentData}
                estudiante={estudianteData}
                institucion={institucionData}
              />
            )}
          </div>,
          document.body,
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
              estudiante={estudianteData}
              institucion={institucionData}
              formato={formatoComprobante}
            />

            <Button
              variant="secondary"
              className="rounded-full gap-2 font-medium"
              onClick={handlePrint}
            >
              <IconPrinter className="size-4" />
              Imprimir
            </Button>
          </>
        ) : (
          <>
            <Button className="rounded-full " disabled>
              <IconFileDownload className="size-4" />
              Descargar PDF
            </Button>
            <Button className="rounded-full gap-2 font-medium" disabled>
              <IconPrinter className="size-4" />
              Imprimir
            </Button>
          </>
        )}
      </div>

      <Button variant="ghost" className="rounded-full mt-2" onClick={onClose}>
        Finalizar y Cerrar
      </Button>
    </div>
  );
}
