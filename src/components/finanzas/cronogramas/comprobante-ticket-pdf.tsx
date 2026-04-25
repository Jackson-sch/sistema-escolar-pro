import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { toTitleCase } from "@/lib/utils";

const TICKET_WIDTH = 226; // ~80mm in points
const TICKET_HEIGHT = 800;

const styles = StyleSheet.create({
  page: {
    width: TICKET_WIDTH,
    paddingHorizontal: 15,
    paddingVertical: 20,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  dashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    borderStyle: "dashed",
    marginVertical: 10,
  },
  ticketSection: {
    marginBottom: 6,
  },
  label: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  }
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
    dre?: string;
    ugel?: string;
    logo?: string;
  };
}

export const ComprobanteTicketPDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobanteTicketPDFProps) => {
  const studentName = toTitleCase(`${estudiante.apellidoPaterno} ${estudiante.name}`);
  const institucionNombre = toTitleCase(institucion.nombre);

  return (
    <Document>
      <Page size={[TICKET_WIDTH, TICKET_HEIGHT]} style={styles.page}>
        {/* Header Institución */}
        <Stack direction="vertical" align="center" gap="md" style={{ marginBottom: 12 }}>
          <Heading level={6} align="center" weight="bold" color="primary" style={{ fontSize: 11 }}>
            {institucionNombre}
          </Heading>
          <Stack direction="vertical" align="center" gap="none">
            {institucion.dre && (
              <Text style={{ fontSize: 7, color: '#475569' }}>DRE: {institucion.dre} / UGEL: {institucion.ugel}</Text>
            )}
            {institucion.ruc && (
              <Text style={{ fontSize: 8, color: '#475569', fontWeight: 'bold' }}>RUC: {institucion.ruc}</Text>
            )}
            {institucion.direccion && (
              <Text style={{ fontSize: 7, textAlign: 'center', color: '#64748b', marginTop: 2 }}>
                {institucion.direccion}
              </Text>
            )}
            {institucion.telefono && (
              <Text style={{ fontSize: 7, color: '#64748b' }}>Tel: {institucion.telefono}</Text>
            )}
          </Stack>
        </Stack>

        <Divider thickness="thin" color="#0f172a" spacing="sm" />

        {/* Título del Documento */}
        <Stack direction="vertical" align="center" gap="none" style={{ marginVertical: 8 }}>
          <Text style={{ fontSize: 7, fontWeight: 'bold', color: '#64748b', letterSpacing: 1 }}>RECIBO DE PAGO</Text>
          <Text style={{ fontSize: 10, fontWeight: 'bold', marginTop: 2 }}>{pago.numeroBoleta}</Text>
        </Stack>

        <View style={styles.dashed} />

        {/* Datos del Cliente/Estudiante */}
        <View style={styles.ticketSection}>
          <Text style={styles.label}>Estudiante:</Text>
          <Text style={styles.value}>{studentName}</Text>
          {estudiante.codigoEstudiante && (
            <Text style={{ fontSize: 7, color: '#64748b', marginTop: 1 }}>ID: {estudiante.codigoEstudiante}</Text>
          )}
        </View>

        <View style={styles.dashed} />

        {/* Detalle del Pago */}
        <View style={styles.ticketSection}>
          <Text style={styles.label}>Concepto de Pago:</Text>
          <Text style={{ fontSize: 9, lineHeight: 1.3 }}>{pago.concepto}</Text>
          
          <Stack direction="horizontal" justify="between" style={{ marginTop: 10, padding: 6, backgroundColor: '#f8fafc', borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>TOTAL:</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold' }}>S/ {pago.monto.toFixed(2)}</Text>
          </Stack>
        </View>

        <View style={styles.dashed} />

        {/* Info Adicional */}
        <KeyValue
          size="md"
          items={[
            { key: 'Fecha:', value: new Date(pago.fechaPago).toLocaleDateString() },
            { key: 'Metodo:', value: pago.metodoPago },
            { key: 'Operación:', value: pago.referenciaPago || 'Directo' }
          ]}
        />

        {pago.observaciones && (
          <View style={{ marginTop: 8, padding: 5, borderLeftWidth: 2, borderLeftColor: '#cbd5e1' }}>
            <Text style={{ fontSize: 7, color: '#64748b' }}>Nota: {pago.observaciones}</Text>
          </View>
        )}

        <Divider spacing="lg" />

        {/* Footer */}
        <Stack direction="vertical" align="center" gap="md" style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 7, color: '#94a3b8', fontStyle: 'italic' }}>Comprobante Electrónico Oficial</Text>
          <Text style={{ fontSize: 7, color: '#94a3b8' }}>
            {new Date().toLocaleString("es-PE")}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 8, color: '#0f172a' }}>
            *** GRACIAS POR SU PUNTUALIDAD ***
          </Text>
        </Stack>
      </Page>
    </Document>
  );
};
