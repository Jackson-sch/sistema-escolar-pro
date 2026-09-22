import "@/lib/react-pdf-polyfill";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  ConstanciaMatriculaPDF,
  ConstanciaMatriculaData,
} from "@/components/gestion/estudiantes/components/constancia-matricula-pdf";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { collectPdfBuffer, resolvePdfImage } from "@/lib/pdf-server-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const estudianteId = searchParams.get("estudianteId");

  if (!estudianteId) {
    return new NextResponse("Falta el ID del estudiante", { status: 400 });
  }

  try {
    const estudiante = await prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: {
          include: { grado: true, nivel: true, sede: true },
        },
        matriculas: {
          orderBy: { anioAcademico: "desc" },
          take: 1,
        },
        institucion: {
          include: {
            sedes: { where: { esPrincipal: true } },
          },
        },
      },
    });

    if (!estudiante || !estudiante.institucion) {
      return new NextResponse("Estudiante o institución no encontrada", {
        status: 404,
      });
    }

    const dni = estudiante.dni || "S/D";
    const inst = estudiante.institucion;
    const sedePrincipal = inst.sedes?.[0];
    const matricula = estudiante.matriculas?.[0];

    const currentYear =
      matricula?.anioAcademico ||
      inst.cicloEscolarActual ||
      new Date().getFullYear();

    // Generar código QR de validación
    let qrCode = "";
    try {
      const verificationUrl = `https://sistemaescolar.pro/verificar?doc=constancia&dni=${dni}&anio=${currentYear}`;
      qrCode = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 180,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    } catch {
      // Ignore QR generation error
    }

    const logoImage = resolvePdfImage(inst.logo);

    const constanciaData: ConstanciaMatriculaData = {
      estudianteNombre:
        `${estudiante.apellidoPaterno || ""} ${estudiante.apellidoMaterno || ""}, ${estudiante.name || ""}`.trim(),
      dni,
      codigoEstudiante:
        estudiante.codigoEstudiante || estudiante.codigoSiagie || dni,
      nivel: estudiante.nivelAcademico?.nivel?.nombre || "Primaria",
      grado: estudiante.nivelAcademico?.grado?.nombre || "1ro",
      seccion: estudiante.nivelAcademico?.seccion || "A",
      sedeNombre:
        estudiante.nivelAcademico?.sede?.nombre ||
        sedePrincipal?.nombre ||
        "Sede Principal",
      fechaMatricula: matricula?.fechaMatricula || new Date(),
      anioLectivo: currentYear,
      institucion: {
        nombreInstitucion: inst.nombreInstitucion,
        codigoModular: inst.codigoModular || undefined,
        ugel: inst.ugel || undefined,
        dre: inst.dre || undefined,
        direccion: sedePrincipal?.direccion || inst.direccion || undefined,
        distrito: inst.distrito || undefined,
        provincia: inst.provincia || undefined,
        departamento: inst.departamento || undefined,
        director: sedePrincipal?.director || "Dirección General",
        logo: logoImage,
      },
      qrCode,
    };

    const { pdf } = await import("@react-pdf/renderer");
    const pdfInstance = pdf(
      React.createElement(ConstanciaMatriculaPDF, {
        data: constanciaData,
      }) as any,
    );

    const fileStream = await pdfInstance.toBuffer();
    const buffer = await collectPdfBuffer(fileStream);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Constancia-Matricula-${dni}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando constancia:", error);
    return new NextResponse("Error interno al generar la constancia", {
      status: 500,
    });
  }
}
