import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";
import { Heading } from "@/components/pdfx/heading/pdfx-heading";
import { Stack } from "@/components/pdfx/stack/pdfx-stack";
import { Divider } from "@/components/pdfx/divider/pdfx-divider";

// Dimensiones estándar CR80 (85.6mm x 53.98mm) convertidas a puntos
const CARD_WIDTH = 242.6; // ~85.6mm
const CARD_HEIGHT = 153; // ~54mm

interface StudentCardPDFProps {
  student: {
    name: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    dni: string;
    image?: string | null;
    nivelAcademico?: {
      seccion: string;
      grado: { nombre: string };
      nivel: { nombre: string };
      sede?: { nombre: string } | null;
    } | null;
  };
  institucion: {
    nombreInstitucion: string;
    lema?: string;
    codigoModular?: string;
    logo?: string | null;
  };
  qrCode?: string; // Base64 data URL
}

export const StudentCardPDF = ({
  student,
  institucion,
  qrCode,
}: StudentCardPDFProps) => {
  const currentYear = new Date().getFullYear();
  const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`;

  // Estilos base compartidos
  const cardBaseStyle: any = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    position: "relative"
  }

  return (
    <Document title={`Carnet-${student.dni}`}>
      <Page size="A4" style={{ backgroundColor: "#f1f5f9", padding: 30, flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
        
        {/* LADO FRONTAL */}
        <View style={cardBaseStyle}>
          {/* Acento lateral */}
          <View style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 8, backgroundColor: "#0f172a" }} />
          
          <Stack direction="vertical" style={{ flex: 1, paddingLeft: 18, paddingRight: 10, paddingTop: 10 }}>
            {/* Header */}
            <Stack direction="horizontal" justify="between" align="start" style={{ marginBottom: 6 }}>
              <View style={{ flex: 1 }}>
                <Heading level={6} noMargin weight="bold" color="primary">{institucion.nombreInstitucion.toUpperCase()}</Heading>
                <Text style={{ fontSize: 4.5, color: "#94a3b8", textTransform: 'uppercase', marginTop: 1 }}>
                  {student.nivelAcademico?.sede?.nombre || institucion.lema || "Excelencia Académica"}
                </Text>
              </View>
              {institucion.logo && (
                <Image src={institucion.logo} style={{ width: 18, height: 18, objectFit: "contain" }} />
              )}
            </Stack>

            {/* Contenido */}
            <Stack direction="horizontal" gap="md" style={{ flex: 1 }}>
              {/* Foto */}
              <View style={{ width: 55, height: 65, borderRadius: 4, borderWidth: 0.5, borderColor: "#e2e8f0", backgroundColor: "#f8fafc", overflow: "hidden" }}>
                {student.image ? (
                  <Image src={student.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 16, color: "#cbd5e1" }}>{student.name.charAt(0)}</Text>
                  </View>
                )}
              </View>

              {/* Info */}
              <Stack direction="vertical" gap="sm" style={{ flex: 1 }}>
                <View>
                  <Text style={{ fontSize: 4, color: "#94a3b8", fontWeight: "bold" }}>ESTUDIANTE</Text>
                  <Text style={{ fontSize: fullName.length > 25 ? 7 : 8, fontWeight: "bold", color: "#0f172a", textTransform: "uppercase" }}>{fullName}</Text>
                </View>

                <View style={{ marginTop: 2 }}>
                  <Text style={{ fontSize: 4, color: "#94a3b8", fontWeight: "bold" }}>GRADO / NIVEL</Text>
                  <View style={{ backgroundColor: "#0f172a", paddingVertical: 1, paddingHorizontal: 4, borderRadius: 2, alignSelf: "flex-start" }}>
                    <Text style={{ fontSize: 5, color: "#ffffff", fontWeight: "bold" }}>
                      {student.nivelAcademico?.grado.nombre || "N/A"} - {student.nivelAcademico?.nivel.nombre || "N/A"}
                    </Text>
                  </View>
                </View>

                <Stack direction="horizontal" gap="md" style={{ marginTop: 2 }}>
                  <View>
                    <Text style={{ fontSize: 4, color: "#94a3b8", fontWeight: "bold" }}>DNI</Text>
                    <Text style={{ fontSize: 6, fontWeight: "bold" }}>{student.dni}</Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 4, color: "#94a3b8", fontWeight: "bold" }}>VIGENCIA</Text>
                    <Text style={{ fontSize: 6, fontWeight: "bold", color: "#64748b" }}>DIC {currentYear}</Text>
                  </View>
                </Stack>
              </Stack>
            </Stack>

            {/* Footer Front */}
            <Stack direction="horizontal" align="center" gap="sm" style={{ height: 25, marginTop: 5, borderTopWidth: 0.5, borderTopColor: "#f1f5f9" }}>
              <View style={{ width: 14, height: 14, backgroundColor: "#ffffff" }}>
                {qrCode && <Image src={qrCode} style={{ width: "100%", height: "100%" }} />}
              </View>
              <View>
                <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#0f172a" }}>ESTUDIANTE REGULAR</Text>
                <Text style={{ fontSize: 4, color: "#94a3b8" }}>MODULAR: {institucion.codigoModular || "---"}</Text>
              </View>
            </Stack>
          </Stack>
        </View>

        {/* LADO POSTERIOR (REVERSO) */}
        <View style={cardBaseStyle}>
          <View style={{ height: 3, backgroundColor: "#0f172a" }} />
          <Stack direction="vertical" align="center" justify="center" gap="md" style={{ flex: 1, padding: 10 }}>
            <Heading level={6} noMargin weight="bold" align="center" color="primary">CONDICIONES DE USO</Heading>
            <Text style={{ fontSize: 5, color: "#64748b", textAlign: "center", lineHeight: 1.4, paddingHorizontal: 10 }}>
              Este carnet es personal e intransferible. Identifica al portador como estudiante regular de nuestra institución. En caso de pérdida, informar a la dirección.
            </Text>
            
            <Stack direction="vertical" align="center" gap="sm">
              <View style={{ padding: 3, backgroundColor: "#ffffff", borderRadius: 4, borderWidth: 1, borderColor: "#f1f5f9" }}>
                {qrCode ? (
                  <Image src={qrCode} style={{ width: 40, height: 40 }} />
                ) : (
                  <View style={{ width: 40, height: 40, backgroundColor: "#f8fafc" }} />
                )}
              </View>
              <Text style={{ fontSize: 4.5, fontWeight: "bold", color: "#0f172a", letterSpacing: 0.5 }}>VALIDACIÓN DIGITAL</Text>
            </Stack>

            <View style={{ position: "absolute", bottom: 5 }}>
              <Text style={{ fontSize: 4, color: "#cbd5e1" }}>© {currentYear} {institucion.nombreInstitucion}</Text>
            </View>
          </Stack>
        </View>

      </Page>
    </Document>
  );
};
