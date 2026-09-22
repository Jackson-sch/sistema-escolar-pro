import React from "react";
import { Document } from "@/lib/pdf";
import { formatTitleCase } from "@/lib/formats";
import { GradeReportPDFProps } from "./pdf/pdf-types";
import { PDFCoverPage } from "./pdf/pdf-cover-page";
import { PDFGradesMatrixPage } from "./pdf/pdf-grades-matrix-page";

function parseStudentNames(estudiante: any = {}): { apellidos: string; nombres: string } {
  if (estudiante.apellidoPaterno || estudiante.apellidoMaterno) {
    return {
      apellidos: `${estudiante.apellidoPaterno || ""} ${estudiante.apellidoMaterno || ""}`.trim(),
      nombres: estudiante.nombres || estudiante.name || "",
    };
  }

  if (estudiante.nombreCompleto) {
    if (estudiante.nombreCompleto.includes(",")) {
      const parts = estudiante.nombreCompleto.split(",");
      return {
        apellidos: parts[0]?.trim() || "",
        nombres: parts[1]?.trim() || "",
      };
    }
    const parts = estudiante.nombreCompleto.split(" ");
    if (parts.length >= 3) {
      return {
        apellidos: `${parts[0]} ${parts[1]}`,
        nombres: parts.slice(2).join(" "),
      };
    }
    return {
      apellidos: parts[0] || "",
      nombres: parts.slice(1).join(" "),
    };
  }

  return { apellidos: "", nombres: "" };
}

function resolveDirectorNombre(director: any): string {
  if (typeof director === "object" && director) {
    return formatTitleCase(
      `${director.name || ""} ${director.apellidoPaterno || ""} ${director.apellidoMaterno || ""}`.trim()
    );
  }
  if (typeof director === "string" && director) {
    return director;
  }
  return "Sonia Reyes Salirrosas";
}

function resolveInstitutionDetails(estudiante: any = {}, instCompleta: any = {}) {
  const nombreIE = (
    instCompleta.nombreInstitucion ||
    instCompleta.nombre ||
    estudiante.institucion ||
    "Casita de Sorpresas"
  ).toUpperCase();

  const rdResolucion =
    instCompleta.resolucionCreacion ||
    instCompleta.resolucionActual ||
    instCompleta.rd ||
    "RD Nº 002469";

  const direccionIE = [
    instCompleta.direccion || "José Olaya 1294",
    instCompleta.distrito || "El Porvenir",
    instCompleta.provincia || null,
  ]
    .filter(Boolean)
    .join(" - ");

  return { nombreIE, rdResolucion, direccionIE };
}

export const GradeReportPDF = ({ data }: GradeReportPDFProps) => {
  const {
    estudiante = { dni: "S/D", institucion: "I.E." } as any,
    cursos = [],
    resumen = { puntajes: [], promedios: [], ordenMerito: [] },
    comportamiento = [20, 20, "-", "-"],
    asistenciasJustificadas = ["-", "-", "-", "-"],
    asistenciasInjustificadas = ["-", "-", "-", "-"],
    participacionPadres = [20, 20, "-", "-"],
    observacionesPorBimestre = [
      "¡Felicitaciones! Sigue así.",
      "¡Felicitaciones! Continúa así.",
      "",
      "",
    ],
  } = data || {};

  const { apellidos, nombres } = parseStudentNames(estudiante);
  const instCompleta = estudiante.institucionCompleta || {};
  const { nombreIE, rdResolucion, direccionIE } = resolveInstitutionDetails(estudiante, instCompleta);
  const directorNombre = resolveDirectorNombre(instCompleta.director);

  const logoUrl = estudiante.logo || instCompleta.logo;
  const gradoNombre = estudiante.grado || "2º";
  const seccionNombre = estudiante.seccion || "B";
  const nivelNombre = (estudiante.nivel || "PRIMARIA").toUpperCase();
  const profesorNombre =
    estudiante.profesor || estudiante.tutor || "SANDRA GABRIELA LUIS MORA";
  const anioEscolar = data?.anioAcademico || new Date().getFullYear();

  return (
    <Document title={`Informe de Progresos - ${apellidos} ${nombres}`}>
      {/* PÁGINA 1: PORTADA / CARÁTULA OFICIAL */}
      <PDFCoverPage
        nombreIE={nombreIE}
        rdResolucion={rdResolucion}
        direccionIE={direccionIE}
        instCompleta={instCompleta}
        logoUrl={logoUrl}
        nivelNombre={nivelNombre}
        apellidos={apellidos}
        nombres={nombres}
        nombreCompleto={estudiante.nombreCompleto}
        gradoNombre={gradoNombre}
        seccionNombre={seccionNombre}
        profesorNombre={profesorNombre}
        anioEscolar={anioEscolar}
      />

      {/* PÁGINA 2: MATRIZ DE NOTAS BIMESTRALES OFICIAL & CRITERIOS */}
      <PDFGradesMatrixPage
        cursos={cursos}
        resumen={resumen}
        comportamiento={comportamiento}
        asistenciasJustificadas={asistenciasJustificadas}
        asistenciasInjustificadas={asistenciasInjustificadas}
        participacionPadres={participacionPadres}
        observacionesPorBimestre={observacionesPorBimestre}
        profesorNombre={profesorNombre}
        directorNombre={directorNombre}
      />
    </Document>
  );
};
export type { GradeReportPDFProps };
