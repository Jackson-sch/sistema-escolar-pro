import prisma from "@/lib/prisma";

export interface EmisionComprobantePayload {
  tipoComprobante: "01" | "03"; // 01: Factura, 03: Boleta de Venta
  serie: string; // ej: "B001", "F001"
  numero?: number;
  fechaEmision?: string; // YYYY-MM-DD
  cliente: {
    tipoDoc: "1" | "6" | "4" | "7"; // 1: DNI, 6: RUC
    numeroDoc: string;
    razonSocial: string;
    direccion?: string;
    email?: string;
  };
  moneda: "PEN" | "USD";
  items: Array<{
    codigo: string;
    descripcion: string;
    cantidad: number;
    precioUnitario: number; // Con IGV o exonerado
    tipoAfectacionIgv: "10" | "20" | "30"; // 20: Exonerado (educación en Perú está exonerada de IGV)
  }>;
  totalVenta: number;
}

export interface EmisionComprobanteResponse {
  success: boolean;
  comprobanteId?: string;
  cdrHash?: string;
  sunatResponseCode?: string;
  sunatDescription?: string;
  pdfUrl?: string;
  xmlUrl?: string;
  error?: string;
}

/**
 * Cliente de integración con facturacion-electronica-api para la emisión
 * de Boletas y Facturas electrónicas válidas ante SUNAT.
 */
export async function emitirComprobanteElectronico(
  payload: EmisionComprobantePayload,
  institucionId?: string
): Promise<EmisionComprobanteResponse> {
  try {
    // 1. Obtener URL y Token configurados para la institución o variables del sistema
    const [apiEndpointVar, apiTokenVar] = await Promise.all([
      prisma.variableSistema.findUnique({
        where: { clave: "FACTURACION_API_URL" },
      }),
      prisma.variableSistema.findUnique({
        where: { clave: "FACTURACION_API_KEY" },
      }),
    ]);

    const apiUrl =
      apiEndpointVar?.valor ||
      process.env.FACTURACION_API_URL ||
      "http://localhost:3001/api/v1/comprobantes";
    const apiKey =
      apiTokenVar?.valor || process.env.FACTURACION_API_KEY || "";

    // 2. Realizar la petición HTTP a facturacion-electronica-api
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        ...payload,
        institucionId,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          errData?.message ||
          `Error en API de facturación: ${response.statusText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      comprobanteId: data.id || data.comprobanteId,
      cdrHash: data.hash || data.cdrHash,
      sunatResponseCode: data.codigoRespuesta || "0",
      sunatDescription: data.mensajeRespuesta || "Aceptado por SUNAT",
      pdfUrl: data.pdfUrl,
      xmlUrl: data.xmlUrl,
    };
  } catch (error: any) {
    console.error("Error al conectar con facturacion-electronica-api:", error);
    return {
      success: false,
      error:
        error?.message ||
        "No se pudo establecer comunicación con el servicio de facturación SUNAT",
    };
  }
}
