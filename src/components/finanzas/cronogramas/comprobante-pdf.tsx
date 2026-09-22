import React from "react";
import { Document, Page, Text, StyleSheet, View } from "@/lib/pdf";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { PageHeader } from "@/components/pdfx/page-header/pdfx-page-header";
import { PageFooter } from "@/components/pdfx/page-footer/pdfx-page-footer";
import { Badge } from "@/components/pdfx/badge/pdfx-badge";
import { Signature } from "@/components/pdfx/signature/pdfx-signature";
import { toTitleCase } from "@/lib/utils";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  watermark: {
    position: "absolute",
    top: "38%",
    left: "12%",
    fontSize: 70,
    fontWeight: "bold",
    color: "#0f172a08",
    transform: "rotate(-30deg)",
    letterSpacing: 18,
    fontFamily: "Helvetica-Bold",
  },
  mainCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#f8fafc",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
    paddingLeft: 8,
  },
  totalContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  grandTotal: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderTopColor: "#0f172a",
  },
});

interface ComprobantePDFProps {
  pago: {
    numeroBoleta: string;
    fechaPago: Date | string;
    monto: number;
    metodoPago: string;
    referenciaPago?: string;
    concepto?: string;
    observaciones?: string;
    montoRecibido?: number;
    vuelto?: number;
    items?: Array<{
      concepto: string;
      monto: number;
      mes?: number;
    }>;
  };
  estudiante: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    codigoEstudiante?: string;
    dni?: string | null;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    } | null;
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

