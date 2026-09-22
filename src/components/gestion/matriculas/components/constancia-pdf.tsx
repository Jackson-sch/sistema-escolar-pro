import React from "react";
import { Text as PdfText, View } from "@/lib/pdf";
import { DocumentWrapper } from "@/components/gestion/documentos/document-wrapper";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Card } from "@/components/pdfx/card/pdfx-card";
import { Signature } from "@/components/pdfx/signature/pdfx-signature";
import { formatTitleCase } from "@/lib/formats";

interface ConstanciaMatriculaPDFProps {
  enrollment: {
    id: string;
    anioAcademico: number;
    codigoMatricula?: string;
    estudiante: {
      name: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      dni: string;
      codigoEstudiante?: string;
    };
    nivelAcademico: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
    };
  };
  institucion: any;
  verificationCode?: string;
}

export const ConstanciaMatriculaPDF = ({
  enrollment,
  institucion,
  verificationCode,
}: ConstanciaMatriculaPDFProps) => {
  const studentFullName = formatTitleCase(
    `${enrollment.estudiante.apellidoPaterno} ${enrollment.estudiante.apellidoMaterno}, ${enrollment.estudiante.name}`
  );
  const today = new Date().toLocaleDateString("es-PE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const gradoStr = (enrollment.nivelAcademico?.grado?.nombre || "-").toUpperCase();
  const nivelStr = (enrollment.nivelAcademico?.nivel?.nombre || "-").toUpperCase();
  const seccionStr = (enrollment.nivelAcademico?.seccion || "-").toUpperCase();

  return (
    <DocumentWrapper
      title="Constancia Oficial de Matrícula"
      docTypeLabel={`AÑO ACADÉMICO ${enrollment.anioAcademico}`}
      docId={enrollment.estudiante.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      <Stack direction="vertical" gap="md" style={{ marginTop: 16, paddingHorizontal: 6 }}>
        {/* Párrafo de Certificación */}
        <PdfText style={{ fontSize: 10.5, textAlign: "justify", lineHeight: 1.55, color: "#1e293b" }}>
          La Dirección de la Institución Educativa{" "}
          <PdfText style={{ fontWeight: "bold", color: "#0f172a" }}>
            &quot;{(institucion.nombreInstitucion || institucion.nombre || "IE").toUpperCase()}&quot;
          </PdfText>
          , adscrita a la {institucion.ugel || "UGEL"} y {institucion.dre || "DRE"}, certifica que el estudiante detallado a continuación ha formalizado satisfactoriamente su proceso de matrícula:
        </PdfText>

        {/* Tarjeta de Filiación del Alumno */}
        <Card
          style={{
            marginVertical: 6,
            padding: 12,
            backgroundColor: "#f8fafc",
            borderLeftWidth: 4,
            borderLeftColor: "#2563eb",
            borderColor: "#cbd5e1",
            borderWidth: 1,
            borderRadius: 6,
          }}
        >
          <Heading level={3} noMargin style={{ fontSize: 12, color: "#0f172a", fontWeight: "bold" }}>
            {studentFullName}
          </Heading>
          <PdfText style={{ fontSize: 9, color: "#475569", marginTop: 3 }}>
            DOCUMENTO DE IDENTIDAD (DNI): <PdfText style={{ fontWeight: "bold", color: "#0f172a" }}>{enrollment.estudiante.dni}</PdfText>
            {enrollment.estudiante.codigoEstudiante ? ` • CÓDIGO SIAGIE: ${enrollment.estudiante.codigoEstudiante}` : ""}
          </PdfText>
        </Card>

        {/* Párrafo Descriptivo */}
        <PdfText style={{ fontSize: 10, textAlign: "justify", lineHeight: 1.5, color: "#1e293b" }}>
          El estudiante se encuentra en condición de <PdfText style={{ fontWeight: "bold", color: "#16a34a" }}>MATRICULADO OFICIALMENTE</PdfText> en el sistema de gestión y registros académicos para el <PdfText style={{ fontWeight: "bold" }}>Periodo Lectivo {enrollment.anioAcademico}</PdfText>, habiendo sido asignado a la siguiente vacante:
        </PdfText>

        {/* Bloque KeyValue de Ubicación Académica */}
        <View style={{ marginVertical: 6 }}>
          <Card
            style={{
              padding: 10,
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "#e2e8f0",
              borderRadius: 6,
            }}
          >
            <KeyValue
              direction="horizontal"
              size="sm"
              divided
              items={[
                { key: "Nivel Educativo:", value: `EDUCACIÓN ${nivelStr}` },
                { key: "Grado / Año:", value: gradoStr },
                { key: "Sección Asignada:", value: `"${seccionStr}"` },
                { key: "Año Académico:", value: `${enrollment.anioAcademico}` },
                { key: "Estado de Matrícula:", value: "DEFINITIVA / CONFORME" },
              ]}
            />
          </Card>
        </View>

        {/* Párrafo de Cierre */}
        <PdfText style={{ fontSize: 9.5, textAlign: "justify", lineHeight: 1.5, color: "#475569", marginTop: 6 }}>
          Se expide la presente constancia para acreditar la situación académica del estudiante ante los organismos o instituciones que lo requieran.
        </PdfText>

        {/* Fecha y Ciudad */}
        <PdfText style={{ marginTop: 12, textAlign: "right", fontSize: 9.5, color: "#475569" }}>
          {institucion.distrito || institucion.ciudad || "Lima"}, {today}
        </PdfText>

        {/* Bloque de Doble Firma Oficial (Dirección y Secretaría) */}
        <View style={{ marginTop: 32 }}>
          <Signature
            layout="double"
            signers={[
              {
                title: "DIRECCIÓN GENERAL",
                name: institucion.director || "DIRECCIÓN DE LA INSTITUCIÓN",
                subtitle: institucion.nombreInstitucion || "Institución Educativa",
              },
              {
                title: "SECRETARÍA ACADÉMICA",
                name: "DPTO. DE MATRÍCULAS Y REGISTRO",
                subtitle: "Sistema Escolar PRO",
              },
            ]}
          />
        </View>
      </Stack>
    </DocumentWrapper>
  );
};
