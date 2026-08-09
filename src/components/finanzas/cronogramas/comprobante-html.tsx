import React from "react";
import { toTitleCase } from "@/lib/utils";

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
    dre?: string;
    ugel?: string;
  };
}

export const ComprobanteHtml = React.forwardRef<
  HTMLDivElement,
  ComprobanteHtmlProps
>(({ pago, estudiante, institucion }, ref) => {
  const studentFull = toTitleCase(`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`);
  const institucionNombre = toTitleCase(institucion.nombre);
  const fechaGeneracion = new Date().toLocaleString("es-PE");

  return (
    <div
      ref={ref}
      className="mx-auto bg-white text-slate-800 font-sans relative overflow-hidden"
      style={{ maxWidth: "800px", minHeight: "297mm", padding: "40px" }}
    >
      {/* Watermark */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          top: "40%",
          left: "5%",
          fontSize: "90px",
          fontWeight: "900",
          color: "rgba(16,185,129,0.03)",
          transform: "rotate(-35deg)",
          letterSpacing: "20px",
          zIndex: 0,
        }}
      >
        DOCUMENTO OFICIAL
      </div>

      {/* Header Container */}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 mb-1">
            {institucionNombre}
          </h1>
          <div className="flex flex-col gap-0.5">
            <p className="text-[11px] text-slate-500 font-medium">
              {institucion.direccion || "Dirección Institucional"}
            </p>
            {institucion.dre && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                DRE: {institucion.dre} | UGEL: {institucion.ugel}
              </p>
            )}
            <p className="text-[11px] text-slate-500 font-medium">
              Telf: {institucion.telefono || "—"} | RUC: {institucion.ruc || "—"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-xl text-center min-w-[200px] shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[4px] opacity-70 mb-1">
              Recibo de Pago
            </p>
            <p className="text-xl font-black">
              {pago.numeroBoleta || "000-000"}
            </p>
          </div>
          <div className="mt-4 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-emerald-200">
            Pago Completado
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="grid grid-cols-2 gap-8 border border-slate-200 rounded-2xl p-8 bg-slate-50/50 mb-8 relative z-10">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4 border-l-2 border-slate-900 pl-3">
            Datos del Estudiante
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Nombre Completo</p>
              <p className="text-sm font-black text-slate-800">{studentFull}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">ID / Código</p>
              <p className="text-sm font-bold text-slate-700">{estudiante.codigoEstudiante || "N/A"}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Grado y Sección</p>
              <p className="text-sm font-bold text-slate-700">
                {estudiante.nivelAcademico
                  ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4 border-l-2 border-slate-900 pl-3">
            Detalles de Operación
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Fecha de Emisión</p>
              <p className="text-sm font-bold text-slate-800">
                {new Date(pago.fechaPago).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Método de Pago</p>
              <p className="text-sm font-bold text-slate-700">{pago.metodoPago}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Referencia</p>
              <p className="text-sm font-bold text-slate-700">{pago.referenciaPago || "Operación Directa"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-8 relative z-10">
        <h2 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-4 border-l-2 border-slate-900 pl-3">
          Detalle del Concepto
        </h2>
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="py-4 px-6 text-left w-16">Cant.</th>
                <th className="py-4 px-6 text-left">Descripción del Servicio</th>
                <th className="py-4 px-6 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-sm border-b border-slate-100">
                <td className="py-5 px-6 text-slate-500 font-bold">01</td>
                <td className="py-5 px-6 font-black text-slate-800">{pago.concepto}</td>
                <td className="py-5 px-6 text-right font-black">S/ {pago.monto.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-12 relative z-10">
        <div className="w-64 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Subtotal:</span>
              <span>S/ {pago.monto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-medium text-slate-500">
              <span>Mora / Otros:</span>
              <span>S/ 0.00</span>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Total:</span>
            <span className="text-xl font-black text-emerald-600">S/ {pago.monto.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Observations */}
      {pago.observaciones && (
        <div className="mb-12 bg-slate-50 rounded-xl border-l-4 border-slate-400 p-5 relative z-10">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Observaciones:</p>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {pago.observaciones}
          </p>
        </div>
      )}

      {/* Signature Area */}
      <div className="mt-auto pt-16 flex justify-around relative z-10">
        <div className="w-48 text-center">
          <div className="h-px bg-slate-300 mb-3" />
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Recibí Conforme</p>
          <p className="text-[9px] text-slate-400">Estudiante / Apoderado</p>
        </div>
        <div className="w-48 text-center">
          <div className="h-px bg-slate-300 mb-3" />
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">Caja / Tesorería</p>
          <p className="text-[9px] text-slate-400">{institucionNombre}</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 relative z-10">
        <p>Comprobante de pago electrónico oficial — Sistema Escolar Pro</p>
        <p>Generado el {fechaGeneracion}</p>
      </footer>
    </div>
  );
});

ComprobanteHtml.displayName = "ComprobanteHtml";
