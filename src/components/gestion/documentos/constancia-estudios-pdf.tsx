import React from "react";
import { Text as PdfText, View } from "@/lib/pdf";
import { DocumentWrapper } from "./document-wrapper";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { Card } from "@/components/pdfx/card/pdfx-card";
import { KeyValue } from "@/components/pdfx/key-value/pdfx-key-value";
import { Signature } from "@/components/pdfx/signature/pdfx-signature";
import { formatTitleCase } from "@/lib/formats";

interface ConstanciaEstudiosPDFProps {
  student: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    codigoEstudiante?: string;
    nivelAcademico: {
      grado: { nombre: string };
      seccion: string;
      nivel: { nombre: string };
    };
  };
  anioAcademico: number;
  institucion: any;
  verificationCode?: string;
}

export const ConstanciaEstudiosPDF = ({
  student,
  anioAcademico,
  institucion,
  verificationCode,
}: ConstanciaEstudiosPDFProps) => {
  const studentFull = formatTitleCase(
    `${student.apellidoPaterno} ${student.apellidoMaterno}, ${student.name}`
  );
  const date = new Date();
  const dateStr = `${date.getDate()} de ${date.toLocaleString("es-PE", {
    month: "long",
  })} de ${date.getFullYear()}`;

  const gradoStr = (student.nivelAcademico?.grado?.nombre || "-").toUpperCase();
  const nivelStr = (student.nivelAcademico?.nivel?.nombre || "-").toUpperCase();
  const seccionStr = (student.nivelAcademico?.seccion || "-").toUpperCase();

  return (
    <DocumentWrapper
      title="Constancia de Estudios"
      docTypeLabel={`EXP. OFICIAL ${anioAcademico}`}
      docId={student.dni}
      institucion={institucion}
      verificationCode={verificationCode}
    >
      <Stack direction="vertical" gap="md" style={{ marginTop: 18, paddingHorizontal: 6 }}>
        {/* Párrafo de Certificación Inicial */}
        <PdfText
          style={{
            fontSize: 10.5,
            textAlign: "justify",
            lineHeight: 1.6,
            color: "#1e293b",
          }}
        >
          EL QUE SUSCRIBE, DIRECTOR(A) DE LA INSTITUCIÓN EDUCATIVA{" "}
          <PdfText style={{ fontWeight: "bold", color: "#0f172a" }}>
            &quot;{(institucion.nombreInstitucion || institucion.nombre || "IE").toUpperCase()}&quot;
          </PdfText>
          , EN CUMPLIMIENTO DE LAS NORMAS TÉCNICAS Y LEGALES VIGENTES DEL MINISTERIO DE EDUCACIÓN, HACE CONSTAR QUE:
        </PdfText>

        {/* Párrafo de Filiación del Alumno */}
        <PdfText
          style={{
            fontSize: 10.5,
            textAlign: "justify",
            lineHeight: 1.6,
            color: "#1e293b",
          }}
        >
          El(la) estudiante{" "}
          <PdfText style={{ fontWeight: "bold", color: "#0f172a", fontSize: 11 }}>
            {studentFull}
          </PdfText>
          , identificado(a) con Documento Nacional de Identidad N°{" "}
          <PdfText style={{ fontWeight: "bold", color: "#0f172a" }}>{student.dni}</PdfText>
          {student.codigoEstudiante
            ? ` y Código de Estudiante SIAGIE N° ${student.codigoEstudiante}`
            : ""}
          , se encuentra regular y debidamente matriculado(a) en este centro de estudios, cursando satisfactoriamente el:
        </PdfText>

        {/* Tarjeta Destacada de Ubicación Académica */}
        <Card
          style={{
            marginVertical: 10,
            padding: 14,
            backgroundColor: "#f8fafc",
            borderWidth: 1,
            borderColor: "#cbd5e1",
            borderLeftWidth: 4,
            borderLeftColor: "#2563eb",
            borderRadius: 6,
          }}
        >
          <Heading
            level={3}
            align="center"
            weight="bold"
            noMargin
            style={{ fontSize: 13, color: "#0f172a", letterSpacing: 0.5 }}
          >
            {gradoStr} DE EDUCACIÓN {nivelStr}
          </Heading>
          <Heading
            level={5}
            align="center"
            weight="bold"
            noMargin
            style={{ fontSize: 10.5, color: "#2563eb", marginTop: 4 }}
          >
            SECCIÓN: &quot;{seccionStr}&quot; • AÑO LECTIVO {anioAcademico}
          </Heading>
        </Card>

        {/* Detalle Técnico de Respaldo */}
        <View style={{ marginVertical: 4 }}>
          <KeyValue
            direction="horizontal"
            size="sm"
            divided
            items={[
              { key: "Nivel Educativo:", value: nivelStr },
              { key: "Grado y Sección:", value: `${gradoStr} "${seccionStr}"` },
              { key: "Año Académico:", value: `${anioAcademico}` },
              { key: "Condición del Alumno:", value: "MATRICULADO / ACTIVO" },
            ]}
          />
        </View>

        {/* Párrafo de Cierre y Validez */}
        <PdfText
          style={{
            fontSize: 10,
            textAlign: "justify",
            lineHeight: 1.6,
            color: "#334155",
            marginTop: 8,
          }}
        >
          Se expide la presente constancia de estudios a solicitud verbal de la parte interesada,
          para los fines administrativos y legales que estime pertinentes.
        </PdfText>

        {/* Fecha y Lugar */}
        <PdfText
          style={{
            marginTop: 16,
            textAlign: "right",
            fontSize: 10,
            color: "#475569",
            fontWeight: "medium",
          }}
        >
          {institucion.ciudad || "Lima"}, {dateStr}
        </PdfText>

        {/* Bloque de Firma Oficial del Director */}
        <View style={{ marginTop: 40, alignItems: "center" }}>
          <Signature
            signers={[
              {
                title: "DIRECCIÓN GENERAL",
                name: institucion.director || "DIRECCIÓN DE LA INSTITUCIÓN",
                subtitle: institucion.nombreInstitucion || "Institución Educativa",
              },
            ]}
            layout="single"
          />
        </View>
      </Stack>
    </DocumentWrapper>
  );
};
