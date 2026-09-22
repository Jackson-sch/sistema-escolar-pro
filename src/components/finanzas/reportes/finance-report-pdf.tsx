"use client";

import React from "react";
import { Document, Page, Text as PdfText, View } from "@/lib/pdf";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Card } from "@/components/pdfx/card/pdfx-card";
import { Badge } from "@/components/pdfx/badge/pdfx-badge";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { PageHeader } from "@/components/pdfx/page-header/pdfx-page-header";
import { PageFooter } from "@/components/pdfx/page-footer/pdfx-page-footer";
import { Signature } from "@/components/pdfx/signature/pdfx-signature";
import { toTitleCase } from "@/lib/utils";

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
  institucion: {
    nombreInstitucion: string;
    direccion?: string;
    telefono?: string;
    codigoModular?: string;
    dre?: string;
    ugel?: string;
    logo?: string;
    lema?: string;
    email?: string;
  };
}

const formatValue = (val: number) =>
  `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

export const FinanceReportPDF = ({ data, institucion }: FinanceReportPDFProps) => {

  const institucionNombre = toTitleCase(institucion.nombreInstitucion);

  const subHeaderParts = [
    institucion.lema ? `"${institucion.lema}"` : null,
    institucion.dre ? `DRE: ${institucion.dre}` : null,
    institucion.ugel ? `UGEL: ${institucion.ugel}` : null,
    institucion.codigoModular ? `CÓD. MODULAR: ${institucion.codigoModular}` : null,
  ].filter(Boolean);

  const subHeader =
    subHeaderParts.length > 0 ? subHeaderParts.join(" | ") : institucion.direccion;

  return (
    <Document title="Reporte Ejecutivo Financiero">
      <Page size="A4" style={{ padding: 40, fontFamily: "Helvetica", backgroundColor: "#ffffff" }}>
        {/* CABECERA ESTANDARIZADA */}
        <PageHeader
          title={institucionNombre}
          subtitle={subHeader}
          rightText="REPORTE EJECUTIVO"
          rightSubText={`Generado: ${data.fecha}`}
          variant="two-column"
          address={institucion.direccion}
          phone={institucion.telefono ? `Tel: ${institucion.telefono}` : undefined}
          email={institucion.email ? `Email: ${institucion.email}` : undefined}
          marginBottom={14}
          logo={institucion.logo}
        />

        <Stack direction="vertical" gap="md">
          {/* ── 1. RESUMEN EJECUTIVO (4 KPI CARDS) ── */}
          <View>
            <Heading level={4} weight="bold" style={{ marginBottom: 8, fontSize: 10, color: "#0f172a" }}>
              RESUMEN EJECUTIVO DE TESORERÍA Y COBRANZAS
            </Heading>
            <Stack direction="horizontal" gap="sm" wrap>
              <Card style={{ width: "48.5%", padding: 10, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#cbd5e1" }}>
                <Heading level={6} color="mutedForeground" transform="uppercase" noMargin style={{ fontSize: 7 }}>
                  Total Proyectado
                </Heading>
                <Heading level={3} noMargin style={{ fontSize: 13, marginTop: 3, color: "#0f172a", fontWeight: "bold" }}>
                  {formatValue(data.totalProyectado)}
                </Heading>
              </Card>

              <Card style={{ width: "48.5%", padding: 10, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0" }}>
                <Heading level={6} color="mutedForeground" transform="uppercase" noMargin style={{ fontSize: 7 }}>
                  Total Recaudado (Efectivo / Bancos)
                </Heading>
                <Heading level={3} noMargin style={{ fontSize: 13, marginTop: 3, color: "#16a34a", fontWeight: "bold" }}>
                  {formatValue(data.totalReal)}
                </Heading>
              </Card>

              <Card style={{ width: "48.5%", padding: 10, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca" }}>
                <Heading level={6} color="mutedForeground" transform="uppercase" noMargin style={{ fontSize: 7 }}>
                  Deuda Pendiente de Cobro
                </Heading>
                <Heading level={3} noMargin style={{ fontSize: 13, marginTop: 3, color: "#dc2626", fontWeight: "bold" }}>
                  {formatValue(data.totalDeuda)}
                </Heading>
              </Card>

              <Card style={{ width: "48.5%", padding: 10, backgroundColor: "#eff6ff", borderWidth: 1, borderColor: "#bfdbfe" }}>
                <Heading level={6} color="mutedForeground" transform="uppercase" noMargin style={{ fontSize: 7 }}>
                  Ratio de Cobranza / Cumplimiento
                </Heading>
                <Heading level={3} noMargin style={{ fontSize: 13, marginTop: 3, color: "#2563eb", fontWeight: "bold" }}>
                  {data.cumplimiento.toFixed(1)}%
                </Heading>
              </Card>
            </Stack>
          </View>

          <Divider spacing="sm" />

          {/* ── 2. TABLA DE MAYORES CUOTAS PENDIENTES ── */}
          <View>
            <Heading level={4} weight="bold" style={{ marginBottom: 6, fontSize: 10, color: "#0f172a" }}>
              Seguimiento de Principales Saldos Pendientes
            </Heading>
            <Table variant="grid" zebraStripe style={{ fontSize: 7.5 }}>
              <TableHeader>
                <TableRow style={{ backgroundColor: "#0f172a" }}>
                  <TableCell header style={{ width: "50%", color: "#ffffff", fontWeight: "bold", padding: 4 }}>
                    ESTUDIANTE
                  </TableCell>
                  <TableCell header align="center" style={{ width: "20%", color: "#ffffff", fontWeight: "bold", padding: 4 }}>
                    CUOTAS VENCIDAS
                  </TableCell>
                  <TableCell header align="right" style={{ width: "30%", color: "#ffffff", fontWeight: "bold", padding: 4 }}>
                    SALDO PENDIENTE
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topDeudores.length > 0 ? (
                  data.topDeudores.map((deudor) => (
                    <TableRow key={deudor.id ?? `${deudor.nombre}-${deudor.cuotas}-${deudor.deuda}`} style={{ minHeight: 18 }}>
                      <TableCell style={{ width: "50%", padding: 4, fontWeight: "bold", color: "#0f172a" }}>
                        {deudor.nombre}
                      </TableCell>
                      <TableCell align="center" style={{ width: "20%", padding: 3 }}>
                        <Badge
                          variant="warning"
                          size="sm"
                          label={`${deudor.cuotas} cuota${deudor.cuotas > 1 ? "s" : ""}`}
                        />
                      </TableCell>
                      <TableCell align="right" style={{ width: "30%", padding: 4, fontWeight: "bold", color: "#dc2626" }}>
                        {formatValue(deudor.deuda)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell style={{ width: "100%", padding: 8, textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>
                      ✓ No se registran deudas pendientes críticas en este periodo.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </View>

          {/* NOTA DE MORA */}
          {data.totalMora > 0 && (
            <View
              style={{
                padding: 8,
                backgroundColor: "#fffbeb",
                borderRadius: 6,
                borderLeftWidth: 3,
                borderLeftColor: "#f59e0b",
                borderWidth: 1,
                borderColor: "#fef3c7",
              }}
            >
              <PdfText style={{ fontSize: 7.5, color: "#92400e" }}>
                * La deuda pendiente acumulada incluye <strong>{formatValue(data.totalMora)}</strong> por concepto de moras y recargos diarios.
              </PdfText>
            </View>
          )}

          {/* ── 3. FIRMAS DE AUDITORÍA Y TESORERÍA ── */}
          <View style={{ marginTop: 24 }}>
            <Signature
              layout="double"
              signers={[
                {
                  title: "RESPONSABLE DE TESORERÍA",
                  name: "DEPARTAMENTO FINANCIERO",
                  subtitle: institucionNombre,
                },
                {
                  title: "DIRECCIÓN GENERAL",
                  name: "AUDITORÍA INTERNA",
                  subtitle: "Sistema Escolar PRO",
                },
              ]}
            />
          </View>
        </Stack>

        {/* FOOTER */}
        <PageFooter
          leftText="Reporte Ejecutivo de Cobranzas y Balance General"
          rightText="Página {page} de {total}"
          variant="simple"
          fixed
          pagePadding={40}
        />
      </Page>
    </Document>
  );
};
