"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";

/**
 * Registra asistencia mediante QR (Usado en el scanner de entrada)
 */
export async function registerQRAsistenciaAction(dni: string) {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. Buscar estudiante por DNI
    const student = await prisma.user.findFirst({
      where: {
        dni,
        role: "estudiante",
      },
      include: {
        matriculas: {
          where: { estado: "activo" },
          include: { nivelAcademico: true },
          orderBy: { anioAcademico: "desc" },
          take: 1,
        },
      },
    });

    if (!student) return { error: "Estudiante no encontrado" };
    if (student.matriculas.length === 0)
      return { error: "Estudiante no cuenta con matrícula activa" };

    const matricula = student.matriculas[0];

    // 2. Determinar si hay tardanza mediante Polticas de Asistencia
    // Buscamos políticas aplicables: 1. Nivel + Turno, 2. Nivel, 3. Turno, 4. Global
    const [hEntradaFallback, mEntradaFallback] = (
      (
        await prisma.variableSistema.findUnique({
          where: { clave: "HORA_ENTRADA" },
        })
      )?.valor || "08:00"
    )
      .split(":")
      .map(Number);

    const [hSalidaFallback, mSalidaFallback] = (
      (
        await prisma.variableSistema.findUnique({
          where: { clave: "HORA_SALIDA" },
        })
      )?.valor || "13:00"
    )
      .split(":")
      .map(Number);

    // Intentar encontrar política específica
    const politica = await prisma.politicaAsistencia.findFirst({
      where: {
        institucionId: student.institucionId || undefined,
        activo: true,
        OR: [
          {
            nivelId: matricula.nivelAcademico.nivelId,
            turno: matricula.nivelAcademico.turno,
          },
          { nivelId: matricula.nivelAcademico.nivelId, turno: null },
          { nivelId: null, turno: matricula.nivelAcademico.turno },
        ],
      },
      orderBy: [
        { nivelId: "desc" }, // Priorizar los que tienen nivelId
        { turno: "desc" }, // Priorizar los que tienen turno
      ],
    });

    const hEntrada = politica
      ? parseInt(politica.horaEntrada.split(":")[0])
      : hEntradaFallback;
    const mEntrada = politica
      ? parseInt(politica.horaEntrada.split(":")[1])
      : mEntradaFallback;
    const tolerancia = politica?.tolerancia || 0;

    const checkTime = new Date();
    const limitTime = new Date();
    limitTime.setHours(hEntrada, mEntrada, 0, 0);

    // Aplicar tolerancia: si la entrada es 08:00 y tolerancia 10, el límite es 08:10
    if (tolerancia > 0) {
      limitTime.setMinutes(limitTime.getMinutes() + tolerancia);
    }

    const isTardanza = checkTime > limitTime;
    const horaLlegada = checkTime.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    });

    // 3. Buscar el primer curso disponible para registrar la asistencia académica
    // (En una implementación ideal, esto sería un registro de ingreso general)
    const curso = await prisma.curso.findFirst({
      where: { nivelAcademicoId: matricula.nivelAcademicoId },
    });

    if (!curso)
      return {
        error: "No se encontró curso asignado para registrar la asistencia",
      };

    // 4. Registrar o actualizar la asistencia
    const existing = await prisma.asistencia.findFirst({
      where: {
        estudianteId: student.id,
        cursoId: curso.id,
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    let result;
    if (existing) {
      // Si ya marcó hoy, no permitir marcar de nuevo para evitar spam
      if (existing.presente) {
        return {
          error: "El estudiante ya registró su asistencia el día de hoy",
          alreadyMarked: true,
          data: {
            student: {
              name: student.name,
              apellidoPaterno: student.apellidoPaterno,
              apellidoMaterno: student.apellidoMaterno,
              image: student.image,
              dni: student.dni,
            },
          },
        };
      }

      // Si existía (quizás marcado como ausente por el sistema temprano), lo ponemos como presente
      result = await prisma.asistencia.update({
        where: { id: existing.id },
        data: {
          presente: true,
          tardanza: isTardanza,
          horaLlegada: existing.horaLlegada || horaLlegada,
        },
      });
    } else {
      result = await prisma.asistencia.create({
        data: {
          estudianteId: student.id,
          cursoId: curso.id,
          fecha: new Date(), // Usar hora exacta del servidor
          presente: true,
          tardanza: isTardanza,
          horaLlegada: horaLlegada,
        },
      });
    }

    revalidatePath("/asistencia");
    return {
      success: "Asistencia registrada correctamente",
      data: {
        ...serialize(result),
        student: {
          name: student.name,
          apellidoPaterno: student.apellidoPaterno,
          apellidoMaterno: student.apellidoMaterno,
          image: student.image,
          dni: student.dni,
        },
      },
    };
  } catch (error) {
    console.error("Error in QR attendance:", error);
    return { error: "Error al procesar el ingreso por QR" };
  }
}

/**
 * Obtiene los registros de asistencia más recientes para el scanner
 */
export async function getRecentAttendanceLogsAction() {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const logs = await prisma.asistencia.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
        presente: true,
      },
      include: {
        estudiante: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      studentName: `${log.estudiante.name} ${log.estudiante.apellidoPaterno} ${log.estudiante.apellidoMaterno}`,
      dni: log.estudiante.dni,
      time:
        log.horaLlegada ||
        new Date(log.createdAt).toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Lima",
        }),
      status: log.tardanza ? "late" : "success",
      image: log.estudiante.image || undefined,
    }));

    return { data: serialize(formattedLogs) };
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return { error: "Fallo al obtener el historial reciente" };
  }
}
