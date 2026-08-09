import "@/lib/react-pdf-polyfill";
import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { GradeReportPDF } from "@/components/reports/grade-report-pdf";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { getRankingEstudianteAction } from "@/actions/evaluations";
import { formatTitleCase } from "@/lib/formats";

import { resolvePdfImage } from "@/lib/pdf-server-utils";

export async function GET(req: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const { searchParams, origin } = new URL(req.url);
  const estudianteId = searchParams.get('estudianteId');
  const anio = parseInt(searchParams.get('anio') || new Date().getFullYear().toString(), 10);

  if (!estudianteId) {
    return new NextResponse("Falta el ID del estudiante", { status: 400 });
  }

  const userId = session.user.id;
  const userRole = (session.user.role || "").toString().toLowerCase();
  const userInstitucionId = session.user.institucionId;

  try {
    // 1. Obtener datos del estudiante y su institución
    const estudiante = await prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: {
          include: { grado: true, nivel: true }
        },
        institucion: true,
      }
    });

    if (!estudiante || !estudiante.institucion) {
      return new NextResponse("Estudiante o institución no encontrada", { status: 404 });
    }

    // Verificar si el usuario autenticado es un familiar/apoderado registrado
    const relacionFamiliar = await prisma.relacionFamiliar.findFirst({
      where: {
        hijoId: estudianteId,
        padreTutorId: userId,
      }
    });

    // Validación de autorización:
    // Debe ser admin/profesor de la misma institución, o el propio estudiante, o su apoderado
    const isAdminOrStaff = ["super_admin", "admin", "administrador", "administrativo", "director", "coordinador", "profesor", "docente"].includes(userRole);
    const isSelf = userId === estudianteId;
    const isParent = !!relacionFamiliar;
    const sameInstitution = !userInstitucionId || userInstitucionId === estudiante.institucion.id;

    if ((!isAdminOrStaff && !isSelf && !isParent) || !sameInstitution) {
      return new NextResponse("Acceso denegado a la boleta del estudiante", { status: 403 });
    }

    const cicloScolar = estudiante.institucion.cicloEscolarActual || anio;

    // 2. Obtener periodos del año (para mapeo cronológico)
    const periodosDelAnio = await prisma.periodoAcademico.findMany({
      where: {
        institucionId: estudiante.institucion.id,
        anioEscolar: cicloScolar,
        activo: true,
      },
      orderBy: { fechaInicio: 'asc' }
    });

    // Creamos un mapa de ID de periodo -> índice cronológico (0 para B1, 1 para B2...)
    const periodoIndexMap = new Map(periodosDelAnio.map((p, i) => [p.id, i]));

    // 3. Obtener notas
    const notasBD = await prisma.nota.findMany({
      where: { estudianteId },
      include: { 
        curso: true,
        evaluacion: {
          include: { periodo: true }
        }
      }
    });

    // Agrupamos las notas por curso mapeando al bimestre cronológico correcto
    const notasPorCurso = notasBD.reduce((acc, nota) => {
      const cursoId = nota.cursoId;
      const cursoNombre = nota.curso.nombre;
      
      const bimesterIndex = periodoIndexMap.has(nota.evaluacion.periodoId) 
        ? periodoIndexMap.get(nota.evaluacion.periodoId)! 
        : (nota.evaluacion.periodo.numero || 1) - 1;
      
      const safeIndex = Math.max(0, Math.min(3, bimesterIndex));
      
      if (!acc[cursoId]) {
        acc[cursoId] = {
          nombre: cursoNombre,
          bimestres: Array(4).fill(null)
        };
      }
      acc[cursoId].bimestres[safeIndex] = {
        valor: nota.valor,
        literal: nota.valorLiteral || (nota.valor >= 18 ? 'AD' : nota.valor >= 15 ? 'A' : nota.valor >= 11 ? 'B' : 'C')
      };
      return acc;
    }, {} as Record<string, { nombre: string, bimestres: (any | null)[] }>);

    // Mapeamos a la estructura de GradeReportPDF
    const cursosFormateados = Object.entries(notasPorCurso).map(([id, data]) => {
      const existentes = data.bimestres.filter(v => v !== null);
      const promedio = existentes.length > 0 
        ? Math.round(existentes.reduce((sum, n) => sum + n.valor, 0) / existentes.length)
        : 0;
      
      const getLiteral = (v: number) => {
        if (v >= 18) return 'AD';
        if (v >= 15) return 'A';
        if (v >= 11) return 'B';
        return 'C';
      };

      return {
        cursoId: id,
        cursoNombre: data.nombre,
        periodos: data.bimestres.map((b, i) => ({
          periodoId: periodosDelAnio[i]?.id || `p-${i}`,
          promedio: b?.valor || 0,
          literal: b?.literal || '-'
        })),
        promedioFinal: promedio,
        literalFinal: getLiteral(promedio)
      };
    });

    // 4. Ranking
    const rankingRes = await getRankingEstudianteAction({
      estudianteId,
      anioEscolar: cicloScolar
    });
    const puesto = rankingRes.success?.posicion || 1;

    // 5. Preparar data final para GradeReportPDF
    const puntajes = [0, 1, 2, 3].map(i => {
      const suma = cursosFormateados.reduce((acc, c) => acc + (c.periodos[i].promedio || 0), 0);
      return suma;
    });

    const promediosBimestrales = puntajes.map(p => cursosFormateados.length > 0 ? Math.round(p / cursosFormateados.length) : 0);

    const pdfData = {
      estudiante: {
        nombreCompleto: formatTitleCase(`${estudiante.apellidoPaterno || ''} ${estudiante.apellidoMaterno || ''}, ${estudiante.name || ''}`.trim()),
        dni: estudiante.dni || 'S/D',
        codigo: estudiante.codigoEstudiante || estudiante.dni || 'S/C',
        grado: estudiante.nivelAcademico?.grado?.nombre || 'N/A',
        seccion: estudiante.nivelAcademico?.seccion || 'N/A',
        nivel: estudiante.nivelAcademico?.nivel?.nombre || 'N/A',
        institucion: estudiante.institucion.nombreInstitucion,
        institucionCompleta: estudiante.institucion,
        logo: resolvePdfImage(estudiante.institucion.logo),
      },
      origin,
      periodos: periodosDelAnio,
      cursos: cursosFormateados,
      anioAcademico: cicloScolar,
      resumen: {
        puntajes,
        promedios: promediosBimestrales
      }
    };

    const { pdf } = await import("@react-pdf/renderer");
    const pdfInstance = pdf(React.createElement(GradeReportPDF, { data: pdfData as any }) as any);
    const buffer = await pdfInstance.toBuffer();

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Boleta_${estudiante.dni}_${cicloScolar}.pdf"`
      }
    });

  } catch (error) {
    console.error("Error generating PDF:", error);
    return new NextResponse("Error interno al generar boleta", { status: 500 });
  }
}
