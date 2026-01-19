"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Registrar fuentes si es necesario, pero usaremos las estándar por simplicidad
// para evitar problemas de carga de archivos en este entorno.

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "black",
    color: "#1e40af",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#334155",
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    width: "45%",
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  kpiLabel: {
    fontSize: 10,
    color: "#64748b",
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "black",
    color: "#0f172a",
    marginTop: 5,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  tableHeader: {
    backgroundColor: "#f1f5f9",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#94a3b8",
  },
});

interface FinanceReportPDFProps {
  data: {
    totalProyectado: number;
    totalReal: number;
    totalDeuda: number;
    cumplimiento: number;
    totalMora: number;
    topDeudores: any[];
    fecha: string;
  };
}

export const FinanceReportPDF = ({ data }: FinanceReportPDFProps) => {
  const formatValue = (val: number) =>
    `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Reporte Financiero</Text>
          <Text style={styles.subtitle}>
            EduPeru Pro - Gestión Institucional
          </Text>
          <Text style={styles.subtitle}>Generado el: {data.fecha}</Text>
        </View>

        {/* KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumen Ejecutivo</Text>
          <View style={styles.kpiGrid}>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Proyectado</Text>
              <Text style={styles.kpiValue}>
                {formatValue(data.totalProyectado)}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Total Recaudado</Text>
              <Text style={styles.kpiValue}>{formatValue(data.totalReal)}</Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Deuda Pendiente</Text>
              <Text style={styles.kpiValue}>
                {formatValue(data.totalDeuda)}
              </Text>
            </View>
            <View style={styles.kpiCard}>
              <Text style={styles.kpiLabel}>Cumplimiento</Text>
              <Text style={styles.kpiValue}>
                {data.cumplimiento.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        {/* TOP DEUDORES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mayores Deudores</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: "50%" }]}>
                <Text style={styles.tableCell}>Estudiante</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Cuotas</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Monto Pendiente</Text>
              </View>
            </View>
            {/* Rows */}
            {data.topDeudores.map((deudor, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={[styles.tableCol, { width: "50%" }]}>
                  <Text style={styles.tableCell}>{deudor.nombre}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{deudor.cuotas}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatValue(deudor.deuda)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* MORA INFO */}
        <View style={styles.section}>
          <Text style={{ fontSize: 10, color: "#ef4444" }}>
            * El monto de deuda pendiente incluye {formatValue(data.totalMora)}{" "}
            en moras acumuladas.
          </Text>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text>Sistema Escolar Pro - Modulo de Finanzas</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
};
