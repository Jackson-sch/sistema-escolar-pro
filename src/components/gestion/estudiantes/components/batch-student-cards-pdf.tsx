import React from "react";
import { Document, Page, View } from "@/lib/pdf";
import { BatchFrontCard } from "./pdf/batch-front-card";
import { BatchBackCard } from "./pdf/batch-back-card";

export interface StudentCardItem {
  id: string;
  name: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  image?: string | null;
  aula: string;
  nivelNombre?: string;
  sedeNombre?: string;
  qrCode?: string;
}

interface BatchStudentCardsPDFProps {
  students: StudentCardItem[];
  institucion: {
    nombreInstitucion: string;
    lema?: string;
    codigoModular?: string;
    logo?: string | null;
    direccion?: string;
    telefono?: string;
    ugel?: string;
  };
  layout?: "grid8" | "duplex";
}

export const BatchStudentCardsPDF = ({
  students,
  institucion,
  layout = "grid8",
}: BatchStudentCardsPDFProps) => {
  const currentYear = new Date().getFullYear();

  if (layout === "duplex") {
    // 4 carnets plegables (frente + dorso) por página
    const itemsPerPage = 4;
    const pages: StudentCardItem[][] = [];
    for (let i = 0; i < students.length; i += itemsPerPage) {
      pages.push(students.slice(i, i + itemsPerPage));
    }

    return (
      <Document title={`Carnets-Lote-${currentYear}`}>
        {pages.map((pageStudents, pageIdx) => (
          <Page
            key={pageIdx}
            size="A4"
            style={{
              backgroundColor: "#ffffff",
              paddingHorizontal: 22,
              paddingVertical: 20,
              gap: 16,
            }}
          >
            {pageStudents.map((student) => (
              <View
                key={student.id}
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <BatchFrontCard student={student} institucion={institucion} year={currentYear} />
                <BatchBackCard institucion={institucion} year={currentYear} />
              </View>
            ))}
          </Page>
        ))}
      </Document>
    );
  }

  // Layout 8 por página (2 columnas x 4 filas)
  const itemsPerPage = 8;
  const pages: StudentCardItem[][] = [];
  for (let i = 0; i < students.length; i += itemsPerPage) {
    pages.push(students.slice(i, i + itemsPerPage));
  }

  return (
    <Document title={`Carnets-Lote-${currentYear}`}>
      {pages.map((pageStudents, pageIdx) => (
        <Page
          key={pageIdx}
          size="A4"
          style={{
            backgroundColor: "#ffffff",
            paddingHorizontal: 25,
            paddingVertical: 22,
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignContent: "flex-start",
            rowGap: 16,
          }}
        >
          {pageStudents.map((student) => (
            <BatchFrontCard
              key={student.id}
              student={student}
              institucion={institucion}
              year={currentYear}
            />
          ))}
        </Page>
      ))}
    </Document>
  );
};
