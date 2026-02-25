"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Dimensiones estándar CR80 (85.6mm x 53.98mm) convertidas a puntos
const CARD_WIDTH = 242.6; // ~85.6mm
const CARD_HEIGHT = 153; // ~54mm

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f1f5f9",
    padding: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#ffffff",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  // Elementos Decorativos (Watermarks)
  watermarkCircle: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#f8fafc",
    zIndex: -1,
  },
  watermarkMortarboard: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 60,
    height: 40,
    opacity: 0.03,
    zIndex: -1,
  },
  accentSidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 12,
    backgroundColor: "#1e3a8a", // Navy Blue
  },
  header: {
    paddingTop: 12,
    paddingLeft: 22,
    paddingRight: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  schoolInfo: {
    flex: 1,
  },
  schoolName: {
    fontSize: 9,
    fontWeight: "black",
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  schoolSub: {
    fontSize: 5,
    color: "#94a3b8",
    textTransform: "uppercase",
    marginTop: 1,
    letterSpacing: 0.8,
  },
  headerIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#fff7ed",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ffedd5",
  },
  content: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingLeft: 22,
    paddingTop: 8,
    flex: 1,
  },
  photoWrapper: {
    width: 62,
    height: 75,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    padding: 2,
    backgroundColor: "#ffffff",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
    objectFit: "cover",
  },
  infoSection: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "flex-start",
  },
  labelSmall: {
    fontSize: 4.5,
    color: "#94a3b8",
    textTransform: "uppercase",
    fontWeight: "bold",
    marginBottom: 1,
  },
  studentName: {
    fontSize: 9,
    fontWeight: "black",
    color: "#0f172a",
    textTransform: "uppercase",
    lineHeight: 1.1,
  },
  programBadge: {
    backgroundColor: "#0f172a",
    padding: "2 6",
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  programText: {
    fontSize: 5,
    fontWeight: "black",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  metaGrid: {
    flexDirection: "row",
    marginTop: 6,
    gap: 10,
  },
  metaItem: {
    flex: 1,
  },
  metaValue: {
    fontSize: 7,
    fontWeight: "bold",
    color: "#1e3a8a",
  },
  // Footer Institucional
  institutionalFooter: {
    height: 28,
    backgroundColor: "#f8fafc",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingLeft: 22,
    borderTopWidth: 0.5,
    borderTopColor: "#f1f5f9",
  },
  footerLogoBox: {
    width: 18,
    height: 18,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 5,
    color: "#64748b",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  footerSub: {
    fontSize: 4.5,
    color: "#cbd5e1",
    fontWeight: "medium",
  },
  // REVERSO
  backCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
    position: "relative",
    borderWidth: 0.5,
    borderColor: "#e2e8f0",
  },
  backAccent: {
    height: 4,
    backgroundColor: "#1e3a8a",
  },
  backContent: {
    padding: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  backTitle: {
    fontSize: 8,
    fontWeight: "black",
    color: "#1e3a8a",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  backInstructions: {
    fontSize: 5,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 1.4,
    paddingHorizontal: 12,
  },
  qrSection: {
    alignItems: "center",
    marginTop: 2,
  },
  qrCard: {
    padding: 4,
    backgroundColor: "#ffffff",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  qrCode: {
    width: 45,
    height: 45,
  },
  validationText: {
    fontSize: 4.5,
    fontWeight: "black",
    color: "#1e3a8a",
    marginTop: 3,
    letterSpacing: 1,
  },
  backFooter: {
    width: "100%",
    paddingBottom: 6,
    alignItems: "center",
  },
  copyright: {
    fontSize: 4,
    color: "#cbd5e1",
    marginTop: 1,
  },
});

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

  return (
    <Document title={`Carnet-${student.dni}`}>
      <Page size="A4" style={styles.page}>
        {/* LADO FRONTAL */}
        <View style={styles.cardContainer}>
          {/* Decoraciones de Fondo */}
          <View style={styles.watermarkCircle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.schoolInfo}>
              <Text style={styles.schoolName}>
                {institucion.nombreInstitucion}
              </Text>
              <Text style={styles.schoolSub}>
                {student.nivelAcademico?.sede?.nombre ||
                  institucion.lema ||
                  "Institución de Excelencia Académica"}
              </Text>
            </View>

            {/* Logo de la institución o icono top-right */}
            <View style={styles.headerIcon}>
              {institucion.logo ? (
                <Image
                  src={institucion.logo}
                  style={{ width: "80%", height: "80%", objectFit: "contain" }}
                />
              ) : (
                <View
                  style={{
                    width: 10,
                    height: 8,
                    backgroundColor: "#ea580c",
                    borderRadius: 1,
                  }}
                />
              )}
            </View>
          </View>

          {/* Contenido Principal */}
          <View style={styles.content}>
            {/* Foto con borde fino */}
            <View style={styles.photoWrapper}>
              {student.image ? (
                <Image src={student.image} style={styles.photo} />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f8fafc",
                  }}
                >
                  <Text style={{ fontSize: 16, color: "#cbd5e1" }}>
                    {student.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>

            {/* Información al Estudiante */}
            <View style={styles.infoSection}>
              <View>
                <Text style={styles.labelSmall}>NOMBRE COMPLETO</Text>
                <Text style={studentNameStyles(fullName)}>{fullName}</Text>
              </View>

              <View>
                <Text style={[styles.labelSmall, { marginTop: 4 }]}>
                  PROGRAMA ACADÉMICO
                </Text>
                <View style={styles.programBadge}>
                  <Text style={styles.programText}>
                    {student.nivelAcademico?.grado.nombre || "N/A"} -{" "}
                    {student.nivelAcademico?.nivel.nombre || "N/A"}
                  </Text>
                </View>
              </View>

              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.labelSmall}>DNI / CÓDIGO</Text>
                  <Text style={styles.metaValue}>{student.dni}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.labelSmall}>VIGENCIA</Text>
                  <Text style={[styles.metaValue, { color: "#64748b" }]}>
                    DIC {currentYear}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Marca de agua bottom-right (Simplified Mortarboard) */}
          <View style={styles.watermarkMortarboard}>
            <View
              style={{
                width: 30,
                height: 20,
                borderWidth: 4,
                borderColor: "#0f172a",
                borderRadius: 2,
                transform: "rotate(45deg)",
              }}
            />
          </View>

          {/* Footer Institucional */}
          <View style={styles.institutionalFooter}>
            <View style={styles.footerLogoBox}>
              {qrCode ? (
                <Image
                  src={qrCode}
                  style={{ width: "100%", height: "100%", borderRadius: 2 }}
                />
              ) : (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderWidth: 1.5,
                    borderColor: "#cbd5e1",
                    borderRadius: 1,
                  }}
                />
              )}
            </View>
            <View>
              <Text style={styles.footerText}>ESTUDIANTE REGULAR</Text>
              <Text style={styles.footerSub}>
                CÓDIGO MODULAR: {institucion.codigoModular || "---"}
              </Text>
            </View>
          </View>

          {/* Acento lateral (Renderizado al final para que sea continuo) */}
          <View style={styles.accentSidebar} />
        </View>

        {/* LADO POSTERIOR (REVERSO) */}
        <View style={styles.backCard}>
          <View style={styles.backAccent} />

          <View style={styles.backContent}>
            <Text style={styles.backTitle}>Condiciones de Uso</Text>

            <Text style={styles.backInstructions}>
              Este carnet es personal e intransferible. Identifica al portador
              como estudiante regular de nuestra institución.
            </Text>

            <View style={styles.qrSection}>
              <View style={styles.qrCard}>
                {qrCode ? (
                  <Image src={qrCode} style={styles.qrCode} />
                ) : (
                  <View
                    style={[styles.qrCode, { backgroundColor: "#f8fafc" }]}
                  />
                )}
              </View>
              <Text style={styles.validationText}>VALIDACIÓN DIGITAL</Text>
            </View>
          </View>

          <View style={styles.backFooter}>
            <Text
              style={[styles.footerText, { textAlign: "center", fontSize: 4 }]}
            >
              Generado por {institucion.nombreInstitucion}
            </Text>
            <Text style={styles.copyright}>© {currentYear}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

// Helper to adjust font size based on name length
const studentNameStyles = (name: string) => {
  return {
    ...styles.studentName,
    fontSize: name.length > 25 ? 7 : name.length > 18 ? 8 : 9,
  };
};
