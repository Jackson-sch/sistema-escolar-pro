import React from "react";
import { formatCurrency, formatDate } from "@/lib/formats";

interface ComprobanteHtmlProps {
  pago: {
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

export const ComprobanteHtml = React.forwardRef<
  HTMLDivElement,
  ComprobanteHtmlProps
>(({ pago, estudiante, institucion }, ref) => {
  return (
    <div
      ref={ref}
      className="p-8 max-w-[800px] mx-auto bg-white text-slate-800 font-sans"
      style={{ minHeight: "297mm" }}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-5 mb-8">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-emerald-800 mb-1">
            {institucion.nombre}
          </h1>
          <p className="text-sm text-slate-500">
            {institucion.direccion || "Dirección de la Institución"}
          </p>
          <p className="text-sm text-slate-500">
            Telf: {institucion.telefono || "-"}
          </p>
          <p className="text-sm text-slate-500">
            RUC: {institucion.ruc || "-"}
          </p>
        </div>
        <div className="bg-emerald-500 text-white p-4 rounded-md min-w-[180px] text-center">
          <p className="text-xs font-bold uppercase tracking-wider mb-1">
            Recibo de Pago
          </p>
          <p className="text-xl font-black">{pago.numeroBoleta || "000-000"}</p>
        </div>
      </div>

      {/* Student Data */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
          Datos del Estudiante
        </h2>
        <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <span className="font-bold">Nombres:</span>
          <span>
            {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
            {estudiante.name}
          </span>
          <span className="font-bold">ID/Código:</span>
          <span>{estudiante.codigoEstudiante || "N/A"}</span>
          <span className="font-bold">Grado/Sección:</span>
          <span>
            {estudiante.nivelAcademico
              ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
              : "N/A"}
          </span>
        </div>
      </section>

      {/* Payment Details */}
      <section className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-3">
          Detalles del Pago
        </h2>
        <div className="grid grid-cols-[120px_1fr] gap-y-1 text-sm">
          <span className="font-bold">Fecha:</span>
          <span>{new Date(pago.fechaPago).toLocaleDateString()}</span>
          <span className="font-bold">Método:</span>
          <span>{pago.metodoPago}</span>
          {pago.referenciaPago && (
            <>
              <span className="font-bold">Referencia:</span>
              <span>{pago.referenciaPago}</span>
            </>
          )}
        </div>
      </section>

      {/* Items Table */}
      <div className="mt-4 overflow-hidden border border-slate-100 rounded-sm">
        <div className="grid grid-cols-[1fr_120px] bg-slate-50 p-2 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
          <span>Descripción / Concepto</span>
          <span className="text-right">Monto</span>
        </div>
        <div className="grid grid-cols-[1fr_120px] p-3 text-sm border-b border-slate-50 last:border-0">
          <span>{pago.concepto}</span>
          <span className="text-right font-medium">
            S/ {pago.monto.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mt-8">
        <div className="w-64 bg-slate-50 p-4 rounded-md space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>S/ {pago.monto.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Mora/Otros:</span>
            <span>S/ 0.00</span>
          </div>
          <div className="flex justify-between font-bold text-emerald-700 text-lg border-t border-slate-200 pt-2 mt-2">
            <span>TOTAL PAGADO:</span>
            <span>S/ {pago.monto.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Observations */}
      {pago.observaciones && (
        <div className="mt-8 text-sm">
          <p className="font-bold mb-1">Observaciones:</p>
          <p className="text-slate-500">{pago.observaciones}</p>
        </div>
      )}

      {/* Signature Area */}
      <div className="mt-20 flex justify-around">
        <div className="w-48 border-t border-slate-300 pt-2 text-center text-xs text-slate-400">
          Recibí Conforme
        </div>
        <div className="w-48 border-t border-slate-300 pt-2 text-center text-xs text-slate-400">
          Caja / Tesorería
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 left-8 right-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
        Este documento es un comprobante de pago electrónico. Conservar para
        cualquier trámite administrativo. Generado el{" "}
        {new Date().toLocaleString()}
      </footer>
    </div>
  );
});

ComprobanteHtml.displayName = "ComprobanteHtml";
