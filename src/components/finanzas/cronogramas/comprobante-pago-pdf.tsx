import React from "react";
import { Document, Page, Text, View, Image } from "@/lib/pdf";
import { formatDate } from "@/lib/formats";

export interface ComprobantePagoPdfData {
  numeroBoleta: string;
  fechaPago: Date | string;
  metodoPago: string;
  referenciaPago?: string;
  montoRecibido?: number;
  vuelto?: number;
  totalCobrado: number;
  observaciones?: string;
  estudiante: {
    nombreCompleto: string;
    dni: string;
    codigoEstudiante?: string;
    aula: string;
  };
  apoderado?: {
    nombre: string;
    dni?: string;
    telefono?: string;
  };
  institucion: {
    nombreInstitucion: string;
    codigoModular?: string;
    direccion?: string;
    telefono?: string;
    distrito?: string;
    logo?: string | null;
  };
  items: Array<{
    concepto: string;
    monto: number;
  }>;
  qrCode?: string;
}

export const ComprobantePagoPDF = ({
  data,
}: {
  data: ComprobantePagoPdfData;
}) => {
  const inst = data.institucion;

  return (
    <Document title={`Recibo-${data.numeroBoleta}`}>
      <Page
        size="A4"
        style={{
          padding: 35,
          backgroundColor: "#ffffff",
          fontFamily: "Helvetica",
          color: "#0f172a",
        }}
      >
        {/* ── ENCABEZADO SUPERIOR ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottomWidth: 1.5,
            borderBottomColor: "#0f172a",
            paddingBottom: 10,
            marginBottom: 15,
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {inst.nombreInstitucion}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#475569", marginTop: 2 }}>
              {inst.direccion || "Dirección Principal"} · {inst.distrito || "Lima"}
            </Text>
            <Text style={{ fontSize: 7.5, color: "#64748b" }}>
              Cód. Modular / RUC: {inst.codigoModular || "---"} · Teléfono: {inst.telefono || "---"}
            </Text>
          </View>

          {/* Cuadro de Boleta / Recibo */}
          <View
            style={{
              width: 170,
              borderWidth: 1.5,
              borderColor: "#0f172a",
              borderRadius: 4,
              padding: 8,
              alignItems: "center",
              backgroundColor: "#f8fafc",
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "bold",
                color: "#64748b",
                letterSpacing: 0.5,
              }}
            >
              R.U.C. {inst.codigoModular || "20123456789"}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "bold",
                marginVertical: 3,
                color: "#0f172a",
                letterSpacing: 0.5,
              }}
            >
              RECIBO DE CAJA
            </Text>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "bold",
                color: "#2563eb",
              }}
            >
              Nº {data.numeroBoleta}
            </Text>
          </View>
        </View>

        {/* ── DATOS DEL ESTUDIANTE Y APODERADO ── */}
        <View
          style={{
            borderWidth: 1,
            borderColor: "#e2e8f0",
            borderRadius: 4,
            padding: 8,
            backgroundColor: "#f8fafc",
            marginBottom: 12,
            fontSize: 8.5,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={{ width: 100, fontWeight: "bold", color: "#475569" }}>
              Estudiante:
            </Text>
            <Text style={{ flex: 1, fontWeight: "bold" }}>
              {data.estudiante.nombreCompleto.toUpperCase()} (DNI: {data.estudiante.dni})
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={{ width: 100, fontWeight: "bold", color: "#475569" }}>
              Grado / Sección:
            </Text>
            <Text style={{ flex: 1 }}>{data.estudiante.aula}</Text>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={{ width: 100, fontWeight: "bold", color: "#475569" }}>
              Fecha de Pago:
            </Text>
            <Text style={{ width: 140 }}>{formatDate(data.fechaPago)}</Text>
            <Text style={{ width: 90, fontWeight: "bold", color: "#475569" }}>
              Método de Pago:
            </Text>
            <Text style={{ flex: 1 }}>
              {data.metodoPago} {data.referenciaPago ? `(Op: ${data.referenciaPago})` : ""}
            </Text>
          </View>
        </View>

        {/* ── TABLA DE CONCEPTOS COBRADOS ── */}
        <View style={{ marginBottom: 15 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#0f172a",
              paddingVertical: 5,
              paddingHorizontal: 8,
              borderRadius: 3,
            }}
          >
            <Text
              style={{
                width: 30,
                color: "#ffffff",
                fontSize: 8,
                fontWeight: "bold",
              }}
            >
              ITEM
            </Text>
            <Text
              style={{
                flex: 1,
                color: "#ffffff",
                fontSize: 8,
                fontWeight: "bold",
              }}
            >
              DESCRIPCIÓN / CONCEPTO
            </Text>
            <Text
              style={{
                width: 80,
                color: "#ffffff",
                fontSize: 8,
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              IMPORTE
            </Text>
          </View>

          {/* Rows */}
          {data.items.map((item, idx) => (
            <View
              key={`${item.concepto}-${item.monto}`}
              style={{
                flexDirection: "row",
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: "#e2e8f0",
                backgroundColor: idx % 2 === 1 ? "#f8fafc" : "#ffffff",
                fontSize: 8.5,
              }}
            >
              <Text style={{ width: 30, color: "#64748b" }}>{idx + 1}</Text>
              <Text style={{ flex: 1 }}>{item.concepto}</Text>
              <Text style={{ width: 80, textAlign: "right", fontWeight: "bold" }}>
                S/ {Number(item.monto).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* ── TOTALES Y RESUMEN DE CAJA ── */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* QR y Observaciones */}
          <View style={{ width: 260 }}>
            {data.observaciones ? (
              <Text style={{ fontSize: 7.5, color: "#64748b", marginBottom: 6 }}>
                <Text style={{ fontWeight: "bold" }}>Observaciones: </Text>
                {data.observaciones}
              </Text>
            ) : null}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {data.qrCode ? (
                <Image src={data.qrCode} style={{ width: 45, height: 45 }} />
              ) : null}
              <View>
                <Text style={{ fontSize: 6.5, color: "#64748b" }}>
                  Comprobante emitido por Sistema Escolar Pro
                </Text>
                <Text style={{ fontSize: 6, color: "#94a3b8" }}>
                  Válido como constancia de pago interno
                </Text>
              </View>
            </View>
          </View>

          {/* Liquidación Total */}
          <View
            style={{
              width: 170,
              borderWidth: 1,
              borderColor: "#0f172a",
              borderRadius: 4,
              padding: 6,
              backgroundColor: "#f8fafc",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                fontSize: 9,
                fontWeight: "bold",
                marginBottom: 2,
              }}
            >
              <Text>TOTAL:</Text>
              <Text>S/ {Number(data.totalCobrado).toFixed(2)}</Text>
            </View>

            {data.montoRecibido !== undefined && data.montoRecibido > data.totalCobrado ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: 7.5,
                    color: "#64748b",
                  }}
                >
                  <Text>Recibido:</Text>
                  <Text>S/ {Number(data.montoRecibido).toFixed(2)}</Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    fontSize: 7.5,
                    fontWeight: "bold",
                    color: "#166534",
                  }}
                >
                  <Text>Vuelto:</Text>
                  <Text>S/ {Number(data.vuelto || 0).toFixed(2)}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  );
};
