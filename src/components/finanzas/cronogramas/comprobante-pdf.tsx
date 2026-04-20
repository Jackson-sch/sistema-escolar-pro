"use client";

import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { PageHeader } from "@/components/pdfx/page-header/pdfx-page-header";
import { PageFooter } from "@/components/pdfx/page-footer/pdfx-page-footer";

const styles = StyleSheet.create({
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
  signatureContainer: {
    marginTop: 50,
  },
  signatureBox: {
    width: 160,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    marginBottom: 6,
  },
  totalBox: {
    width: 220,
  },
  grandTotalRow: {
    backgroundColor: "#d1fae5",
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  }
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
    logo?: string;
  };
}

export const ComprobantePDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobantePDFProps) => {
  const studentFull = `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`;
  
  return (
    <Document title={`Recibo - ${pago.numeroBoleta}`}>
      <Page size="A4" style={{ padding: 48, fontFamily: 'Helvetica' }}>
        {/* Watermark */}
        <Text style={styles.watermark}>PAGADO</Text>

        {/* Header */}
        <PageHeader
          title={institucion.nombre}
          subtitle={institucion.direccion || "Dirección de la Institución"}
          rightText="RECIBO DE PAGO"
          rightSubText={pago.numeroBoleta}
          variant="two-column"
          address={institucion.direccion}
          phone={institucion.telefono}
          email={institucion.ruc ? `RUC: ${institucion.ruc}` : undefined}
          marginBottom={20}
        />

        <Divider spacing="lg" />

        {/* Content */}
        <Stack direction="vertical" gap="lg">
          {/* Student Info */}
          <View>
            <Heading level={4} style={{ marginBottom: 10 }} color="primary">DATOS DEL ESTUDIANTE</Heading>
            <KeyValue
              size="sm"
              items={[
                { key: 'Estudiante', value: studentFull },
                { key: 'Código', value: estudiante.codigoEstudiante || 'N/A' },
                { key: 'Grado/Sección', value: estudiante.nivelAcademico 
                  ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
                  : "N/A" 
                },
              ]}
              direction="horizontal"
              divided
            />
          </View>

          {/* Payment Details */}
          <View>
            <Heading level={4} style={{ marginBottom: 10 }} color="primary">DETALLES DEL PAGO</Heading>
            <KeyValue
              size="sm"
              items={[
                { 
                  key: 'Fecha de Pago', 
                  value: new Date(pago.fechaPago).toLocaleDateString("es-PE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                },
                { key: 'Método de Pago', value: pago.metodoPago },
                { key: 'Referencia', value: pago.referenciaPago || '—' },
              ]}
              direction="horizontal"
              divided
            />
          </View>

          {/* Concepts Table */}
          <View>
            <Heading level={4} style={{ marginBottom: 10 }} color="primary">DETALLE DE CONCEPTOS</Heading>
            <Table variant="primary-header">
              <TableHeader>
                <TableRow header>
                  <TableCell width="80%">Descripción / Concepto</TableCell>
                  <TableCell width="20%" align="right">Monto</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell width="80%">{pago.concepto}</TableCell>
                  <TableCell width="20%" align="right">S/ {pago.monto.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </View>

          {/* Totals */}
          <Stack direction="horizontal" justify="end">
            <View style={styles.totalBox}>
              <KeyValue
                size="sm"
                items={[
                  { key: 'Subtotal', value: `S/ ${pago.monto.toFixed(2)}` },
                  { key: 'Mora / Otros', value: 'S/ 0.00' },
                ]}
                direction="horizontal"
                style={{ marginBottom: 4 }}
              />
              <View style={styles.grandTotalRow}>
                <Stack direction="horizontal" justify="between">
                  <Heading level={5} color="success">TOTAL PAGADO:</Heading>
                  <Heading level={5} color="success">S/ {pago.monto.toFixed(2)}</Heading>
                </Stack>
              </View>
            </View>
          </Stack>

          {/* Observations */}
          {pago.observaciones && (
            <View style={{ marginTop: 10, padding: 8, backgroundColor: '#f8fafc', borderRadius: 4 }}>
              <Heading level={6} style={{ marginBottom: 4 }}>OBSERVACIONES</Heading>
              <Text style={{ fontSize: 9, color: '#64748b' }}>{pago.observaciones}</Text>
            </View>
          )}

          {/* Signatures */}
          <Stack direction="horizontal" justify="around" style={styles.signatureContainer}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 8, color: '#64748b' }}>Recibí Conforme</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 8, color: '#64748b' }}>Caja / Tesorería</Text>
            </View>
          </Stack>
        </Stack>

        {/* Footer */}
        <PageFooter
          leftText="Comprobante de pago electrónico - Sistema Escolar Pro"
          rightText="Página {page} de {total}"
          variant="simple"
          fixed
          pagePadding={48}
        />
      </Page>
    </Document>
  );
};
