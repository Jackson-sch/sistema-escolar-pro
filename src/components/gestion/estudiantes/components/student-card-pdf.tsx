import React from "react";
import { Document, Page } from "@/lib/pdf";
import { CardFront } from "./student-card/card-front";
import { CardBack } from "./student-card/card-back";
import { StudentCardPDFProps } from "./student-card/card-types";

export type { StudentCardPDFProps };

export const StudentCardPDF = (props: StudentCardPDFProps) => {
  return (
    <Document title={`Carnet-${props.student.dni}`}>
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
        <CardFront {...props} />
        <CardBack {...props} />
      </Page>
    </Document>
  );
};
