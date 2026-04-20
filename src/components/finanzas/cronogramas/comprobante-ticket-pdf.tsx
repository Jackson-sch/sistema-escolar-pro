"use client";

import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";

const TICKET_WIDTH = 226; // ~80mm in points
const TICKET_HEIGHT = 800;

const styles = StyleSheet.create({
  page: {
    width: TICKET_WIDTH,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  dashed: {
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderStyle: "dashed",
    marginVertical: 8,
  },
  ticketSection: {
    marginBottom: 4,
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
  };
}

export const ComprobanteTicketPDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobanteTicketPDFProps) => {
  const studentName = `${estudiante.apellidoPaterno} ${estudiante.name}`;

  return (
    <Document>
      <Page size={[TICKET_WIDTH, TICKET_HEIGHT]} style={styles.page}>
        {/* Header Institución */}
        <Stack direction="vertical" align="center" gap="xs" style={{ marginBottom: 10 }}>
          <Heading level={5} align="center" weight="bold">
            {institucion.nombre}
          </Heading>
          {institucion.ruc && (
            <Text style={{ fontSize: 8 }}>RUC: {institucion.ruc}</Text>
          )}
          {institucion.direccion && (
            <Text style={{ fontSize: 7, textAlign: 'center' }}>
              {institucion.direccion}
            </Text>
          )}
        </Stack>

        <Divider thickness={1} color="#000" spacing="sm" />

        {/* Título del Documento */}
        <Stack direction="vertical" align="center" gap="none" style={{ marginVertical: 6 }}>
          <Heading level={6} weight="bold">COMPROBANTE DE PAGO</Heading>
          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{pago.numeroBoleta}</Text>
        </Stack>

        <View style={styles.dashed} />

        {/* Datos del Cliente/Estudiante */}
        <Stack direction="vertical" gap="xs" style={styles.ticketSection}>
          <Heading level={6} weight="bold" transform="uppercase" style={{ fontSize: 8 }}>Estudiante:</Heading>
          <Text style={{ fontSize: 9 }}>{studentName}</Text>
          {estudiante.codigoEstudiante && (
            <Text style={{ fontSize: 8, color: '#4b5563' }}>Cód: {estudiante.codigoEstudiante}</Text>
          )}
        </Stack>

        <View style={styles.dashed} />

        {/* Detalle del Pago */}
        <Stack direction="vertical" gap="xs" style={styles.ticketSection}>
          <Heading level={6} weight="bold" transform="uppercase" style={{ fontSize: 8 }}>Concepto:</Heading>
          <Text style={{ fontSize: 9 }}>{pago.concepto}</Text>
          
          <Stack direction="horizontal" justify="between" style={{ marginTop: 4 }}>
            <Text style={{ fontSize: 9, fontWeight: 'bold' }}>TOTAL:</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>S/ {pago.monto.toFixed(2)}</Text>
          </Stack>
        </Stack>

        <View style={styles.dashed} />

        {/* Info Adicional */}
        <KeyValue
          size="xs"
          items={[
            { key: 'Fecha:', value: new Date(pago.fechaPago).toLocaleDateString() },
            { key: 'Metodo:', value: pago.metodoPago },
            { key: 'Ref:', value: pago.referenciaPago || '-' }
          ]}
        />

        <Divider spacing="md" />

        {/* Footer */}
        <Stack direction="vertical" align="center" gap="xs" style={{ marginTop: 10 }}>
          <Text style={{ fontSize: 7, color: '#64748b' }}>Comprobante electrónico</Text>
          <Text style={{ fontSize: 7, color: '#64748b' }}>
            {new Date().toLocaleString("es-PE")}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: 'bold', marginTop: 4 }}>
            ¡Gracias por su pago!
          </Text>
        </Stack>
      </Page>
    </Document>
  );
};
