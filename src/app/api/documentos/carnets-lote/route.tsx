import "@/lib/react-pdf-polyfill";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  BatchStudentCardsPDF,
  StudentCardItem,
} from "@/components/gestion/estudiantes/components/batch-student-cards-pdf";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { collectPdfBuffer, resolvePdfImage } from "@/lib/pdf-server-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const nivelAcademicoId = searchParams.get("nivelAcademicoId");
  const gradoId = searchParams.get("gradoId");
  const nivelId = searchParams.get("nivelId");
  const sedeId = searchParams.get("sedeId");
  const layout = (searchParams.get("layout") as "grid8" | "duplex") || "grid8";
  const institucionId = session.user.institucionId;

  try {
    const whereClause: any = {
      role: "estudiante",
      institucionId: institucionId || undefined,
    };

    if (nivelAcademicoId && nivelAcademicoId !== "ALL") {
      whereClause.OR = [
        { nivelAcademicoId },
        { matriculas: { some: { nivelAcademicoId } } },
      ];
    } else if (gradoId && gradoId !== "ALL") {
      whereClause.OR = [
        { nivelAcademico: { gradoId } },
        { matriculas: { some: { nivelAcademico: { gradoId } } } },
      ];
    } else if (nivelId && nivelId !== "ALL") {
      whereClause.OR = [
        { nivelAcademico: { nivelId } },
        { matriculas: { some: { nivelAcademico: { nivelId } } } },
      ];
    } else if (sedeId && sedeId !== "ALL") {
      whereClause.OR = [
        { nivelAcademico: { sedeId } },
        { matriculas: { some: { nivelAcademico: { sedeId } } } },
      ];
    }

    const students = await prisma.user.findMany({
      where: whereClause,
      include: {
        nivelAcademico: {
          include: { grado: true, nivel: true, sede: true },
        },
        matriculas: {
          include: {
            nivelAcademico: {
              include: { grado: true, nivel: true, sede: true },
            },
          },
          orderBy: { fechaMatricula: "desc" },
        },
        institucion: true,
      },
      orderBy: [
        { apellidoPaterno: "asc" },
        { apellidoMaterno: "asc" },
        { name: "asc" },
      ],
    });

    if (students.length === 0) {
      return new NextResponse(
        "No se encontraron estudiantes para los filtros dados",
        { status: 404 },
      );
    }

    // Resolver el nivel académico activo (por matrícula o asignación directa)
    const resolvedStudents = students.map((st) => {
      const matchedMatricula =
        (nivelAcademicoId && nivelAcademicoId !== "ALL"
          ? st.matriculas.find((m) => m.nivelAcademicoId === nivelAcademicoId)
          : null) ||
        (gradoId && gradoId !== "ALL"
          ? st.matriculas.find((m) => m.nivelAcademico?.gradoId === gradoId)
          : null) ||
        (nivelId && nivelId !== "ALL"
          ? st.matriculas.find((m) => m.nivelAcademico?.nivelId === nivelId)
          : null) ||
        st.matriculas[0];

      const nivelAcademico = matchedMatricula?.nivelAcademico || st.nivelAcademico;
      return {
        ...st,
        resolvedNivelAcademico: nivelAcademico,
      };
    });

    // Ordenar de forma pedagógica: Grado -> Sección -> Apellidos
    resolvedStudents.sort((a, b) => {
      const ordA = a.resolvedNivelAcademico?.grado?.orden ?? 999;
      const ordB = b.resolvedNivelAcademico?.grado?.orden ?? 999;
      if (ordA !== ordB) return ordA - ordB;

      const secA = a.resolvedNivelAcademico?.seccion ?? "";
      const secB = b.resolvedNivelAcademico?.seccion ?? "";
      if (secA !== secB) return secA.localeCompare(secB);

      const apePatA = a.apellidoPaterno ?? "";
      const apePatB = b.apellidoPaterno ?? "";
      if (apePatA !== apePatB) return apePatA.localeCompare(apePatB);

      return (a.name ?? "").localeCompare(b.name ?? "");
    });

    const firstInst = students[0].institucion;
    const logoImage = resolvePdfImage(firstInst?.logo);

    // Generar códigos QR de alta densidad y nitidez en paralelo
    const studentItems: StudentCardItem[] = await Promise.all(
      resolvedStudents.map(async (st) => {
        const dni = st.dni || "S/D";
        let qrCode = "";
        try {
          qrCode = await QRCode.toDataURL(dni, {
            margin: 1,
            width: 200,
            errorCorrectionLevel: "M",
            color: { dark: "#0f172a", light: "#ffffff" },
          });
        } catch {
          // Fallback silencioso si falla QR
        }

        const nivelAc = st.resolvedNivelAcademico;
        const aula = nivelAc
          ? `${nivelAc.grado.nombre} "${nivelAc.seccion}"`
          : "General";

        return {
          id: st.id,
          name: st.name || "",
          apellidoPaterno: st.apellidoPaterno || "",
          apellidoMaterno: st.apellidoMaterno || "",
          dni,
          image: resolvePdfImage(st.image),
          aula,
          nivelNombre: nivelAc?.nivel?.nombre,
          sedeNombre: nivelAc?.sede?.nombre || undefined,
          qrCode,
        };
      }),
    );

    const { pdf } = await import("@react-pdf/renderer");
    const pdfInstance = pdf(
      React.createElement(BatchStudentCardsPDF, {
        students: studentItems,
        layout,
        institucion: {
          nombreInstitucion:
            firstInst?.nombreInstitucion || "Institución Educativa",
          lema: firstInst?.nombreComercial || "Formación Integral y Valores",
          codigoModular: firstInst?.codigoModular || "---",
          logo: logoImage,
          direccion: firstInst?.direccion || "Local Escolar Institucional",
          telefono: firstInst?.telefono || "Central Telefónica I.E.",
          ugel: firstInst?.ugel || "01",
        },
      }) as any,
    );

    const fileStream = await pdfInstance.toBuffer();
    const buffer = await collectPdfBuffer(fileStream);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Carnets-Lote-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando carnets en lote:", error);
    return new NextResponse("Error interno al generar los carnets", {
      status: 500,
    });
  }
}
