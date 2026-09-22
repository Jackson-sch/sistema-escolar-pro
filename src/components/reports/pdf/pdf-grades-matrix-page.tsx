import React from "react";
import { Page, View } from "@/lib/pdf";
import { pdfStyles as styles } from "./pdf-styles";
import {
  PDFMainGradesTable,
  PDFObservationsTable,
  PDFMineduCriteriaTable,
  PDFSignaturesFooter,
} from "./pdf-grades-matrix-components";

interface PDFGradesMatrixPageProps {
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
  observacionesPorBimestre: string[];
  profesorNombre: string;
  directorNombre: string;
}

export function PDFGradesMatrixPage({
  cursos,
  resumen,
  comportamiento,
  asistenciasJustificadas,
  asistenciasInjustificadas,
  participacionPadres,
  observacionesPorBimestre,
  profesorNombre,
  directorNombre,
}: PDFGradesMatrixPageProps) {
  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.page2Frame}>
        {/* 1. TABLA PRINCIPAL DE ASIGNATURAS */}
        <PDFMainGradesTable
          cursos={cursos}
          resumen={resumen}
          comportamiento={comportamiento}
          asistenciasJustificadas={asistenciasJustificadas}
          asistenciasInjustificadas={asistenciasInjustificadas}
          participacionPadres={participacionPadres}
        />

        {/* 2. OBSERVACIONES & FIRMA DEL APODERADO */}
        <PDFObservationsTable
          observacionesPorBimestre={observacionesPorBimestre}
        />

        {/* 3. TABLA DE CRITERIOS MINEDU */}
        <PDFMineduCriteriaTable />

        {/* 4. FIRMAS OFICIALES AL PIE */}
        <PDFSignaturesFooter
          profesorNombre={profesorNombre}
          directorNombre={directorNombre}
        />
      </View>
    </Page>
  );
}
