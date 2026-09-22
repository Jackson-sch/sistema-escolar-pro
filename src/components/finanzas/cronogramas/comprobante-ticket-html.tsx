import React from "react";

export interface ComprobanteTicketHtmlProps {
  pago: {
    numeroBoleta: string;
    fechaPago: Date | string;
    monto: number;
    metodoPago: string;
    referenciaPago?: string;
    concepto?: string;
    observaciones?: string;
    montoRecibido?: number;
    vuelto?: number;
    items?: Array<{
      concepto: string;
      monto: number;
      mes?: number;
    }>;
  };
  estudiante: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante?: string;
    dni?: string | null;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    } | null;
  };
  institucion: {
    nombre: string;
    direccion?: string;
    telefono?: string;
    ruc?: string;
  };
}

function TicketHeader({ institucion }: { institucion: ComprobanteTicketHtmlProps["institucion"] }) {
  return (
    <div className="text-center mb-2">
      <p className="font-extrabold text-sm leading-tight text-slate-900">{institucion.nombre}</p>
      {institucion.direccion && (
        <p className="text-[9px] text-slate-600">{institucion.direccion}</p>
      )}
      {institucion.telefono && (
        <p className="text-[9px] text-slate-600">Tel: {institucion.telefono}</p>
      )}
      {institucion.ruc && (
        <p className="text-[9px] font-bold text-slate-700">RUC / Cód: {institucion.ruc}</p>
      )}
    </div>
  );
}

function TicketStudentInfo({ estudiante }: { estudiante: ComprobanteTicketHtmlProps["estudiante"] }) {
  return (
    <div className="space-y-0.5 text-[10px]">
      <div className="flex gap-1">
        <span className="font-bold text-slate-600 shrink-0 w-14">Alumno:</span>
        <span className="font-semibold">
          {estudiante.apellidoPaterno} {estudiante.apellidoMaterno}, {estudiante.name}
        </span>
      </div>
      {estudiante.dni && (
        <div className="flex gap-1">
          <span className="font-bold text-slate-600 shrink-0 w-14">DNI:</span>
          <span>{estudiante.dni}</span>
        </div>
      )}
      {estudiante.codigoEstudiante && (
        <div className="flex gap-1">
          <span className="font-bold text-slate-600 shrink-0 w-14">Código:</span>
          <span>{estudiante.codigoEstudiante}</span>
        </div>
      )}
      {estudiante.nivelAcademico && (
        <div className="flex gap-1">
          <span className="font-bold text-slate-600 shrink-0 w-14">Grado:</span>
          <span>
            {estudiante.nivelAcademico.nivel?.nombre || ""} -{" "}
            {estudiante.nivelAcademico.grado?.nombre || ""} &quot;
            {estudiante.nivelAcademico.seccion}&quot;
          </span>
        </div>
      )}
    </div>
  );
}

function TicketPaymentInfo({ pago }: { pago: ComprobanteTicketHtmlProps["pago"] }) {
  return (
    <div className="space-y-0.5 text-[10px]">
      <div className="flex gap-1">
        <span className="font-bold text-slate-600 shrink-0 w-14">Fecha:</span>
        <span>{new Date(pago.fechaPago).toLocaleDateString("es-PE")}</span>
      </div>
      <div className="flex gap-1">
        <span className="font-bold text-slate-600 shrink-0 w-14">Método:</span>
        <span className="font-semibold">{pago.metodoPago}</span>
      </div>
      {pago.referenciaPago && (
        <div className="flex gap-1">
          <span className="font-bold text-slate-600 shrink-0 w-14">Operación:</span>
          <span>{pago.referenciaPago}</span>
        </div>
      )}
    </div>
  );
}

