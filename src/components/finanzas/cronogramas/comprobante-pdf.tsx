"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Register fonts if needed (using default ones for now)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#334155",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#10b981",
    paddingBottom: 20,
    marginBottom: 20,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#065f46",
    marginBottom: 4,
  },
  receiptBadge: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 4,
    minWidth: 150,
  },
  receiptTitle: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  receiptNumber: {
    color: "white",
    fontSize: 14,
    fontWeight: "black",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#64748b",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: "bold",
  },
  value: {
    flex: 1,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    padding: 8,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 8,
  },
  colConcept: { flex: 3 },
  colAmount: { flex: 1, textAlign: "right" },
  totalSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: 200,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#065f46",
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 10,
  },
  signatureContainer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signatureBox: {
    width: 150,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    textAlign: "center",
    paddingTop: 5,
  },
});

interface ComprobantePDFProps {
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

export const ComprobantePDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobantePDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>{institucion.nombre}</Text>
          <Text>{institucion.direccion || "Dirección de la Institución"}</Text>
          <Text>Telf: {institucion.telefono || "-"}</Text>
          <Text>RUC: {institucion.ruc || "-"}</Text>
        </View>
        <View style={styles.receiptBadge}>
          <Text style={styles.receiptTitle}>RECIBO DE PAGO</Text>
          <Text style={styles.receiptNumber}>
            {pago.numeroBoleta || "000-000"}
          </Text>
        </View>
      </View>

      {/* Student Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Nombres:</Text>
          <Text style={styles.value}>
            {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
            {estudiante.name}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ID/Código:</Text>
          <Text style={styles.value}>
            {estudiante.codigoEstudiante || "N/A"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Grado/Sección:</Text>
          <Text style={styles.value}>
            {estudiante.nivelAcademico
              ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
              : "N/A"}
          </Text>
        </View>
      </View>

      {/* Payment Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Pago</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Fecha:</Text>
          <Text style={styles.value}>
            {new Date(pago.fechaPago).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Método:</Text>
          <Text style={styles.value}>{pago.metodoPago}</Text>
        </View>
        {pago.referenciaPago && (
          <View style={styles.row}>
            <Text style={styles.label}>Referencia:</Text>
            <Text style={styles.value}>{pago.referenciaPago}</Text>
          </View>
        )}
      </View>

      {/* Table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.colConcept}>Descripción / Concepto</Text>
          <Text style={styles.colAmount}>Monto</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.colConcept}>{pago.concepto}</Text>
          <Text style={styles.colAmount}>S/ {pago.monto.toFixed(2)}</Text>
        </View>
      </View>

      {/* Totals */}
      <View style={styles.totalSection}>
        <View style={styles.totalBox}>
          <View style={styles.totalRow}>
            <Text>Subtotal:</Text>
            <Text>S/ {pago.monto.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Mora/Otros:</Text>
            <Text>S/ 0.00</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>TOTAL PAGADO:</Text>
            <Text>S/ {pago.monto.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Observations */}
      {pago.observaciones && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
            Observaciones:
          </Text>
          <Text style={{ fontSize: 9, color: "#64748b" }}>
            {pago.observaciones}
          </Text>
        </View>
      )}

      {/* Signatures */}
      <View style={styles.signatureContainer}>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 8 }}>Recibí Conforme</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={{ fontSize: 8 }}>Caja / Tesorería</Text>
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Este documento es un comprobante de pago electrónico. Conservar para
        cualquier trámite administrativo. Generado el{" "}
        {new Date().toLocaleString()}
      </Text>
    </Page>
  </Document>
);
