import React from "react";

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
      className="mx-auto bg-white text-slate-800 font-sans relative"
      style={{ maxWidth: "800px", minHeight: "297mm" }}
    >
      {/* Watermark */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "40%",
          left: "12%",
          fontSize: "80px",
          fontWeight: "bold",
          color: "rgba(16,185,129,0.08)",
          transform: "rotate(-35deg)",
          letterSpacing: "16px",
        }}
      >
        PAGADO
      </div>

      {/* Green top bar */}
      <div className="h-1.5 bg-emerald-600 w-full" />

      {/* Header */}
      <div className="flex justify-between items-start px-10 pt-8 pb-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-emerald-900 mb-1.5">
            {institucion.nombre}
          </h1>
          <p className="text-xs text-slate-500">
            {institucion.direccion || "Dirección de la Institución"}
          </p>
          <p className="text-xs text-slate-500">
            Telf: {institucion.telefono || "—"}
          </p>
          <p className="text-xs text-slate-500">
            RUC: {institucion.ruc || "—"}
          </p>
        </div>
        <div className="border-2 border-emerald-600 rounded-md px-5 py-3 min-w-[170px] text-center">
          <p className="text-[9px] font-bold uppercase tracking-[3px] text-emerald-600 mb-1">
            Recibo de Pago
          </p>
          <p className="text-lg font-black text-emerald-900">
            {pago.numeroBoleta || "000-000"}
          </p>
        </div>
      </div>

      {/* Green divider */}
      <div className="h-0.5 bg-emerald-600 mx-10" />

      {/* Content */}
      <div className="px-10 pt-6 pb-8">
        {/* Student Info */}
        <section className="mb-5">
          <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-emerald-600 mb-3">
            Datos del Estudiante
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Nombres
              </span>
              <span className="text-sm font-bold text-slate-700">
                {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
                {estudiante.name}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                ID / Código
              </span>
              <span className="text-sm font-bold text-slate-700">
                {estudiante.codigoEstudiante || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Grado / Sección
              </span>
              <span className="text-sm font-bold text-slate-700">
                {estudiante.nivelAcademico
                  ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
                  : "N/A"}
              </span>
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section className="mb-5">
          <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-emerald-600 mb-3">
            Detalles del Pago
          </h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Fecha de Pago
              </span>
              <span className="text-sm font-bold text-slate-700">
                {new Date(pago.fechaPago).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Método de Pago
              </span>
              <span className="text-sm font-bold text-slate-700">
                {pago.metodoPago}
              </span>
            </div>
            {pago.referenciaPago && (
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Referencia
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {pago.referenciaPago}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Items Table */}
        <section className="mb-5">
          <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-emerald-600 mb-3">
            Detalle de Conceptos
          </h2>
          <div className="overflow-hidden rounded">
            <div className="grid grid-cols-[1fr_120px] bg-emerald-900 text-white p-3 text-[9px] font-bold uppercase tracking-wider">
              <span>Descripción / Concepto</span>
              <span className="text-right">Monto</span>
            </div>
            <div className="grid grid-cols-[1fr_120px] p-3 text-sm bg-slate-50 border-b border-slate-100">
              <span>{pago.concepto}</span>
              <span className="text-right font-bold">
                S/ {pago.monto.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Totals Section */}
        <div className="flex justify-end mt-6">
          <div className="w-56 space-y-1">
            <div className="flex justify-between px-1 text-sm">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-bold text-slate-700">
                S/ {pago.monto.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between px-1 text-sm">
              <span className="text-slate-500">Mora / Otros:</span>
              <span className="font-bold text-slate-700">S/ 0.00</span>
            </div>
            <div className="flex justify-between bg-emerald-100 rounded-md p-2.5 mt-2 text-base">
              <span className="font-black text-emerald-900">TOTAL PAGADO:</span>
              <span className="font-black text-emerald-900">
                S/ {pago.monto.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Observations */}
        {pago.observaciones && (
          <div className="mt-5 bg-slate-50 rounded border-l-[3px] border-emerald-600 p-3">
            <p className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Observaciones
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {pago.observaciones}
            </p>
          </div>
        )}

        {/* Signature Area */}
        <div className="mt-16 flex justify-around">
          <div className="w-44 text-center">
            <div className="border-b border-slate-300 mb-1.5" />
            <span className="text-[9px] text-slate-400">Recibí Conforme</span>
          </div>
          <div className="w-44 text-center">
            <div className="border-b border-slate-300 mb-1.5" />
            <span className="text-[9px] text-slate-400">Caja / Tesorería</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-10 right-10 flex justify-between pt-3 border-t border-slate-100 text-[9px] text-slate-400">
        <span>
          Comprobante de pago electrónico — Conservar para trámite
          administrativo
        </span>
        <span>Generado el {new Date().toLocaleString("es-PE")}</span>
      </footer>
    </div>
  );
});

ComprobanteHtml.displayName = "ComprobanteHtml";