function TicketConceptTable({ pago }: { pago: ComprobanteTicketHtmlProps["pago"] }) {
  const items = pago.items && pago.items.length > 0 ? pago.items : null;

  return (
    <div className="text-[10px]">
      <div className="flex justify-between font-bold border-b border-slate-900 pb-0.5 mb-1">
        <span>Concepto</span>
        <span className="text-right">Monto</span>
      </div>
      {items ? (
        items.map((it) => (
          <div key={`${it.concepto}-${it.mes ?? ""}-${it.monto}`} className="flex justify-between py-0.5">
            <span className="flex-1 pr-2 truncate">{it.concepto}</span>
            <span className="font-bold text-right shrink-0">S/ {Number(it.monto).toFixed(2)}</span>
          </div>
        ))
      ) : (
        <div className="flex justify-between py-0.5">
          <span className="flex-1 pr-2">{pago.concepto || "Servicio Educativo"}</span>
          <span className="font-bold">S/ {Number(pago.monto).toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

function TicketTotals({ pago }: { pago: ComprobanteTicketHtmlProps["pago"] }) {
  const hasCashChange = pago.montoRecibido !== undefined && pago.montoRecibido > pago.monto;
  const hasVuelto = pago.vuelto !== undefined && pago.vuelto > 0;

  return (
    <div className="text-[10px] space-y-0.5">
      <div className="flex justify-between border-t border-slate-900 pt-1 mt-1 text-xs">
        <span className="font-extrabold text-slate-900">TOTAL COBRADO:</span>
        <span className="font-black text-slate-900">S/ {Number(pago.monto).toFixed(2)}</span>
      </div>

      {hasCashChange && (
        <>
          <div className="flex justify-between pt-0.5 text-[9px] text-slate-600">
            <span>Efectivo recibido:</span>
            <span className="font-semibold">S/ {Number(pago.montoRecibido).toFixed(2)}</span>
          </div>
          {hasVuelto && (
            <div className="flex justify-between text-[9px] font-bold text-slate-800">
              <span>Vuelto:</span>
              <span>S/ {Number(pago.vuelto).toFixed(2)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const ComprobanteTicketHtml = React.forwardRef<
  HTMLDivElement,
  ComprobanteTicketHtmlProps
>(({ pago, estudiante, institucion }, ref) => {
  const fechaGeneracion = new Date(pago.fechaPago || new Date()).toLocaleString("es-PE");

  return (
    <div
      ref={ref}
      className="bg-white text-slate-900 font-mono mx-auto"
      style={{ width: "80mm", padding: "8px 10px", fontSize: "11px", boxSizing: "border-box" }}
    >
      <TicketHeader institucion={institucion} />

      <div className="border-b border-dashed border-slate-500 my-2" />

      <p className="text-center font-extrabold text-sm tracking-wide">RECIBO DE CAJA</p>
      <p className="text-center font-bold text-xs text-slate-800">
        Nº {pago.numeroBoleta || "000-000"}
      </p>

      <div className="border-b border-dashed border-slate-500 my-2" />

      <TicketStudentInfo estudiante={estudiante} />

      <div className="border-b border-dashed border-slate-500 my-2" />

      <TicketPaymentInfo pago={pago} />

      <div className="border-b border-dashed border-slate-500 my-2" />

      <TicketConceptTable pago={pago} />

      <div className="border-b border-dashed border-slate-500 my-2" />

      <TicketTotals pago={pago} />

      {pago.observaciones && (
        <div className="mt-2 text-[9px] border-t border-dashed border-slate-400 pt-1">
          <span className="font-bold">Obs: </span>
          <span className="text-slate-600">{pago.observaciones}</span>
        </div>
      )}

      <div className="border-b border-dashed border-slate-500 my-2" />

      <div className="text-center text-[8px] text-slate-500 space-y-0.5">
        <p>Comprobante de Caja Escolar</p>
        <p>{fechaGeneracion}</p>
        <p className="mt-1 font-semibold text-slate-700">¡Muchas gracias por su puntualidad!</p>
      </div>
    </div>
  );
});

ComprobanteTicketHtml.displayName = "ComprobanteTicketHtml";
