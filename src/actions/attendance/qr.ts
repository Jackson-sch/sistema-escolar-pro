"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serialize } from "@/lib/dto";
import { dispatchAttendanceNotification } from "./notifications";


/**
 * Registra asistencia mediante QR (Usado en el scanner de entrada)
 */
export async function registerQRAsistenciaAction(
  dni: string,
  mode: "ingreso" | "salida" = "ingreso"
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // 1. Buscar estudiante por DNI (con filtro multi-tenant y apoderados autorizados)
    const student = await prisma.user.findFirst({
      where: {
        dni,
        role: "estudiante",
        ...(session?.user?.institucionId ? { institucionId: session.user.institucionId } : {}),
      },
      include: {
        matriculas: {
          where: { estado: "activo" },
          include: {
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true,
              },
            },
          },
          orderBy: { anioAcademico: "desc" },
          take: 1,
        },
        padresTutores: {
          include: {
            padreTutor: {
              select: {
                id: true,
                name: true,
                apellidoPaterno: true,
                apellidoMaterno: true,
                dni: true,
                telefono: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!student) return { error: "Estudiante no encontrado en esta institución" };
    if (student.matriculas.length === 0)
      return { error: "Estudiante no cuenta con matrícula activa" };

    const matricula = student.matriculas[0];
    const gradoNombre = matricula.nivelAcademico?.grado?.nombre || "";
    const seccionNombre = matricula.nivelAcademico?.seccion || "";
    const nivelNombre = matricula.nivelAcademico?.nivel?.nombre || "";
    const aula = [gradoNombre, seccionNombre ? `"${seccionNombre}"` : "", nivelNombre ? `• ${nivelNombre}` : ""].filter(Boolean).join(" ");

    // Obtener personas autorizadas para retirar al alumno (Pick-up Seguro)
    const authorizedGuardians = (student.padresTutores || []).map((rel) => ({
      id: rel.padreTutor.id,
      name: `${rel.padreTutor.name || ""} ${rel.padreTutor.apellidoPaterno || ""} ${rel.padreTutor.apellidoMaterno || ""}`.trim(),
      parentesco: rel.parentesco || "Apoderado",
      dni: rel.padreTutor.dni,
      telefono: rel.padreTutor.telefono,
      image: rel.padreTutor.image,
      autorizadoRecoger: rel.autorizadoRecoger,
      esContactoEmergencia: rel.contactoPrimario,
    }));

    if (student.contactoEmergencia) {
      authorizedGuardians.push({
        id: `emergency-1-${student.id}`,
        name: student.contactoEmergencia,
        parentesco: student.parentescoContactoEmergencia || "Contacto Emergencia",
        dni: null,
        telefono: student.telefonoEmergencia || null,
        image: null,
        autorizadoRecoger: true,
        esContactoEmergencia: true,
      });
    }

    const studentData = {
      name: student.name,
      apellidoPaterno: student.apellidoPaterno,
      apellidoMaterno: student.apellidoMaterno,
      image: student.image,
      dni: student.dni,
      aula,
      grado: gradoNombre,
      seccion: seccionNombre,
      nivel: nivelNombre,
    };

    // 2. Buscar el primer curso disponible para registrar la asistencia académica
    const curso = await prisma.curso.findFirst({
      where: { nivelAcademicoId: matricula.nivelAcademicoId },
    });

    if (!curso)
      return {
        error: "No se encontró curso asignado para registrar la asistencia",
      };

    const currentTimeStr = new Date().toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Lima",
    });

    // 3. Buscar registro existente de hoy
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

    // ==========================================
    // FLUJO MODO SALIDA (EGRESO Y PICK-UP SEGURO)
    // ==========================================
    if (mode === "salida") {
      if (existing?.horaSalida) {
        return {
          error: "El estudiante ya registró su salida el día de hoy",
          alreadyMarked: true,
          data: {
            ...serialize(existing),
            mode: "salida",
            horaSalida: existing.horaSalida,
            authorizedGuardians,
            student: studentData,
          },
        };
      }

      let salidaResult;
      if (existing) {
        salidaResult = await prisma.asistencia.update({
          where: { id: existing.id },
          data: { horaSalida: currentTimeStr },
        });
      } else {
        salidaResult = await prisma.asistencia.create({
          data: {
            estudianteId: student.id,
            cursoId: curso.id,
            fecha: new Date(),
            presente: true,
            tardanza: false,
            horaSalida: currentTimeStr,
          },
        });
      }

      // Notificación de salida a apoderados
      let notifSalida: any = { notified: false };
      try {
        const studentFullName = `${student.name || ""} ${student.apellidoPaterno || ""}`.trim();
        const dispatchPromise = dispatchAttendanceNotification({
          studentId: student.id,
          studentName: studentFullName,
          dni: student.dni,
          aula,
          horaSalida: currentTimeStr,
          tipo: "salida",
          institucionId: student.institucionId,
          userId: session.user.id,
        });

        notifSalida = await Promise.race([
          dispatchPromise,
          new Promise((resolve) =>
            setTimeout(() => resolve({ notified: true, pending: true, channels: [] }), 350)
          ),
        ]);
      } catch (notifErr) {
        console.warn("Error en notificación de salida:", notifErr);
      }

      revalidatePath("/asistencia");
      return {
        success: "Salida registrada correctamente",
        data: {
          ...serialize(salidaResult),
          mode: "salida",
          horaSalida: currentTimeStr,
          notification: notifSalida,
          authorizedGuardians,
          student: studentData,
        },
      };
    }

    // ==========================================
    // FLUJO MODO INGRESO (ENTRADA Y PUNTUALIDAD)
    // ==========================================
    // Determinar si hay tardanza mediante Políticas de Asistencia
    const [hEntradaFallback, mEntradaFallback] = (
      (
        await prisma.variableSistema.findUnique({
          where: { clave: "HORA_ENTRADA" },
        })
      )?.valor || "08:00"
    )
      .split(":")
      .map(Number);

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
        { nivelId: "desc" },
        { turno: "desc" },
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

    if (tolerancia > 0) {
      limitTime.setMinutes(limitTime.getMinutes() + tolerancia);
    }

    const isTardanza = checkTime > limitTime;
    const horaLlegada = currentTimeStr;

    let result;
    if (existing) {
      if (existing.presente) {
        return {
          error: "El estudiante ya registró su asistencia el día de hoy",
          alreadyMarked: true,
          data: {
            ...serialize(existing),
            mode: "ingreso",
            student: studentData,
            authorizedGuardians,
          },
        };
      }

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
          fecha: new Date(),
          presente: true,
          tardanza: isTardanza,
          horaLlegada: horaLlegada,
        },
      });
    }

    // Despacho de notificación de ingreso a padres
    let notificationResult: any = { notified: false };
    try {
      const studentFullName = `${student.name || ""} ${student.apellidoPaterno || ""}`.trim();
      const dispatchPromise = dispatchAttendanceNotification({
        studentId: student.id,
        studentName: studentFullName,
        dni: student.dni,
        aula,
        horaLlegada,
        isTardanza,
        tipo: "ingreso",
        institucionId: student.institucionId,
        userId: session.user.id,
      });

      notificationResult = await Promise.race([
        dispatchPromise,
        new Promise((resolve) =>
          setTimeout(() => resolve({ notified: true, pending: true, channels: [] }), 350)
        ),
      ]);
    } catch (notifErr) {
      console.warn("Error en dispatchAttendanceNotification:", notifErr);
    }

    revalidatePath("/asistencia");
    return {
      success: "Asistencia registrada correctamente",
      data: {
        ...serialize(result),
        mode: "ingreso",
        notification: notificationResult,
        authorizedGuardians,
        student: studentData,
      },
    };
  } catch (error) {
    console.error("Error in QR attendance:", error);
    return { error: "Error al procesar el ingreso por QR" };
  }
}

