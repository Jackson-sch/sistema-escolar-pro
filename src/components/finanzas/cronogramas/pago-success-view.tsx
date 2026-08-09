"use client";

import { IconCheck, IconFileDownload, IconPrinter, IconX } from "@tabler/icons-react";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { CronogramaTableType } from "@/components/finanzas/cronogramas/cronograma-columns";
import { ComprobanteHtml } from "@/components/finanzas/cronogramas/comprobante-html";
import { ComprobanteTicketHtml } from "@/components/finanzas/cronogramas/comprobante-ticket-html";
import { createPortal } from "react-dom";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { FormatoComprobante } from "@/lib/comprobante-constants";
import { formatCurrency, formatDate } from "@/lib/formats";

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
        className="flex-1 h-11 rounded-xl gap-2 font-medium border-dashed"
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
  const [visible, setVisible] = useState(false);

  // Detección de hidratación sin setState síncrono en el efecto
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    // Trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => {
      clearTimeout(t);
    };
  }, []);

  const handlePrint = () => window.print();

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

  const printCss = isTicket
    ? `@media print {
        body > * { display: none !important; }
        #print-portal-root {
          display: block !important;
          position: absolute; left: 0; top: 0; width: 80mm;
        }
        @page { size: 80mm auto; margin: 0; }
      }`
    : `@media print {
        body > * { display: none !important; }
        #print-portal-root {
          display: block !important;
          position: absolute; left: 0; top: 0; width: 100%;
        }
      }`;

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden"
      style={{
        transition: "opacity 0.4s ease, transform 0.4s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: printCss }} />

      {/* Print portal */}
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

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
        aria-label="Cerrar"
      >
        <IconX className="size-4" />
      </button>

      {/* Main content */}
      <div className="w-full px-8 pb-8 pt-10 flex flex-col items-center gap-6">

        {/* Success icon with ripple rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer ripple */}
          <div
            className="absolute size-24 rounded-full bg-emerald-500/10"
            style={{ animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }}
          />
          {/* Middle ring */}
          <div className="absolute size-20 rounded-full bg-emerald-500/15" />
          {/* Inner circle */}
          <div className="relative size-16 rounded-full bg-linear-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <IconCheck className="size-8 text-white" strokeWidth={3} />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center space-y-1.5">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            ¡Cobro Registrado!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            El comprobante ha sido generado y el saldo actualizado correctamente.
          </p>
        </div>

        {/* Amount highlight */}
        <div className="w-full rounded-2xl bg-linear-to-br from-emerald-50 to-green-50 dark:from-emerald-950/40 dark:to-green-950/40 border border-emerald-100 dark:border-emerald-900/50 px-6 py-4 text-center">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
            Monto cobrado
          </p>
          <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
            {formatCurrency(paymentData.monto)}
          </p>
        </div>

        {/* Payment details card */}
        <div className="w-full rounded-2xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
          <DetailRow label="N° Boleta" value={paymentData.numeroBoleta} mono />
          <DetailRow label="Concepto" value={paymentData.concepto} />
          <DetailRow label="Método de pago" value={paymentData.metodoPago} />
          <DetailRow label="Fecha y hora" value={formatDate(paymentData.fechaPago, "dd 'de' MMMM, yyyy 'a las' HH:mm 'horas'")} />
          {paymentData.referenciaPago && (
            <DetailRow label="Referencia" value={paymentData.referenciaPago} mono />
          )}
          {cronograma.estudiante && (
            <DetailRow
              label="Estudiante"
              value={`${cronograma.estudiante.name ?? ""} ${cronograma.estudiante.apellidoPaterno ?? ""} ${cronograma.estudiante.apellidoMaterno ?? ""}`.trim()}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="w-full flex gap-3">
          {mounted ? (
            <>
              <ReceiptDownloadButton
                paymentData={paymentData}
                estudiante={estudianteData}
                institucion={institucionData}
                formato={formatoComprobante}
              />
              <Button
                variant="outline"
                className="rounded-full gap-2 font-semibold border-border hover:bg-muted"
                onClick={handlePrint}
              >
                <IconPrinter className="size-4" />
                Imprimir
              </Button>
            </>
          ) : (
            <>
              <Button className="flex-1 h-11 rounded-xl" disabled>
                <IconFileDownload className="size-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" className="flex-1 h-11 rounded-xl" disabled>
                <IconPrinter className="size-4 mr-2" />
                Imprimir
              </Button>
            </>
          )}
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 rounded-full"
        >
          Finalizar y cerrar
        </Button>
        </div>

      </div>

      {/* Keyframe for ping animation (in case Tailwind's animate-ping isn't available) */}
      <style>{`
        @keyframes ping {
          75%, 100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ─── Helper sub-component ─── */
function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-xs font-medium text-foreground text-right truncate ${
          mono ? "font-mono tracking-wide" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}