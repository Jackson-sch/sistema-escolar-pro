import React from "react";
import { Text as PdfText, View } from "@/lib/pdf";
import { DocumentWrapper } from "./document-wrapper";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/pdfx/table/pdfx-table";
import { Card } from "@/components/pdfx/card/pdfx-card";
import { Badge } from "@/components/pdfx/badge/pdfx-badge";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Signature } from "@/components/pdfx/signature/pdfx-signature";
import { KeepTogether } from "@/components/pdfx/keep-together/pdfx-keep-together";
import { formatTitleCase } from "@/lib/formats";

interface BoletaNotasPDFProps {
  student: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    codigoEstudiante?: string;
    nivelAcademico: {
      grado: {
        nombre: string;
        nivel: { nombre: string };
      };
      seccion: string;
    };
  };
  notas: any[];
  periodoNombre: string;
  anioAcademico: number;
  institucion: any;
  verificationCode?: string;
}

function getLiteralVariant(literal?: string): "success" | "info" | "warning" | "destructive" | "default" {
  switch (literal) {
    case "AD":
      return "success";
    case "A":
      return "info";
    case "B":
      return "warning";
    case "C":
      return "destructive";
    default:
      return "default";
  }
}

export const BoletaNotasPDF = ({
  student,
  notas,
  periodoNombre,
  anioAcademico,
  institucion,
  verificationCode,
}: BoletaNotasPDFProps) => {
  const studentFull = formatTitleCase(
    `${student.apellidoPaterno || ""} ${student.apellidoMaterno || ""}, ${student.name || ""}`
  );
  const gradoNombre = student.nivelAcademico?.grado?.nombre || "-";
  const nivelNombre = student.nivelAcademico?.grado?.nivel?.nombre || "-";
  const seccion = student.nivelAcademico?.seccion || "-";


  return (
    <DocumentWrapper
      title="Boleta de Información del Estudiante"
      docTypeLabel={`Año Escolar ${anioAcademico}`}
      docId={student.codigoEstudiante || student.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      {/* ── 1. FICHA RESUMEN DEL ALUMNO ── */}
      <Card
        style={{
          marginVertical: 6,
          padding: 8,
          backgroundColor: "#f8fafc",
          borderWidth: 1,
          borderColor: "#cbd5e1",
          borderRadius: 6,
        }}
      >
        <Heading level={6} weight="bold" transform="uppercase" noMargin style={{ fontSize: 7, color: "#0f172a", marginBottom: 4 }}>
          Información Académica y Matrícula
        </Heading>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <View style={{ width: "50%", marginBottom: 3 }}>
            <PdfText style={{ fontSize: 5.5, color: "#64748b", fontWeight: "bold" }}>ESTUDIANTE:</PdfText>
            <PdfText style={{ fontSize: 7.5, fontWeight: "bold", color: "#0f172a", marginTop: 1 }}>{studentFull}</PdfText>
          </View>
          <View style={{ width: "50%", marginBottom: 3 }}>
            <PdfText style={{ fontSize: 5.5, color: "#64748b", fontWeight: "bold" }}>DNI / CÓDIGO SIAGIE:</PdfText>
            <PdfText style={{ fontSize: 7.5, fontWeight: "bold", color: "#0f172a", marginTop: 1 }}>
              {student.dni} {student.codigoEstudiante ? `/ ${student.codigoEstudiante}` : ""}
            </PdfText>
          </View>
          <View style={{ width: "50%" }}>
            <PdfText style={{ fontSize: 5.5, color: "#64748b", fontWeight: "bold" }}>NIVEL Y GRADO:</PdfText>
            <PdfText style={{ fontSize: 7, fontWeight: "bold", color: "#0f172a", marginTop: 1 }}>
              {nivelNombre.toUpperCase()} - {gradoNombre}
            </PdfText>
          </View>
          <View style={{ width: "50%" }}>
            <PdfText style={{ fontSize: 5.5, color: "#64748b", fontWeight: "bold" }}>SECCIÓN Y PERIODO:</PdfText>
            <PdfText style={{ fontSize: 7, fontWeight: "bold", color: "#2563eb", marginTop: 1 }}>
              {`SECCIÓN "${seccion}" • ${periodoNombre.toUpperCase()}`}
            </PdfText>
          </View>
        </View>
      </Card>

      {/* ── 2. TABLA OFICIAL DE CALIFICACIONES POR COMPETENCIA ── */}
      <View style={{ marginVertical: 4 }}>
        <Heading level={6} weight="bold" transform="uppercase" noMargin style={{ fontSize: 7, color: "#0f172a", marginBottom: 3 }}>
          Resultados Académicos por Área y Competencia
        </Heading>

        <Table variant="grid" zebraStripe style={{ fontSize: 6.5 }}>
          <TableHeader>
            <TableRow style={{ backgroundColor: "#0f172a" }}>
              <TableCell header style={{ width: "28%", color: "#ffffff", fontWeight: "bold", fontSize: 6.5, padding: 3.5 }}>
                ÁREA CURRICULAR
              </TableCell>
              <TableCell header style={{ width: "54%", color: "#ffffff", fontWeight: "bold", fontSize: 6.5, padding: 3.5 }}>
                COMPETENCIA EVALUADA
              </TableCell>
              <TableCell header align="center" style={{ width: "18%", color: "#ffffff", fontWeight: "bold", fontSize: 6.5, padding: 3.5 }}>
                CALIFICACIÓN
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notas.map((n) => {
              const variant = getLiteralVariant(n.notaLiteral);
              return (
                <TableRow key={`${n.area}-${n.competencia}`} style={{ minHeight: 18 }}>
                  <TableCell style={{ width: "28%", fontWeight: "bold", color: "#0f172a", padding: 3 }}>
                    {n.area}
                  </TableCell>
                  <TableCell style={{ width: "54%", color: "#334155", padding: 3, fontSize: 6 }}>
                    {n.competencia}
                  </TableCell>
                  <TableCell align="center" style={{ width: "18%", padding: 2 }}>
                    <Badge
                      variant={variant}
                      size="sm"
                      label={`${n.valor !== undefined && n.valor !== null ? `${Math.round(n.valor)} - ` : ""}${n.notaLiteral || "-"}`}
                      style={{ fontSize: 6.5, fontWeight: "bold" }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </View>

      {/* ── 3. APRECIACIÓN DEL TUTOR & FIRMAS OFICIALES (EN 1 BLOQUE) ── */}
      <KeepTogether>
        <Card
          style={{
            marginVertical: 4,
            padding: 6,
            backgroundColor: "#ffffff",
            borderWidth: 1,
            borderColor: "#e2e8f0",
            borderRadius: 5,
          }}
        >
          <Heading level={6} weight="bold" transform="uppercase" noMargin style={{ fontSize: 6.5, color: "#475569", marginBottom: 2 }}>
            Apreciación del Tutor / Observaciones Descriptivas:
          </Heading>
          <PdfText style={{ fontSize: 6, color: "#64748b", fontStyle: "italic", lineHeight: 1.3 }}>
            El(la) estudiante demuestra compromiso y evolución constante en el desarrollo de las competencias programadas para el periodo. Continuar reforzando los hábitos de lectura y estudio autónomo.
          </PdfText>
        </Card>

        {/* Firmas Oficiales */}
        <View style={{ marginTop: 12 }}>
          <Signature
            layout="double"
            signers={[
              {
                title: "FIRMA DEL DOCENTE TUTOR",
                name: "DOCENTE DE AULA",
                subtitle: "Tutoría y Convivencia Escolar",
              },
              {
                title: "FIRMA DE LA DIRECCIÓN",
                name: institucion.director || "DIRECCIÓN GENERAL",
                subtitle: institucion.nombreInstitucion || "Institución Educativa",
              },
            ]}
          />
        </View>
      </KeepTogether>
    </DocumentWrapper>
  );
};
