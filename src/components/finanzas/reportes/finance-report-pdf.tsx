"use client";

import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { PageHeader } from "@/components/pdfx/page-header/pdfx-page-header";
import { PageFooter } from "@/components/pdfx/page-footer/pdfx-page-footer";

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
    <Document title="Reporte Financiero">
      <Page size="A4" style={{ padding: 48, fontFamily: 'Helvetica' }}>
        {/* HEADER */}
        <PageHeader
          title="REPORTE FINANCIERO"
          subtitle="EduPeru Pro - Gestión Institucional"
          rightText="Estado de Caja"
          rightSubText={`Generado: ${data.fecha}`}
          variant="simple"
          marginBottom={30}
        />

        {/* KPIs */}
        <Stack direction="vertical" gap="lg">
          <View>
            <Heading level={3} style={{ marginBottom: 15 }}>Resumen Ejecutivo</Heading>
            <Stack direction="horizontal" gap="md" wrap>
              <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Heading level={6} color="mutedForeground" transform="uppercase">Total Proyectado</Heading>
                <Heading level={4} noMargin>{formatValue(data.totalProyectado)}</Heading>
              </View>
              <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Heading level={6} color="mutedForeground" transform="uppercase">Total Recaudado</Heading>
                <Heading level={4} noMargin color="success">{formatValue(data.totalReal)}</Heading>
              </View>
              <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Heading level={6} color="mutedForeground" transform="uppercase">Deuda Pendiente</Heading>
                <Heading level={4} noMargin color="destructive">{formatValue(data.totalDeuda)}</Heading>
              </View>
              <View style={{ width: '48%', backgroundColor: '#f8fafc', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Heading level={6} color="mutedForeground" transform="uppercase">Cumplimiento</Heading>
                <Heading level={4} noMargin color="accent">{data.cumplimiento.toFixed(1)}%</Heading>
              </View>
            </Stack>
          </View>

          <Divider />

          {/* TOP DEUDORES */}
          <View>
            <Heading level={3} style={{ marginBottom: 15 }}>Mayores Deudores</Heading>
            <Table variant="striped">
              <TableHeader>
                <TableRow header>
                  <TableCell width="50%">Estudiante</TableCell>
                  <TableCell width="20%" align="center">Cuotas</TableCell>
                  <TableCell width="30%" align="right">Monto Pendiente</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topDeudores.map((deudor, i) => (
                  <TableRow key={i}>
                    <TableCell width="50%">{deudor.nombre}</TableCell>
                    <TableCell width="20%" align="center">{deudor.cuotas}</TableCell>
                    <TableCell width="30%" align="right">{formatValue(deudor.deuda)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </View>

          {/* MORA INFO */}
          <View style={{ padding: 10, backgroundColor: '#fef2f2', borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#ef4444' }}>
             <Text style={{ fontSize: 9, color: "#991b1b" }}>
              * El monto de deuda pendiente incluye {formatValue(data.totalMora)} en moras acumuladas.
            </Text>
          </View>
        </Stack>

        {/* FOOTER */}
        <PageFooter
          leftText="Sistema Escolar Pro - Modulo de Finanzas"
          rightText="Página {page} de {total}"
          variant="simple"
          fixed
          pagePadding={48}
        />
      </Page>
    </Document>
  );
};
