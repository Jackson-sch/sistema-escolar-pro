import { Document, Page, Text, StyleSheet, View } from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { PageHeader } from "@/components/pdfx/page-header/pdfx-page-header";
import { PageFooter } from "@/components/pdfx/page-footer/pdfx-page-footer";
import { Badge as PdfxBadge } from "@/components/pdfx/badge/pdfx-badge";
import { toTitleCase } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  watermark: {
    position: "absolute",
    top: "35%",
    left: "10%",
    fontSize: 90,
    fontWeight: "bold",
    color: "#10b98108",
    transform: "rotate(-35deg)",
    letterSpacing: 25,
    fontFamily: "Helvetica-Bold",
  },
  mainCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 20,
    backgroundColor: "#fcfdfe",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0f172a",
    paddingLeft: 10,
  },
  totalContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  grandTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    borderStyle: "dashed",
  },
  signatureArea: {
    marginTop: 60,
  },
  signatureBox: {
    width: 180,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    marginBottom: 8,
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
    dre?: string;
    ugel?: string;
    lema?: string;
    email?: string;
  };
}

export const ComprobantePDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobantePDFProps) => {
  const studentFull = toTitleCase(`${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`);
  const institucionNombre = toTitleCase(institucion.nombre);
  
  const subHeaderParts = [
    institucion.lema ? `"${institucion.lema}"` : null,
    institucion.dre ? `DRE: ${institucion.dre}` : null,
    institucion.ugel ? `UGEL: ${institucion.ugel}` : null,
    institucion.ruc ? `CÓD. MODULAR: ${institucion.ruc}` : null,
  ].filter(Boolean);

  const subHeader = subHeaderParts.length > 0 
    ? subHeaderParts.join(' | ') 
    : institucion.direccion;
  
  return (
    <Document title={`Recibo - ${pago.numeroBoleta}`}>
      <Page size="A4" style={styles.page}>
        {/* Watermark de Fondo */}
        <Text style={styles.watermark}>DOCUMENTO OFICIAL</Text>

        {/* Cabecera Premium Estandarizada */}
        <PageHeader
          title={institucionNombre}
          subtitle={subHeader}
          rightText="RECIBO DE PAGO"
          rightSubText={pago.numeroBoleta}
          variant="two-column"
          address={institucion.direccion}
          phone={institucion.telefono ? `Teléfono: ${institucion.telefono}` : undefined}
          email={institucion.email ? `Email: ${institucion.email}` : undefined}
          marginBottom={20}
          logo={institucion.logo}
        />
        
        {/* Dirección secundaria si hay subheader informativo */}
        {subHeaderParts.length > 0 && (
          <Text style={{ fontSize: 7, color: '#64748b', marginTop: -15, marginBottom: 20, textAlign: 'left' }}>
            {institucion.direccion}
          </Text>
        )}

        {/* Estado del Documento */}
        <Stack direction="horizontal" justify="end" style={{ marginBottom: 20 }}>
          <PdfxBadge label="PAGO COMPLETADO" variant="success" size="lg" />
        </Stack>

        <Stack direction="vertical" gap="xl">
          {/* Tarjeta de Información Principal */}
          <View style={styles.mainCard}>
            <Stack direction="horizontal" gap="xl">
              {/* Columna Estudiante */}
              <View style={{ flex: 1 }}>
                <View style={styles.sectionHeader}>
                  <Heading level={5} color="primary" weight="bold">DATOS DEL ESTUDIANTE</Heading>
                </View>
                <KeyValue
                  size="sm"
                  items={[
                    { key: 'Estudiante', value: studentFull},
                    { key: 'Código', value: estudiante.codigoEstudiante || 'N/A' },
                    { key: 'Nivel', value: estudiante.nivelAcademico?.nivel.nombre || 'N/A' },
                    { key: 'Grado/Secc.', value: estudiante.nivelAcademico 
                      ? `${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
                      : "N/A" 
                    },
                  ]}
                />
              </View>

              {/* Columna Pago */}
              <View style={{ flex: 1 }}>
                <View style={styles.sectionHeader}>
                  <Heading level={5} color="primary" weight="bold">DETALLES DE OPERACIÓN</Heading>
                </View>
                <KeyValue
                  size="sm"
                  items={[
                    { 
                      key: 'Fecha Pago', 
                      value: new Date(pago.fechaPago).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    },
                    { key: 'Medio Pago', value: pago.metodoPago },
                    { key: 'Referencia', value: pago.referenciaPago || 'Operación Directa' },
                  ]}
                />
              </View>
            </Stack>
          </View>

          {/* Tabla de Conceptos Elevada */}
          <View>
            <View style={styles.sectionHeader}>
              <Heading level={5} color="primary" weight="bold">DETALLE DE CONCEPTOS</Heading>
            </View>
            <Table variant="primary-header">
              <TableHeader>
                <TableRow header>
                  <TableCell width="15%" align="center">Cant.</TableCell>
                  <TableCell width="65%">Descripción del Concepto</TableCell>
                  <TableCell width="20%" align="right">Monto Unit.</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell width="15%" align="center">1</TableCell>
                  <TableCell width="65%" >{pago.concepto}</TableCell>
                  <TableCell width="20%" align="right">S/ {pago.monto.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </View>

          {/* Resumen de Totales */}
          <Stack direction="horizontal" justify="end">
            <View style={styles.totalContainer}>
              <KeyValue
                size="sm"
                items={[
                  { key: 'Subtotal Recibido', value: `S/ ${pago.monto.toFixed(2)}` },
                  { key: 'Recargos / Mora', value: 'S/ 0.00' },
                  { key: 'Descuentos', value: 'S/ 0.00' },
                ]}
                style={{ width: 180 }}
              />
              <View style={styles.grandTotal}>
                <Stack direction="horizontal" justify="between">
                  <Heading level={4} color="success" weight="bold">TOTAL:</Heading>
                  <Heading level={4} color="success" weight="bold">S/ {pago.monto.toFixed(2)}</Heading>
                </Stack>
              </View>
            </View>
          </Stack>

          {/* Observaciones */}
          {pago.observaciones && (
            <View style={{ marginTop: 5, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#64748b' }}>
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 4, letterSpacing: 0.5 }}>NOTAS ADICIONALES:</Text>
              <Text style={{ fontSize: 9, color: '#1e293b', lineHeight: 1.4 }}>{pago.observaciones}</Text>
            </View>
          )}

          {/* Área de Firmas Estilizada */}
          <Stack direction="horizontal" justify="around" style={styles.signatureArea}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 2 }}>RECIBÍ CONFORME</Text>
              <Text style={{ fontSize: 7, color: '#94a3b8' }}>Firma del Estudiante / Apoderado</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#475569', marginBottom: 2 }}>CAJA / ADMINISTRACIÓN</Text>
              <Text style={{ fontSize: 7, color: '#94a3b8' }}>{institucionNombre}</Text>
            </View>
          </Stack>
        </Stack>

        {/* Footer de Página */}
        <PageFooter
          leftText="Comprobante de pago electrónico generado por Sistema Escolar Pro"
          rightText="Página {page} de {total}"
          variant="simple"
          fixed
          pagePadding={40}
        />
      </Page>
    </Document>
  );
};
