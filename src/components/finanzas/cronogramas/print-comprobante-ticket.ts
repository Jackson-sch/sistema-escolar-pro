import type { ComprobanteTicketHtmlProps } from "./comprobante-ticket-html";

export function printComprobanteTicket({
  pago,
  estudiante,
  institucion,
}: ComprobanteTicketHtmlProps) {
  const existingIframe = document.getElementById("pos-print-iframe");
  if (existingIframe) {
    existingIframe.remove();
  }

  const iframe = document.createElement("iframe");
  iframe.id = "pos-print-iframe";
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.zIndex = "-9999";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const fechaGeneracion = new Date(pago.fechaPago || new Date()).toLocaleString("es-PE");
  const items = pago.items && pago.items.length > 0 ? pago.items : null;

  const itemsHtml = items
    ? items
        .map(
          (it) => `
      <div style="display:flex; justify-content:space-between; padding: 2px 0;">
        <span style="flex:1; padding-right:8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${it.concepto}</span>
        <span style="font-weight:bold; text-align:right; white-space:nowrap;">S/ ${Number(it.monto).toFixed(2)}</span>
      </div>`
        )
        .join("")
    : `
      <div style="display:flex; justify-content:space-between; padding: 2px 0;">
        <span style="flex:1; padding-right:8px;">${pago.concepto || "Servicio Educativo"}</span>
        <span style="font-weight:bold;">S/ ${Number(pago.monto).toFixed(2)}</span>
      </div>`;

  const cashDetailHtml =
    pago.montoRecibido !== undefined && pago.montoRecibido > pago.monto
      ? `
      <div style="display:flex; justify-content:space-between; padding-top:2px; font-size:9px; color:#555;">
        <span>Efectivo recibido:</span>
        <span style="font-weight:600;">S/ ${Number(pago.montoRecibido).toFixed(2)}</span>
      </div>
      ${
        pago.vuelto !== undefined && pago.vuelto > 0
          ? `
      <div style="display:flex; justify-content:space-between; font-size:9px; font-weight:bold; color:#222;">
        <span>Vuelto:</span>
        <span>S/ ${Number(pago.vuelto).toFixed(2)}</span>
      </div>`
          : ""
      }`
      : "";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Recibo - ${pago.numeroBoleta || "Comprobante"}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, -apple-system, sans-serif;
            background: #ffffff !important;
            color: #000000 !important;
            width: 80mm;
            padding: 4mm 3mm;
            font-size: 11px;
            line-height: 1.25;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .dashed {
            border-bottom: 1px dashed #444;
            margin: 6px 0;
          }
          .row {
            display: flex;
            gap: 4px;
            font-size: 10px;
          }
          .label {
            font-weight: bold;
            color: #444;
            width: 55px;
            flex-shrink: 0;
          }
        </style>
      </head>
      <body>
        <div style="text-align:center; margin-bottom:6px;">
          <div style="font-weight:900; font-size:13px; line-height:1.2;">${institucion.nombre}</div>
          ${institucion.direccion ? `<div style="font-size:9px; color:#555;">${institucion.direccion}</div>` : ""}
          ${institucion.telefono ? `<div style="font-size:9px; color:#555;">Tel: ${institucion.telefono}</div>` : ""}
          ${institucion.ruc ? `<div style="font-size:9px; font-weight:bold; color:#333;">RUC / Cód: ${institucion.ruc}</div>` : ""}
        </div>

        <div class="dashed"></div>

        <div style="text-align:center; font-weight:900; font-size:12px; letter-spacing:0.5px;">RECIBO DE CAJA</div>
        <div style="text-align:center; font-weight:bold; font-size:11px; color:#222;">Nº ${pago.numeroBoleta || "000-000"}</div>

        <div class="dashed"></div>

        <div style="display:flex; flex-direction:column; gap:2px; font-size:10px;">
          <div class="row">
            <span class="label">Alumno:</span>
            <span style="font-weight:bold;">${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}</span>
          </div>
          ${estudiante.dni ? `<div class="row"><span class="label">DNI:</span><span>${estudiante.dni}</span></div>` : ""}
          ${estudiante.codigoEstudiante ? `<div class="row"><span class="label">Código:</span><span>${estudiante.codigoEstudiante}</span></div>` : ""}
          ${
            estudiante.nivelAcademico
              ? `<div class="row"><span class="label">Grado:</span><span>${estudiante.nivelAcademico.nivel?.nombre || ""} - ${estudiante.nivelAcademico.grado?.nombre || ""} "${estudiante.nivelAcademico.seccion}"</span></div>`
              : ""
          }
        </div>

        <div class="dashed"></div>

        <div style="display:flex; flex-direction:column; gap:2px; font-size:10px;">
          <div class="row">
            <span class="label">Fecha:</span>
            <span>${new Date(pago.fechaPago).toLocaleDateString("es-PE")}</span>
          </div>
          <div class="row">
            <span class="label">Método:</span>
            <span style="font-weight:bold;">${pago.metodoPago}</span>
          </div>
          ${pago.referenciaPago ? `<div class="row"><span class="label">Operación:</span><span>${pago.referenciaPago}</span></div>` : ""}
        </div>

        <div class="dashed"></div>

        <div style="font-size:10px;">
          <div style="display:flex; justify-content:space-between; font-weight:bold; border-bottom:1px solid #222; padding-bottom:2px; margin-bottom:3px;">
            <span>Concepto</span>
            <span style="text-align:right;">Monto</span>
          </div>
          ${itemsHtml}
        </div>

        <div class="dashed"></div>

        <div style="font-size:10px;">
          <div style="display:flex; justify-content:space-between; border-top:1px solid #000; padding-top:4px; font-size:12px; font-weight:900;">
            <span>TOTAL COBRADO:</span>
            <span>S/ ${Number(pago.monto).toFixed(2)}</span>
          </div>
          ${cashDetailHtml}
        </div>

        ${pago.observaciones ? `<div style="margin-top:6px; font-size:9px; border-top:1px dashed #666; padding-top:4px;"><strong>Obs:</strong> ${pago.observaciones}</div>` : ""}

        <div class="dashed"></div>

        <div style="text-align:center; font-size:8px; color:#555; line-height:1.3;">
          <div>Comprobante de Caja Escolar</div>
          <div>${fechaGeneracion}</div>
          <div style="margin-top:4px; font-weight:bold; color:#333;">¡Muchas gracias por su puntualidad!</div>
        </div>
      </body>
    </html>
  `;

  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      iframe.remove();
    }, 2500);
  }, 150);
}
