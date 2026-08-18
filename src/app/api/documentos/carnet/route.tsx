import "@/lib/react-pdf-polyfill";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { StudentCardPDF } from "@/components/gestion/estudiantes/components/student-card-pdf";
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

  const userId = session.user.id;
  const userRole = (session.user.role || "").toString().toLowerCase();
  const userInstitucionId = session.user.institucionId;

  try {
    const estudiante = await prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: {
          include: { grado: true, nivel: true, sede: true },
        },
        institucion: true,
      },
    });

    if (!estudiante || !estudiante.institucion) {
      return new NextResponse("Estudiante o institución no encontrada", {
        status: 404,
      });
    }

    const relacionFamiliar = await prisma.relacionFamiliar.findFirst({
      where: {
        hijoId: estudianteId,
        padreTutorId: userId,
      },
    });

    const isAdminOrStaff = [
      "super_admin",
      "admin",
      "administrador",
      "administrativo",
      "director",
      "coordinador",
      "profesor",
      "docente",
    ].includes(userRole);
    const isSelf = userId === estudianteId;
    const isParent = !!relacionFamiliar;
    const sameInstitution =
      !userInstitucionId || userInstitucionId === estudiante.institucion.id;

    if ((!isAdminOrStaff && !isSelf && !isParent) || !sameInstitution) {
      return new NextResponse("Acceso denegado al carnet del estudiante", {
        status: 403,
      });
    }

    const dni = estudiante.dni || "S/D";

    const qrCode = await QRCode.toDataURL(dni, {
      margin: 1,
      width: 200,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const studentImage = resolvePdfImage(estudiante.image);
    const logoImage = resolvePdfImage(estudiante.institucion.logo);

    const { pdf } = await import("@react-pdf/renderer");
    const pdfInstance = pdf(
      React.createElement(StudentCardPDF, {
        student: {
          name: estudiante.name || "",
          apellidoPaterno: estudiante.apellidoPaterno || "",
          apellidoMaterno: estudiante.apellidoMaterno || "",
          dni,
          image: studentImage,
          nivelAcademico: estudiante.nivelAcademico
            ? {
                seccion: estudiante.nivelAcademico.seccion,
                grado: { nombre: estudiante.nivelAcademico.grado.nombre },
                nivel: { nombre: estudiante.nivelAcademico.nivel.nombre },
                sede: estudiante.nivelAcademico.sede
                  ? { nombre: estudiante.nivelAcademico.sede.nombre }
                  : null,
              }
            : null,
        },
        institucion: {
          nombreInstitucion: estudiante.institucion.nombreInstitucion,
          lema: "Excelencia Educativa",
          codigoModular: estudiante.institucion.codigoModular,
          logo: logoImage,
        },
        qrCode,
      }) as any
    );
    // In @react-pdf/renderer 4.x `toBuffer()` returns a pdfkit stream, so collect it
    // into a real Buffer before sending it as the response body.
    const fileStream = await pdfInstance.toBuffer();
    const buffer = await collectPdfBuffer(fileStream);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Carnet-${dni}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando carnet:", error);
    return new NextResponse("Error interno al generar el carnet", {
      status: 500,
    });
  }
}