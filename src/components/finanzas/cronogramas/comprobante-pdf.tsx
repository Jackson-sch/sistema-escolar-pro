"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const EMERALD = "#059669";
const EMERALD_DARK = "#064e3b";
const EMERALD_LIGHT = "#d1fae5";
const SLATE_700 = "#334155";
const SLATE_500 = "#64748b";
const SLATE_300 = "#cbd5e1";
const SLATE_100 = "#f1f5f9";
const SLATE_50 = "#f8fafc";

const styles = StyleSheet.create({
  page: {
    padding: 0,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: SLATE_700,
    position: "relative",
  },

  /* ── Watermark "PAGADO" ────────────────────── */
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 72,
    fontWeight: "bold",
    color: "#10b98115",
    transform: "rotate(-35deg)",
    letterSpacing: 20,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Content wrapper with padding ──────────── */
  content: {
    padding: 40,
    paddingTop: 0,
  },

  /* ── Green top bar ─────────────────────────── */
  topBar: {
    height: 6,
    backgroundColor: EMERALD,
    marginBottom: 0,
  },

  /* ── Header ────────────────────────────────── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 40,
    marginBottom: 0,
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: "bold",
    color: EMERALD_DARK,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  schoolDetail: {
    fontSize: 9,
    color: SLATE_500,
    marginBottom: 2,
  },

  /* Receipt badge */
  receiptBadge: {
    borderWidth: 2,
    borderColor: EMERALD,
    borderRadius: 6,
    padding: 12,
    minWidth: 160,
    alignItems: "center",
  },
  receiptLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: EMERALD,
    letterSpacing: 2,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  receiptNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: EMERALD_DARK,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Divider ───────────────────────────────── */
  divider: {
    height: 1,
    backgroundColor: SLATE_300,
    marginHorizontal: 40,
  },
  dividerGreen: {
    height: 2,
    backgroundColor: EMERALD,
    marginHorizontal: 40,
  },

  /* ── Section ───────────────────────────────── */
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: EMERALD,
    marginBottom: 10,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Info rows ─────────────────────────────── */
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoItem: {
    width: "50%",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 2,
    fontFamily: "Helvetica-Bold",
  },
  infoValue: {
    fontSize: 11,
    color: SLATE_700,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Table ─────────────────────────────────── */
  table: {
    marginTop: 6,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: EMERALD_DARK,
    padding: 10,
    paddingHorizontal: 14,
  },
  tableHeaderText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontFamily: "Helvetica-Bold",
  },
  tableRow: {
    flexDirection: "row",
    padding: 12,
    paddingHorizontal: 14,
    backgroundColor: SLATE_50,
    borderBottomWidth: 1,
    borderBottomColor: SLATE_100,
  },
  colConcept: { flex: 3 },
  colAmount: { flex: 1, textAlign: "right" },

  /* ── Totals ────────────────────────────────── */
  totalSection: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  totalBox: {
    width: 220,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  totalLabel: {
    fontSize: 10,
    color: SLATE_500,
  },
  totalValue: {
    fontSize: 10,
    color: SLATE_700,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: EMERALD_LIGHT,
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: EMERALD_DARK,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: EMERALD_DARK,
    fontFamily: "Helvetica-Bold",
  },

  /* ── Observations ──────────────────────────── */
  obsBox: {
    marginTop: 16,
    backgroundColor: SLATE_50,
    borderRadius: 4,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: EMERALD,
  },
  obsTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: SLATE_500,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  obsText: {
    fontSize: 9,
    color: SLATE_500,
    lineHeight: 1.4,
  },

  /* ── Signatures ────────────────────────────── */
  signatureContainer: {
    marginTop: 50,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  signatureBox: {
    width: 160,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: SLATE_300,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 8,
    color: SLATE_500,
    textAlign: "center",
  },

  /* ── Footer ────────────────────────────────── */
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: SLATE_100,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: SLATE_500,
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
      {/* Watermark */}
      <Text style={styles.watermark}>PAGADO</Text>

      {/* Green top bar */}
      <View style={styles.topBar} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolName}>{institucion.nombre}</Text>
          <Text style={styles.schoolDetail}>
            {institucion.direccion || "Dirección de la Institución"}
          </Text>
          <Text style={styles.schoolDetail}>
            Telf: {institucion.telefono || "—"}
          </Text>
          <Text style={styles.schoolDetail}>RUC: {institucion.ruc || "—"}</Text>
        </View>
        <View style={styles.receiptBadge}>
          <Text style={styles.receiptLabel}>Recibo de Pago</Text>
          <Text style={styles.receiptNumber}>
            {pago.numeroBoleta || "000-000"}
          </Text>
        </View>
      </View>

      <View style={styles.dividerGreen} />

      {/* Content */}
      <View style={styles.content}>
        {/* Student Info */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Datos del Estudiante</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nombres</Text>
              <Text style={styles.infoValue}>
                {estudiante.apellidoPaterno} {estudiante.apellidoMaterno},{" "}
                {estudiante.name}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID / Código</Text>
              <Text style={styles.infoValue}>
                {estudiante.codigoEstudiante || "N/A"}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Grado / Sección</Text>
              <Text style={styles.infoValue}>
                {estudiante.nivelAcademico
                  ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles del Pago</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Fecha de Pago</Text>
              <Text style={styles.infoValue}>
                {new Date(pago.fechaPago).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Método de Pago</Text>
              <Text style={styles.infoValue}>{pago.metodoPago}</Text>
            </View>
            {pago.referenciaPago && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Referencia</Text>
                <Text style={styles.infoValue}>{pago.referenciaPago}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Conceptos</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colConcept]}>
                Descripción / Concepto
              </Text>
              <Text style={[styles.tableHeaderText, styles.colAmount]}>
                Monto
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[{ fontSize: 11 }, styles.colConcept]}>
                {pago.concepto}
              </Text>
              <Text
                style={[
                  { fontSize: 11, fontFamily: "Helvetica-Bold" },
                  styles.colAmount,
                ]}
              >
                S/ {pago.monto.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={styles.totalBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>S/ {pago.monto.toFixed(2)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Mora / Otros:</Text>
              <Text style={styles.totalValue}>S/ 0.00</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>TOTAL PAGADO:</Text>
              <Text style={styles.grandTotalValue}>
                S/ {pago.monto.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Observations */}
        {pago.observaciones && (
          <View style={styles.obsBox}>
            <Text style={styles.obsTitle}>Observaciones</Text>
            <Text style={styles.obsText}>{pago.observaciones}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Recibí Conforme</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Caja / Tesorería</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Comprobante de pago electrónico — Conservar para trámite
          administrativo
        </Text>
        <Text style={styles.footerText}>
          Generado el {new Date().toLocaleString("es-PE")}
        </Text>
      </View>
    </Page>
  </Document>
);
