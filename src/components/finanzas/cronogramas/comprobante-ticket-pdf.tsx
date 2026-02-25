"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const TICKET_WIDTH = 226; // ~80mm in points (1mm ≈ 2.835pt)
const TICKET_HEIGHT = 800; // tall enough for content, will trim visually

const styles = StyleSheet.create({
  page: {
    width: TICKET_WIDTH,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },

  /* ── Header ────────────────────────────────── */
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  schoolDetail: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "center",
  },

  /* ── Dashed separator ──────────────────────── */
  dashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderStyle: "dashed",
    marginVertical: 6,
  },

  /* ── Title ─────────────────────────────────── */
  title: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  boletaNum: {
    fontSize: 9,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
    color: "#059669",
    marginBottom: 2,
  },

  /* ── Info rows ─────────────────────────────── */
  row: {
    flexDirection: "row",
    marginBottom: 2,
  },
  label: {
    width: 55,
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
  },
  value: {
    flex: 1,
    fontSize: 8,
  },

  /* ── Table ─────────────────────────────────── */
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 3,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  conceptText: {
    flex: 1,
    fontSize: 8,
    paddingRight: 4,
  },
  amountText: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Totals ────────────────────────────────── */
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalLabel: {
    fontSize: 7,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#334155",
    paddingTop: 4,
    marginTop: 2,
  },
  grandTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: "bold",
    fontFamily: "Helvetica-Bold",
  },

  /* ── Footer ────────────────────────────────── */
  footer: {
    marginTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontSize: 6,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1.4,
  },
});

interface ComprobanteTicketPDFProps {
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

export const ComprobanteTicketPDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobanteTicketPDFProps) => (
  <Document>
    <Page
      size={{ width: TICKET_WIDTH, height: TICKET_HEIGHT }}
      style={styles.page}
    >
      {/* Header — Institution */}
      <View style={styles.header}>
        <Text style={styles.schoolName}>{institucion.nombre}</Text>
        <Text style={styles.schoolDetail}>{institucion.direccion || ""}</Text>
        {institucion.telefono && (
          <Text style={styles.schoolDetail}>Tel: {institucion.telefono}</Text>
        )}
        {institucion.ruc && (
          <Text style={styles.schoolDetail}>RUC: {institucion.ruc}</Text>
        )}
      </View>

      <View style={styles.dashed} />

      {/* Title + Boleta number */}
      <Text style={styles.title}>RECIBO DE PAGO</Text>
      <Text style={styles.boletaNum}>Nº {pago.numeroBoleta || "000-000"}</Text>

      <View style={styles.dashed} />

      {/* Student info */}
      <View style={{ marginBottom: 4 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Alumno:</Text>
          <Text style={styles.value}>
            {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
            {estudiante.name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Código:</Text>
          <Text style={styles.value}>{estudiante.codigoEstudiante || "—"}</Text>
        </View>
        {estudiante.nivelAcademico && (
          <View style={styles.row}>
            <Text style={styles.label}>Grado:</Text>
            <Text style={styles.value}>
              {estudiante.nivelAcademico.nivel.nombre} -{" "}
              {estudiante.nivelAcademico.grado.nombre} &quot;
              {estudiante.nivelAcademico.seccion}&quot;
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dashed} />

      {/* Payment info */}
      <View style={{ marginBottom: 4 }}>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>
            {new Date(pago.fechaPago).toLocaleDateString("es-PE")}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método:</Text>
          <Text style={styles.value}>{pago.metodoPago}</Text>
        </View>
        {pago.referenciaPago && (
          <View style={styles.row}>
            <Text style={styles.label}>Ref:</Text>
            <Text style={styles.value}>{pago.referenciaPago}</Text>
          </View>
        )}
      </View>

      <View style={styles.dashed} />

      {/* Concepts table */}
      <View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Concepto</Text>
          <Text style={styles.tableHeaderText}>Monto</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.conceptText}>{pago.concepto}</Text>
          <Text style={styles.amountText}>S/ {pago.monto.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.dashed} />

      {/* Totals */}
      <View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal:</Text>
          <Text style={styles.totalValue}>S/ {pago.monto.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Mora/Otros:</Text>
          <Text style={styles.totalValue}>S/ 0.00</Text>
        </View>
        <View style={styles.grandTotalRow}>
          <Text style={styles.grandTotalLabel}>TOTAL:</Text>
          <Text style={styles.grandTotalValue}>S/ {pago.monto.toFixed(2)}</Text>
        </View>
      </View>

      {/* Observations */}
      {pago.observaciones && (
        <View style={{ marginTop: 6 }}>
          <Text
            style={{
              fontSize: 7,
              fontWeight: "bold",
              fontFamily: "Helvetica-Bold",
              marginBottom: 2,
            }}
          >
            Obs:
          </Text>
          <Text style={{ fontSize: 7, color: "#64748b" }}>
            {pago.observaciones}
          </Text>
        </View>
      )}

      <View style={styles.dashed} />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Comprobante electrónico</Text>
        <Text style={styles.footerText}>
          {new Date().toLocaleString("es-PE")}
        </Text>
        <Text style={[styles.footerText, { marginTop: 4 }]}>
          ¡Gracias por su pago!
        </Text>
      </View>
    </Page>
  </Document>
);
