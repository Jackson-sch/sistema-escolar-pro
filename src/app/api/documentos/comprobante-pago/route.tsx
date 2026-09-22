import "@/lib/react-pdf-polyfill";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  ComprobantePagoPDF,
  ComprobantePagoPdfData,
} from "@/components/finanzas/cronogramas/comprobante-pago-pdf";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { collectPdfBuffer, resolvePdfImage } from "@/lib/pdf-server-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const numeroBoleta = searchParams.get("numeroBoleta");
  const pagoId = searchParams.get("pagoId");

  if (!numeroBoleta && !pagoId) {
    return new NextResponse("Falta el número de boleta o ID del pago", {
      status: 400,
    });
  }

  try {
    const pago = await prisma.pago.findFirst({
      where: numeroBoleta ? { numeroBoleta } : { id: pagoId! },
      include: {
        estudiante: {
          include: {
            nivelAcademico: {
              include: { grado: true, nivel: true, sede: true },
            },
            institucion: {
              include: {
                sedes: { where: { esPrincipal: true } },
              },
            },
            padresTutores: {
              include: { padreTutor: true },
            },
          },
        },
        cronogramaPago: {
          include: { concepto: true },
        },
      },
    });

    if (!pago || !pago.estudiante) {
      return new NextResponse("Pago no encontrado", { status: 404 });
    }

    const est = pago.estudiante;
    const inst = est.institucion;
    const sedePrincipal = inst?.sedes?.[0];
    const guardian = est.padresTutores?.[0]?.padreTutor;

    let qrCode = "";
    try {
      const verificationUrl = `https://sistemaescolar.pro/verificar?doc=recibo&nro=${pago.numeroBoleta}`;
      qrCode = await QRCode.toDataURL(verificationUrl, {
        margin: 1,
        width: 150,
        color: { dark: "#0f172a", light: "#ffffff" },
      });
    } catch {
      // Ignore QR generation error
    }

    const logoImage = resolvePdfImage(inst?.logo);

    const pdfData: ComprobantePagoPdfData = {
      numeroBoleta: pago.numeroBoleta || "001-000",
      fechaPago: pago.fechaPago || pago.fechaRegistro,
      metodoPago: pago.metodoPago || "Efectivo",
      referenciaPago: pago.referenciaPago || pago.numeroOperacion || undefined,
      totalCobrado: Number(pago.monto),
      observaciones: pago.observaciones || undefined,
      estudiante: {
        nombreCompleto:
          `${est.apellidoPaterno || ""} ${est.apellidoMaterno || ""}, ${est.name || ""}`.trim(),
        dni: est.dni || "S/D",
        codigoEstudiante: est.codigoEstudiante || undefined,
        aula: est.nivelAcademico
          ? `${est.nivelAcademico.grado.nombre} "${est.nivelAcademico.seccion}" (${est.nivelAcademico.nivel.nombre})`
          : "General",
      },
      apoderado: guardian
        ? {
            nombre: `${guardian.name} ${guardian.apellidoPaterno || ""}`.trim(),
            dni: guardian.dni || undefined,
            telefono: guardian.telefono || undefined,
          }
        : undefined,
      institucion: {
        nombreInstitucion:
          inst?.nombreInstitucion || "Institución Educativa",
        codigoModular: inst?.codigoModular || undefined,
        direccion: sedePrincipal?.direccion || inst?.direccion || undefined,
        telefono: sedePrincipal?.telefono || inst?.telefono || undefined,
        distrito: inst?.distrito || undefined,
        logo: logoImage,
      },
      items: [
        {
          concepto:
            pago.cronogramaPago?.concepto?.nombre ||
            pago.concepto ||
            "Pensión Escolar",
          monto: Number(pago.monto),
        },
      ],
      qrCode,
    };

    const { pdf } = await import("@react-pdf/renderer");
    const pdfInstance = pdf(
      React.createElement(ComprobantePagoPDF, {
        data: pdfData,
      }) as any,
    );

    const fileStream = await pdfInstance.toBuffer();
    const buffer = await collectPdfBuffer(fileStream);

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Recibo-${pago.numeroBoleta}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generando comprobante de pago:", error);
    return new NextResponse("Error interno al generar el comprobante", {
      status: 500,
    });
  }
}
