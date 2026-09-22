import { Page, Text, View, Image } from "@/lib/pdf";
import { pdfStyles as styles } from "./pdf-styles";

interface PDFCoverPageProps {
  nombreIE: string;
  rdResolucion: string;
  direccionIE: string;
  instCompleta: any;
  logoUrl?: string;
  nivelNombre: string;
  apellidos: string;
  nombres: string;
  nombreCompleto: string;
  gradoNombre: string;
  seccionNombre: string;
  profesorNombre: string;
  anioEscolar: number;
}

export function PDFCoverPage({
  nombreIE,
  rdResolucion,
  direccionIE,
  instCompleta,
  logoUrl,
  nivelNombre,
  apellidos,
  nombres,
  nombreCompleto,
  gradoNombre,
  seccionNombre,
  profesorNombre,
  anioEscolar,
}: PDFCoverPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.outerFrame}>
        {/* Header Institucional Dinámico */}
        <View style={styles.headerCenter}>
          <Text style={styles.instType}>
            INSTITUCIÓN EDUCATIVA{" "}
            {instCompleta.tipoGestion === "PUBLICA" ? "PÚBLICA" : "PRIVADA"}
          </Text>
          <Text style={styles.instName}>&quot;{nombreIE}&quot;</Text>
          <Text style={styles.instMeta}>{rdResolucion}</Text>
          <Text style={styles.instMeta}>{direccionIE}</Text>
        </View>

        {/* Escudo / Logo Central */}
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image src={logoUrl} style={styles.logoImage} />
          ) : (
            <View style={styles.logoFallback}>
              <Text
                style={{ fontSize: 15, fontWeight: "bold", color: "#1e3a8a" }}
              >
                {nombreIE.substring(0, 2)}
              </Text>
              <Text style={{ fontSize: 5.5, color: "#1e3a8a" }}>
                {nivelNombre.includes("INICIAL") ? "INICIAL" : "PRIMARIA"}
              </Text>
            </View>
          )}
          <Text style={styles.logoShieldMotto}>
            {instCompleta.lema || "¡Nacimos para Triunfar...!"}
          </Text>
        </View>

        {/* Título Principal de la Portada */}
        <View style={{ alignItems: "center", marginVertical: 3 }}>
          <Text style={styles.reportTitle}>INFORME DE MIS PROGRESOS</Text>
          <Text style={styles.reportSubtitle}>
            NIVEL{" "}
            {nivelNombre.includes("INICIAL")
              ? "INICIAL"
              : nivelNombre.includes("SECUNDAR")
              ? "SECUNDARIO"
              : "PRIMARIO"}
          </Text>
        </View>

        {/* Ficha del Estudiante */}
        <View style={styles.studentCard}>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Apellidos:</Text>
            <View style={styles.fieldValueLine}>
              <Text style={styles.fieldText}>{apellidos || nombreCompleto}</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Nombres:</Text>
            <View style={styles.fieldValueLine}>
              <Text style={styles.fieldText}>{nombres || "-"}</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <Text style={{ ...styles.fieldLabel, width: 45 }}>Grado:</Text>
            <View
              style={{
                ...styles.fieldValueLine,
                flex: 0.35,
                marginRight: 15,
              }}
            >
              <Text style={{ ...styles.fieldText, textAlign: "center" }}>
                {gradoNombre}
              </Text>
            </View>
            <Text style={{ ...styles.fieldLabel, width: 55 }}>Sección:</Text>
            <View style={{ ...styles.fieldValueLine, flex: 0.35 }}>
              <Text style={{ ...styles.fieldText, textAlign: "center" }}>
                &quot;{seccionNombre}&quot;
              </Text>
            </View>
          </View>

          <View style={{ ...styles.fieldRow, marginBottom: 0 }}>
            <Text style={styles.fieldLabel}>Profesor(a):</Text>
            <View style={styles.fieldValueLine}>
              <Text style={styles.fieldText}>{profesorNombre}</Text>
            </View>
          </View>
        </View>

        {/* Sección Informativa: A los Padres de Familia */}
        <View>
          <Text style={styles.parentsTitle}>A LOS PADRES DE FAMILIA</Text>
          <Text style={styles.parentsText}>
            Esta tarjeta servirá para comunicar a los alumnos y padres de
            familia los resultados de la evaluación bimestral, siendo obligatoria
            la responsabilidad de verificar el rendimiento y conducta de su hijo
            (a) durante el presente año. Por lo tanto debe ser cuidadosamente
            comprobada.
          </Text>
        </View>

        {/* Escala de Valoración de Rendimiento */}
        <View style={styles.scaleTable}>
          <View style={styles.scaleHeader}>
            <Text style={styles.scaleHeaderText}>
              Escala de valoración de rendimiento
            </Text>
          </View>
          <View style={styles.scaleRow}>
            <View style={styles.scaleColLetter}>
              <Text style={styles.scaleTextBold}>AD</Text>
            </View>
            <View style={styles.scaleColRange}>
              <Text style={styles.scaleText}>17 - 20</Text>
            </View>
          </View>
          <View style={styles.scaleRow}>
            <View style={styles.scaleColLetter}>
              <Text style={styles.scaleTextBold}>A</Text>
            </View>
            <View style={styles.scaleColRange}>
              <Text style={styles.scaleText}>14 - 16</Text>
            </View>
          </View>
          <View style={styles.scaleRow}>
            <View style={styles.scaleColLetter}>
              <Text style={styles.scaleTextBold}>B</Text>
            </View>
            <View style={styles.scaleColRange}>
              <Text style={styles.scaleText}>11 - 13</Text>
            </View>
          </View>
          <View style={{ ...styles.scaleRow, borderBottomWidth: 0 }}>
            <View style={styles.scaleColLetter}>
              <Text style={styles.scaleTextBold}>C</Text>
            </View>
            <View style={styles.scaleColRange}>
              <Text style={styles.scaleText}>10 - 0</Text>
            </View>
          </View>
        </View>

        {/* Pie de Portada */}
        <View style={styles.footerCenter}>
          <View style={styles.yearBadge}>
            <Text style={styles.yearLabel}>Año:</Text>
            <View style={styles.yearBox}>
              <Text style={styles.yearText}>{anioEscolar}</Text>
            </View>
          </View>
          <Text style={styles.mottoText}>&quot;El Que Estudia Triunfa&quot;</Text>
        </View>
      </View>
    </Page>
  );
}
