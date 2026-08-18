import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
} from "@react-pdf/renderer";

// Dimensiones estándar CR80 (85.6mm x 53.98mm) convertidas a puntos
const CARD_WIDTH = 242.6; // ~85.6mm
const CARD_HEIGHT = 153;  // ~54mm

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
  const fullName = `${student.name} ${student.apellidoPaterno} ${student.apellidoMaterno}`.trim();
  const gradoNivel = student.nivelAcademico
    ? `${student.nivelAcademico.grado.nombre} "${student.nivelAcademico.seccion}" - ${student.nivelAcademico.nivel.nombre}`
    : "ESTUDIANTE REGULAR";

  const cardBaseStyle: any = {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    position: "relative",
  };

  const Watermark = () => (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.04,
        overflow: "hidden",
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: "bold",
          color: "#0f172a",
          textTransform: "uppercase",
          textAlign: "center",
          transform: "rotate(-25deg)",
          width: 300,
          lineHeight: 1.4,
        }}
      >
        {institucion.nombreInstitucion} • {institucion.nombreInstitucion} • {institucion.nombreInstitucion}
      </Text>
    </View>
  );

  return (
    <Document title={`Carnet-${student.dni}`}>
      <Page
        size="A4"
        style={{
          backgroundColor: "#f8fafc",
          padding: 30,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* ================= FRONTAL ================= */}
        <View style={cardBaseStyle}>
          <Watermark />
          {/* Header Superior */}
          <View
            style={{
              backgroundColor: "#0f172a",
              height: 34,
              paddingHorizontal: 10,
              paddingVertical: 4,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1, paddingRight: 6 }}>
              <Text
                style={{
                  fontSize: 7.5,
                  fontWeight: "bold",
                  color: "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: 0.3,
                }}
              >
                {institucion.nombreInstitucion}
              </Text>
              <Text
                style={{
                  fontSize: 4.5,
                  color: "#93c5fd",
                  marginTop: 1,
                }}
              >
                {student.nivelAcademico?.sede?.nombre || institucion.lema || "Excelencia Educativa"}
              </Text>
            </View>
            {institucion.logo ? (
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#ffffff",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={institucion.logo}
                  style={{ width: 20, height: 20, objectFit: "contain" }}
                />
              </View>
            ) : null}
          </View>

          {/* Banda de Acento Dorado/Azul */}
          <View style={{ height: 2, backgroundColor: "#3b82f6" }} />

          {/* Cuerpo Principal */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              paddingHorizontal: 10,
              paddingTop: 8,
              paddingBottom: 4,
            }}
          >
            {/* Marco de Foto */}
            <View
              style={{
                width: 52,
                height: 64,
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "#cbd5e1",
                backgroundColor: "#f1f5f9",
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {student.image ? (
                <Image
                  src={student.image}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "#64748b",
                    }}
                  >
                    {student.name ? student.name.charAt(0).toUpperCase() : "E"}
                  </Text>
                </View>
              )}
            </View>

            {/* Información del Estudiante */}
            <View style={{ flex: 1, marginLeft: 10, justifyContent: "space-between" }}>
              {/* Nombre */}
              <View>
                <Text
                  style={{
                    fontSize: 4.5,
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: 0.5,
                  }}
                >
                  ESTUDIANTE
                </Text>
                <Text
                  style={{
                    fontSize: fullName.length > 22 ? 6.5 : 7.5,
                    fontWeight: "bold",
                    color: "#0f172a",
                    marginTop: 1,
                    textTransform: "uppercase",
                  }}
                >
                  {fullName}
                </Text>
              </View>

              {/* Grado / Nivel Badge */}
              <View style={{ marginTop: 2 }}>
                <Text
                  style={{
                    fontSize: 4.5,
                    fontWeight: "bold",
                    color: "#64748b",
                    letterSpacing: 0.5,
                    marginBottom: 1,
                  }}
                >
                  GRADO / NIVEL
                </Text>
                <View
                  style={{
                    backgroundColor: "#1e293b",
                    paddingVertical: 1.5,
                    paddingHorizontal: 5,
                    borderRadius: 3,
                    alignSelf: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 5.5,
                      fontWeight: "bold",
                      color: "#ffffff",
                      textTransform: "uppercase",
                    }}
                  >
                    {gradoNivel}
                  </Text>
                </View>
              </View>

              {/* DNI y Vigencia */}
              <View style={{ flexDirection: "row", marginTop: 2 }}>
                <View style={{ marginRight: 14 }}>
                  <Text
                    style={{
                      fontSize: 4.5,
                      fontWeight: "bold",
                      color: "#64748b",
                    }}
                  >
                    DNI
                  </Text>
                  <Text
                    style={{
                      fontSize: 6.5,
                      fontWeight: "bold",
                      color: "#0f172a",
                      marginTop: 1,
                    }}
                  >
                    {student.dni}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 4.5,
                      fontWeight: "bold",
                      color: "#64748b",
                    }}
                  >
                    VIGENCIA
                  </Text>
                  <Text
                    style={{
                      fontSize: 6.5,
                      fontWeight: "bold",
                      color: "#2563eb",
                      marginTop: 1,
                    }}
                  >
                    DIC {currentYear}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Pie de Carnet */}
          <View
            style={{
              height: 20,
              borderTopWidth: 0.5,
              borderTopColor: "#e2e8f0",
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              backgroundColor: "#f8fafc",
            }}
          >
            <View
              style={{
                width: 14,
                height: 14,
                backgroundColor: "#ffffff",
                marginRight: 6,
              }}
            >
              {qrCode ? (
                <Image src={qrCode} style={{ width: "100%", height: "100%" }} />
              ) : null}
            </View>
            <View>
              <Text
                style={{
                  fontSize: 4.5,
                  fontWeight: "bold",
                  color: "#0f172a",
                  letterSpacing: 0.3,
                }}
              >
                CARNET ESCOLAR OFICIAL
              </Text>
              <Text style={{ fontSize: 4, color: "#64748b", marginTop: 0.5 }}>
                CÓD. MODULAR: {institucion.codigoModular || "---"}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= POSTERIOR (REVERSO) ================= */}
        <View style={cardBaseStyle}>
          <Watermark />
          {/* Franja Superior */}
          <View style={{ height: 4, backgroundColor: "#0f172a" }} />

          {/* Contenido Reverso */}
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 14,
              paddingTop: 10,
              paddingBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 7.5,
                fontWeight: "bold",
                color: "#0f172a",
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              CONDICIONES DE USO
            </Text>

            <Text
              style={{
                fontSize: 5,
                color: "#475569",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              Este carnet es personal e intransferible. Identifica al portador como estudiante regular de nuestra institución educativa. En caso de pérdida o hallazgo, favor de reportarlo a la dirección general.
            </Text>

            {/* QR de Validación Digital */}
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  padding: 2,
                  backgroundColor: "#ffffff",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: "#cbd5e1",
                }}
              >
                {qrCode ? (
                  <Image src={qrCode} style={{ width: 38, height: 38 }} />
                ) : (
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      backgroundColor: "#f1f5f9",
                    }}
                  />
                )}
              </View>
              <Text
                style={{
                  fontSize: 4.5,
                  fontWeight: "bold",
                  color: "#0f172a",
                  letterSpacing: 0.5,
                  marginTop: 2,
                }}
              >
                VALIDACIÓN DIGITAL
              </Text>
            </View>

            {/* Copyright */}
            <Text style={{ fontSize: 4, color: "#94a3b8" }}>
              © {currentYear} {institucion.nombreInstitucion}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