function buildSubHeader(institucion: ComprobantePDFProps["institucion"]): string | undefined {
  const parts = [
    institucion.lema ? `"${institucion.lema}"` : null,
    institucion.dre ? `DRE: ${institucion.dre}` : null,
    institucion.ugel ? `UGEL: ${institucion.ugel}` : null,
    institucion.ruc ? `CÓD. MODULAR: ${institucion.ruc}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" | ") : institucion.direccion;
}

function ComprobanteEstudianteCard({
  estudiante,
  studentFull,
}: {
  estudiante: ComprobantePDFProps["estudiante"];
  studentFull: string;
}) {
  const gradoSeccion = estudiante.nivelAcademico
    ? `${estudiante.nivelAcademico.nivel.nombre} - ${estudiante.nivelAcademico.grado.nombre} "${estudiante.nivelAcademico.seccion}"`
    : "N/A";

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sectionHeader}>
        <Heading level={5} color="primary" weight="bold" noMargin style={{ fontSize: 9 }}>
          DATOS DEL ESTUDIANTE
        </Heading>
      </View>
      <KeyValue
        size="sm"
        items={[
          { key: "Estudiante:", value: studentFull },
          { key: "DNI:", value: estudiante.dni || "N/A" },
          { key: "Código SIAGIE:", value: estudiante.codigoEstudiante || "N/A" },
          { key: "Grado / Sección:", value: gradoSeccion },
        ]}
      />
    </View>
  );
}

function ComprobanteOperacionCard({ pago }: { pago: ComprobantePDFProps["pago"] }) {
  const fechaEmision = new Date(pago.fechaPago).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.sectionHeader}>
        <Heading level={5} color="primary" weight="bold" noMargin style={{ fontSize: 9 }}>
          DETALLES DE LA OPERACIÓN
        </Heading>
      </View>
      <KeyValue
        size="sm"
        items={[
          { key: "Fecha de Emisión:", value: fechaEmision },
          { key: "Medio de Pago:", value: pago.metodoPago },
          { key: "N° Operación / Ref:", value: pago.referenciaPago || "Cobro en Ventanilla" },
          { key: "Moneda:", value: "Soles (S/ PEN)" },
        ]}
      />
    </View>
  );
}

function ComprobanteConceptosTable({
  items,
  pago,
}: {
  items: ComprobantePDFProps["pago"]["items"];
  pago: ComprobantePDFProps["pago"];
}) {
  return (
    <View style={{ marginTop: 4 }}>
      <View style={styles.sectionHeader}>
        <Heading level={5} color="primary" weight="bold" noMargin style={{ fontSize: 9 }}>
          DESGLOSE DE CONCEPTOS COBRADOS
        </Heading>
      </View>
      <Table variant="grid" zebraStripe style={{ fontSize: 8 }}>
        <TableHeader>
          <TableRow style={{ backgroundColor: "#0f172a" }}>
            <TableCell header style={{ width: "12%", color: "#ffffff", fontWeight: "bold", fontSize: 7, padding: 4 }}>
              ITEM
            </TableCell>
            <TableCell header style={{ width: "66%", color: "#ffffff", fontWeight: "bold", fontSize: 7, padding: 4 }}>
              DESCRIPCIÓN DEL CONCEPTO
            </TableCell>
            <TableCell header align="right" style={{ width: "22%", color: "#ffffff", fontWeight: "bold", fontSize: 7, padding: 4 }}>
              IMPORTE (S/)
            </TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items && items.length > 0 ? (
            items.map((it, idx) => (
              <TableRow key={`${it.concepto}-${it.mes ?? ""}-${it.monto}`} style={{ minHeight: 18 }}>
                <TableCell align="center" style={{ width: "12%", padding: 4, color: "#64748b" }}>
                  {idx + 1}
                </TableCell>
                <TableCell style={{ width: "66%", padding: 4, fontWeight: "bold", color: "#0f172a" }}>
                  {it.concepto}
                </TableCell>
                <TableCell align="right" style={{ width: "22%", padding: 4, fontWeight: "bold", color: "#0f172a" }}>
                  S/ {Number(it.monto).toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow style={{ minHeight: 18 }}>
              <TableCell align="center" style={{ width: "12%", padding: 4, color: "#64748b" }}>
                1
              </TableCell>
              <TableCell style={{ width: "66%", padding: 4, fontWeight: "bold", color: "#0f172a" }}>
                {pago.concepto || "Servicio Educativo"}
              </TableCell>
              <TableCell align="right" style={{ width: "22%", padding: 4, fontWeight: "bold", color: "#0f172a" }}>
                S/ {Number(pago.monto).toFixed(2)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </View>
  );
}

export const ComprobantePDF = ({
  pago,
  estudiante,
  institucion,
}: ComprobantePDFProps) => {
  const studentFull = toTitleCase(
    `${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}, ${estudiante.name}`,
  );
  const institucionNombre = toTitleCase(institucion.nombre);
  const subHeader = buildSubHeader(institucion);

  return (
    <Document title={`Comprobante - ${pago.numeroBoleta}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.watermark}>RECIBO CONFORME</Text>

        <PageHeader
          title={institucionNombre}
          subtitle={subHeader}
          rightText="RECIBO DE PAGO"
          rightSubText={`N° ${pago.numeroBoleta}`}
          variant="two-column"
          address={institucion.direccion}
          phone={institucion.telefono ? `Tel: ${institucion.telefono}` : undefined}
          email={institucion.email ? `Email: ${institucion.email}` : undefined}
          marginBottom={14}
          logo={institucion.logo}
        />

        <Stack direction="horizontal" justify="end" style={{ marginBottom: 12 }}>
          <Badge variant="success" size="md">
            PAGO CONFORME • REGISTRADO
          </Badge>
        </Stack>

        <Stack direction="vertical" gap="md">
          <View style={styles.mainCard}>
            <Stack direction="horizontal" gap="lg">
              <ComprobanteEstudianteCard estudiante={estudiante} studentFull={studentFull} />
              <ComprobanteOperacionCard pago={pago} />
            </Stack>
          </View>

          <ComprobanteConceptosTable items={pago.items} pago={pago} />

          {/* Resumen de Totales */}
          <Stack direction="horizontal" justify="end" style={{ marginTop: 2 }}>
            <View style={styles.totalContainer}>
              <KeyValue
                size="sm"
                items={[
                  { key: "Subtotal Recibido:", value: `S/ ${Number(pago.monto).toFixed(2)}` },
                  { key: "Recargos / Moras:", value: "S/ 0.00" },
                  { key: "Descuentos:", value: "S/ 0.00" },
                ]}
                style={{ width: 190 }}
              />
              <View style={styles.grandTotal}>
                <Stack direction="horizontal" justify="between">
                  <Heading level={4} weight="bold" noMargin style={{ fontSize: 11, color: "#0f172a" }}>
                    TOTAL PAGADO:
                  </Heading>
                  <Heading level={4} weight="bold" noMargin style={{ fontSize: 11, color: "#16a34a" }}>
                    S/ {Number(pago.monto).toFixed(2)}
                  </Heading>
                </Stack>
              </View>
            </View>
          </Stack>

          {pago.observaciones && (
            <View
              style={{
                marginTop: 2,
                padding: 8,
                backgroundColor: "#f8fafc",
                borderRadius: 6,
                borderLeftWidth: 3,
                borderLeftColor: "#64748b",
                borderWidth: 1,
                borderColor: "#e2e8f0",
              }}
            >
              <Text style={{ fontSize: 6.5, fontWeight: "bold", color: "#475569", marginBottom: 2 }}>
                OBSERVACIONES:
              </Text>
              <Text style={{ fontSize: 7.5, color: "#1e293b", lineHeight: 1.3 }}>
                {pago.observaciones}
              </Text>
            </View>
          )}

          <View style={{ marginTop: 24 }}>
            <Signature
              layout="double"
              signers={[
                {
                  title: "RECIBÍ CONFORME",
                  name: "PADRE / MADRE / APODERADO",
                  subtitle: "Firma del Titular de Pago",
                },
                {
                  title: "CAJA Y TESORERÍA",
                  name: "DEPARTAMENTO DE RECAUDACIÓN",
                  subtitle: institucionNombre,
                },
              ]}
            />
          </View>
        </Stack>

        <PageFooter
          leftText="Comprobante de pago electrónico emitido conforme a las directivas de tesorería escolar."
          rightText="Sistema Escolar PRO"
          variant="simple"
          fixed
          pagePadding={36}
        />
      </Page>
    </Document>
  );
};