/**
 * Obtiene los registros de asistencia más recientes y métricas del día para el scanner
 */
export async function getRecentAttendanceLogsAction() {
  try {
    const session = await auth();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const whereCondition = {
      fecha: {
        gte: startOfDay,
        lte: endOfDay,
      },
      presente: true,
      ...(session?.user?.institucionId
        ? { estudiante: { institucionId: session.user.institucionId } }
        : {}),
    };

    const [logs, totalToday, tardanzasToday, salidasToday] = await Promise.all([
      prisma.asistencia.findMany({
        where: whereCondition,
        include: {
          estudiante: {
            include: {
              matriculas: {
                where: { estado: "activo" },
                include: {
                  nivelAcademico: {
                    include: {
                      grado: true,
                      nivel: true,
                    },
                  },
                },
                orderBy: { anioAcademico: "desc" },
                take: 1,
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 30,
      }),
      prisma.asistencia.count({
        where: whereCondition,
      }),
      prisma.asistencia.count({
        where: {
          ...whereCondition,
          tardanza: true,
        },
      }),
      prisma.asistencia.count({
        where: {
          ...whereCondition,
          horaSalida: { not: null },
        },
      }),
    ]);

    const puntualesToday = Math.max(0, totalToday - tardanzasToday);

    const formattedLogs = logs.map((log) => {
      const matricula = log.estudiante.matriculas?.[0];
      const gNom = matricula?.nivelAcademico?.grado?.nombre || "";
      const sNom = matricula?.nivelAcademico?.seccion || "";
      const nNom = matricula?.nivelAcademico?.nivel?.nombre || "";
      const aula = [gNom, sNom ? `"${sNom}"` : "", nNom ? `• ${nNom}` : ""].filter(Boolean).join(" ");

      return {
        id: log.id,
        studentName: `${log.estudiante.name || ""} ${log.estudiante.apellidoPaterno || ""} ${log.estudiante.apellidoMaterno || ""}`.trim(),
        dni: log.estudiante.dni,
        time:
          log.horaSalida ||
          log.horaLlegada ||
          new Date(log.createdAt).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Lima",
          }),
        status: log.tardanza ? "late" : "success",
        mode: (log.horaSalida ? "salida" : "ingreso") as "ingreso" | "salida",
        horaSalida: log.horaSalida || undefined,
        image: log.estudiante.image || undefined,
        aula: aula || undefined,
        grado: gNom || undefined,
        seccion: sNom || undefined,
      };
    });

    return {
      data: serialize(formattedLogs),
      stats: {
        total: totalToday,
        puntuales: puntualesToday,
        tardanzas: tardanzasToday,
        salidas: salidasToday,
      },
    };
  } catch (error) {
    console.error("Error fetching recent logs:", error);
    return { error: "Fallo al obtener el historial reciente" };
  }
}
