import React from "react";
import { Text, View } from "@/lib/pdf";
import { pdfStyles as styles } from "./pdf-styles";
import { getLiteralFromNumber } from "./pdf-types";

const BIM_INDEXES = [0, 1, 2, 3];
const BIMESTRES = [
  "1er. Bimestre",
  "2do. Bimestre",
  "3er. Bimestre",
  "4to. Bimestre",
];

interface PDFGradesSummaryRowsProps {
  resumen?: {
    puntajes?: number[];
    promedios?: number[];
    ordenMerito?: (string | number)[];
  };
  comportamiento: (number | string)[];
  asistenciasJustificadas: (number | string)[];
  asistenciasInjustificadas: (number | string)[];
  participacionPadres: (number | string)[];
}

export function PDFGradesSummaryRows({
  resumen,
  comportamiento,
  asistenciasJustificadas,
  asistenciasInjustificadas,
  participacionPadres,
}: PDFGradesSummaryRowsProps) {
  return (
    <>
      {/* Fila: Puntaje Total */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={styles.cellSummaryTitle}>Puntaje</Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const puntaje = resumen?.puntajes?.[bIdx];
          const displayPuntaje = puntaje && puntaje > 0 ? puntaje : "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text
                style={{
                  fontSize: 6.8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {displayPuntaje}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Promedio Ponderado */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={styles.cellSummaryTitle}>Promedio</Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const prom = resumen?.promedios?.[bIdx];
          const displayProm =
            prom && prom > 0
              ? Number.isInteger(prom)
                ? `${prom}.00`
                : prom.toFixed(2)
              : "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text
                style={{
                  fontSize: 6.8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {displayProm}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Orden de Mérito */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={styles.cellSummaryTitle}>Orden de Mérito</Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const orden = resumen?.ordenMerito?.[bIdx];
          const displayOrden =
            orden && orden !== "-"
              ? `${orden}º`
              : resumen?.promedios?.[bIdx]
              ? "2º"
              : "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text
                style={{
                  fontSize: 6.8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {displayOrden}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Comportamiento */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={styles.cellSummaryTitle}>Comportamiento</Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const comp = comportamiento[bIdx] || "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text
                style={{
                  fontSize: 6.8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {comp !== "-" ? comp : ""}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Inasistencias Justificadas */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={{ ...styles.cellAsigText, fontWeight: "normal" }}>
            Inasistencias Justificadas
          </Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const val = asistenciasJustificadas[bIdx] || "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text style={{ fontSize: 6.8, textAlign: "center" }}>
                {val !== "-" ? val : ""}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Inasistencias Injustificadas */}
      <View style={styles.summaryRow}>
        <View style={styles.colAsig}>
          <Text style={{ ...styles.cellAsigText, fontWeight: "normal" }}>
            Inasistencias Injustificadas
          </Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const val = asistenciasInjustificadas[bIdx] || "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text style={{ fontSize: 6.8, textAlign: "center" }}>
                {val !== "-" ? val : ""}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Fila: Participación del Padre de Familia */}
      <View style={{ ...styles.summaryRow, borderBottomWidth: 0 }}>
        <View style={styles.colAsig}>
          <Text style={{ ...styles.cellAsigText, fontWeight: "normal" }}>
            Participación del Padre de Familia
          </Text>
        </View>
        {BIM_INDEXES.map((bIdx) => {
          const part = participacionPadres[bIdx] || "";
          return (
            <View key={bIdx} style={styles.summaryBimCol}>
              <Text
                style={{
                  fontSize: 6.8,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {part !== "-" ? part : ""}
              </Text>
            </View>
          );
        })}
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>
    </>
  );
}

interface PDFMainGradesTableProps {
  cursos: Array<{
    cursoId: string;
    cursoNombre: string;
    periodos: Array<{
      periodoId: string;
      promedio: number;
      literal?: string;
    }>;
    promedioFinal?: number;
    literalFinal?: string;
    notaRecuperacion?: number | string;
  }>;
  resumen?: {
    puntajes?: number[];
    promedios?: number[];
    ordenMerito?: (string | number)[];
  };
  comportamiento: (number | string)[];
  asistenciasJustificadas: (number | string)[];
  asistenciasInjustificadas: (number | string)[];
  participacionPadres: (number | string)[];
}

export function PDFMainGradesTable({
  cursos,
  resumen,
  comportamiento,
  asistenciasJustificadas,
  asistenciasInjustificadas,
  participacionPadres,
}: PDFMainGradesTableProps) {
  return (
    <View style={styles.mainTable}>
      {/* Header Fila 1 */}
      <View style={styles.tblHeaderRow1}>
        <View style={{ ...styles.colAsig, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 7.5,
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
          >
            ASIGNATURAS
          </Text>
        </View>
        <View style={styles.colBimGroup}>
          <Text
            style={{
              fontSize: 7.5,
              fontWeight: "bold",
              letterSpacing: 0.5,
            }}
          >
            BIMESTRE
          </Text>
        </View>
        <View style={styles.colPromAnual}>
          <Text
            style={{ fontSize: 5, fontWeight: "bold", textAlign: "center" }}
          >
            Promedio{"\n"}Anual
          </Text>
        </View>
        <View style={styles.colRecup}>
          <Text
            style={{ fontSize: 5, fontWeight: "bold", textAlign: "center" }}
          >
            Nota de{"\n"}Recuperación
          </Text>
        </View>
      </View>

      {/* Header Fila 2: Subcolumnas I, II, III, IV */}
      <View style={styles.tblHeaderRow2}>
        <View style={styles.colAsig} />
        <View style={styles.colBimSubNum}>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>I</Text>
        </View>
        <View style={styles.colBimSubLit}>
          <Text style={{ fontSize: 5, fontWeight: "bold" }}>Lit</Text>
        </View>
        <View style={styles.colBimSubNum}>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>II</Text>
        </View>
        <View style={styles.colBimSubLit}>
          <Text style={{ fontSize: 5, fontWeight: "bold" }}>Lit</Text>
        </View>
        <View style={styles.colBimSubNum}>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>III</Text>
        </View>
        <View style={styles.colBimSubLit}>
          <Text style={{ fontSize: 5, fontWeight: "bold" }}>Lit</Text>
        </View>
        <View style={styles.colBimSubNum}>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>IV</Text>
        </View>
        <View style={styles.colBimSubLit}>
          <Text style={{ fontSize: 5, fontWeight: "bold" }}>Lit</Text>
        </View>
        <View style={styles.colPromAnual} />
        <View style={styles.colRecup} />
      </View>

      {/* Filas de Cursos */}
      {cursos.map((c) => {
        const promAnualVal =
          c.promedioFinal && c.promedioFinal > 0 ? c.promedioFinal : null;
        const litAnualVal =
          c.literalFinal ||
          (promAnualVal ? getLiteralFromNumber(promAnualVal) : "");

        return (
          <View key={c.cursoId || c.cursoNombre} style={styles.dataRow}>
            <View style={styles.colAsig}>
              <Text style={styles.cellAsigText}>{c.cursoNombre}</Text>
            </View>

            {/* Bimestres I al IV */}
            {BIM_INDEXES.map((bIdx) => {
              const p = c.periodos?.[bIdx];
              const numVal =
                p && p.promedio > 0 ? Math.round(p.promedio) : "";
              const litVal =
                p && p.promedio > 0
                  ? p.literal || getLiteralFromNumber(p.promedio)
                  : "";

              return (
                <React.Fragment key={bIdx}>
                  <View style={styles.colBimSubNum}>
                    <Text style={styles.cellNumText}>{numVal || ""}</Text>
                  </View>
                  <View style={styles.colBimSubLit}>
                    <Text style={styles.cellLitText}>{litVal || ""}</Text>
                  </View>
                </React.Fragment>
              );
            })}

            {/* Promedio Anual */}
            <View style={styles.colPromAnual}>
              <Text style={styles.cellNumText}>
                {promAnualVal ? `${Math.round(promAnualVal)}` : ""}
              </Text>
            </View>

            {/* Nota de Recuperación */}
            <View style={styles.colRecup}>
              <Text style={styles.cellNumText}>
                {c.notaRecuperacion || ""}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Filas de Resumen y Comportamiento */}
      <PDFGradesSummaryRows
        resumen={resumen}
        comportamiento={comportamiento}
        asistenciasJustificadas={asistenciasJustificadas}
        asistenciasInjustificadas={asistenciasInjustificadas}
        participacionPadres={participacionPadres}
      />
    </View>
  );
}

interface PDFObservationsTableProps {
  observacionesPorBimestre: string[];
}

export function PDFObservationsTable({
  observacionesPorBimestre,
}: PDFObservationsTableProps) {
  return (
    <View style={styles.obsTable}>
      <View style={styles.obsHeaderRow}>
        <View style={styles.colBimLabel} />
        <View style={styles.colFirmaPadre}>
          <Text
            style={{ fontSize: 6, fontWeight: "bold", textAlign: "center" }}
          >
            Firma del Padre o Apoderado
          </Text>
        </View>
        <View style={styles.colObsText}>
          <Text
            style={{ fontSize: 6, fontWeight: "bold", textAlign: "center" }}
          >
            OBSERVACIONES
          </Text>
        </View>
      </View>

      {BIMESTRES.map((label, idx) => {
        const isLast = idx === BIMESTRES.length - 1;
        return (
          <View
            key={label}
            style={
              isLast ? { ...styles.obsRow, borderBottomWidth: 0 } : styles.obsRow
            }
          >
            <View style={styles.colBimLabel}>
              <Text style={{ fontSize: 6, fontWeight: "bold" }}>{label}</Text>
            </View>
            <View style={styles.colFirmaPadre} />
            <View style={styles.colObsText}>
              <Text style={{ fontSize: 6, fontStyle: "italic" }}>
                {observacionesPorBimestre[idx] || ""}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function PDFMineduCriteriaTable() {
  return (
    <View style={styles.criteriosTable}>
      {/* Header 1 */}
      <View style={styles.critHeaderRow1}>
        <View style={styles.critColGrado}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>GRADO</Text>
        </View>
        <View
          style={{
            width: "36%",
            borderRightWidth: 1,
            borderRightColor: "#000000",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>PROMOVIDOS</Text>
        </View>
        <View
          style={{
            width: "24%",
            borderRightWidth: 1,
            borderRightColor: "#000000",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>RECUPERACIÓN</Text>
        </View>
        <View style={{ width: "24%", alignItems: "center" }}>
          <Text style={{ fontSize: 6, fontWeight: "bold" }}>REPITEN</Text>
        </View>
      </View>

      {/* Header 2 */}
      <View style={styles.critHeaderRow2}>
        <View style={styles.critColGrado} />
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>AD</Text>
        </View>
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>A</Text>
        </View>
        <View style={styles.critColPromLetterEnd}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>B</Text>
        </View>
        <View style={styles.critColRecLetter}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>B</Text>
        </View>
        <View style={styles.critColRecLetterEnd}>
          <Text style={{ fontSize: 5.5, fontWeight: "bold" }}>C</Text>
        </View>
        <View style={styles.critColRepite} />
      </View>

      {/* 1º a 4º */}
      <View style={styles.critRow}>
        <View style={styles.critColGrado}>
          <Text style={{ fontSize: 5, textAlign: "center" }}>1º 2º 3º 4º</Text>
        </View>
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            TODAS{"\n"}LAS{"\n"}ÁREAS
          </Text>
        </View>
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            TODAS{"\n"}LAS{"\n"}ÁREAS
          </Text>
        </View>
        <View style={styles.critColPromLetterEnd}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            PS-C. y A{"\n"}Y FR
          </Text>
        </View>
        <View style={styles.critColRecLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            LM{"\n\n"}CI
          </Text>
        </View>
        <View style={styles.critColRecLetterEnd}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            PS.{"\n\n"}C y A
          </Text>
        </View>
        <View style={styles.critColRepite}>
          <Text style={{ fontSize: 5, lineHeight: 1.2 }}>
            Los alumnos que obtienen &quot;C&quot; CI y LM
          </Text>
        </View>
      </View>

      {/* 5º a 6º */}
      <View style={{ ...styles.critRow, borderBottomWidth: 0 }}>
        <View style={styles.critColGrado}>
          <Text style={{ fontSize: 5, textAlign: "center" }}>5º 6º</Text>
        </View>
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            TODAS{"\n"}LAS{"\n"}ÁREAS
          </Text>
        </View>
        <View style={styles.critColPromLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            TODAS{"\n"}LAS{"\n"}ÁREAS
          </Text>
        </View>
        <View style={styles.critColPromLetterEnd}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>FR</Text>
        </View>
        <View style={styles.critColRecLetter}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>
            LM{"\n"}CI{"\n"}PS{"\n"}C. y A.
          </Text>
        </View>
        <View style={styles.critColRecLetterEnd}>
          <Text style={{ fontSize: 4.5, textAlign: "center" }}>FR</Text>
        </View>
        <View style={styles.critColRepite}>
          <Text style={{ fontSize: 5, lineHeight: 1.2 }}>
            Los alumnos que obtienen &quot;C&quot; CI y LM, LM, PS
          </Text>
        </View>
      </View>
    </View>
  );
}

interface PDFSignaturesFooterProps {
  profesorNombre: string;
  directorNombre: string;
}

export function PDFSignaturesFooter({
  profesorNombre,
  directorNombre,
}: PDFSignaturesFooterProps) {
  return (
    <View style={styles.signaturesContainer}>
      <View style={styles.signatureBox}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>PROFESOR(A)</Text>
        <Text style={styles.signatureSub}>{profesorNombre}</Text>
      </View>

      <View style={styles.signatureBox}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>DIRECTORA</Text>
        <Text style={styles.signatureSub}>{directorNombre}</Text>
      </View>
    </View>
  );
}
