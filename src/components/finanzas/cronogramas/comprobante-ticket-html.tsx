import React from "react";

interface ComprobanteTicketHtmlProps {
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

export const ComprobanteTicketHtml = React.forwardRef<
  HTMLDivElement,
  ComprobanteTicketHtmlProps
>(({ pago, estudiante, institucion }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white text-slate-800 font-mono mx-auto"
      style={{ width: "80mm", padding: "8px 10px", fontSize: "11px" }}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <p className="font-bold text-sm leading-tight">{institucion.nombre}</p>
        <p className="text-[9px] text-slate-500">
          {institucion.direccion || ""}
        </p>
        {institucion.telefono && (
          <p className="text-[9px] text-slate-500">
            Tel: {institucion.telefono}
          </p>
        )}
        {institucion.ruc && (
          <p className="text-[9px] text-slate-500">RUC: {institucion.ruc}</p>
        )}
      </div>

      {/* Dashed separator */}
      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Title */}
      <p className="text-center font-bold text-sm">RECIBO DE PAGO</p>
      <p className="text-center font-bold text-emerald-600">
        Nº {pago.numeroBoleta || "000-000"}
      </p>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Student info */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex gap-1">
          <span className="font-bold text-slate-500 shrink-0 w-14">
            Alumno:
          </span>
          <span>
            {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
            {estudiante.name}
          </span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold text-slate-500 shrink-0 w-14">
            Código:
          </span>
          <span>{estudiante.codigoEstudiante || "—"}</span>
        </div>
        {estudiante.nivelAcademico && (
          <div className="flex gap-1">
            <span className="font-bold text-slate-500 shrink-0 w-14">
              Grado:
            </span>
            <span>
              {estudiante.nivelAcademico.nivel.nombre} -{" "}
              {estudiante.nivelAcademico.grado.nombre} &quot;
              {estudiante.nivelAcademico.seccion}&quot;
            </span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Payment info */}
      <div className="space-y-0.5 text-[10px]">
        <div className="flex gap-1">
          <span className="font-bold text-slate-500 shrink-0 w-14">Fecha:</span>
          <span>{new Date(pago.fechaPago).toLocaleDateString("es-PE")}</span>
        </div>
        <div className="flex gap-1">
          <span className="font-bold text-slate-500 shrink-0 w-14">
            Método:
          </span>
          <span>{pago.metodoPago}</span>
        </div>
        {pago.referenciaPago && (
          <div className="flex gap-1">
            <span className="font-bold text-slate-500 shrink-0 w-14">Ref:</span>
            <span>{pago.referenciaPago}</span>
          </div>
        )}
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Concept table */}
      <div className="text-[10px]">
        <div className="flex justify-between font-bold border-b border-slate-800 pb-0.5 mb-1">
          <span>Concepto</span>
          <span>Monto</span>
        </div>
        <div className="flex justify-between">
          <span className="flex-1 pr-2">{pago.concepto}</span>
          <span className="font-bold">S/ {pago.monto.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Totals */}
      <div className="text-[10px] space-y-0.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal:</span>
          <span className="font-bold">S/ {pago.monto.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mora/Otros:</span>
          <span className="font-bold">S/ 0.00</span>
        </div>
        <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 text-sm">
          <span className="font-black">TOTAL:</span>
          <span className="font-black">S/ {pago.monto.toFixed(2)}</span>
        </div>
      </div>

      {/* Observations */}
      {pago.observaciones && (
        <div className="mt-2 text-[9px]">
          <span className="font-bold">Obs: </span>
          <span className="text-slate-500">{pago.observaciones}</span>
        </div>
      )}

      <div className="border-b border-dashed border-slate-400 my-2" />

      {/* Footer */}
      <div className="text-center text-[8px] text-slate-400 space-y-0.5">
        <p>Comprobante electrónico</p>
        <p>{new Date().toLocaleString("es-PE")}</p>
        <p className="mt-1">¡Gracias por su pago!</p>
      </div>
    </div>
  );
});

ComprobanteTicketHtml.displayName = "ComprobanteTicketHtml";
