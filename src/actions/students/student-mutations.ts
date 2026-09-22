"use server";

import { serialize } from "@/lib/dto";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFile } from "@/lib/storage";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { sanitizeData, splitFullName } from "./student-helpers";

/**
 * Crea un nuevo estudiante
 */
export async function createStudentAction(values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = [
      "super_admin",
      "admin",
      "administrador",
      "director",
      "coordinador",
      "administrativo",
    ];
    if (!allowedRoles.includes(rawRole)) {
      return { error: "No tienes permiso para registrar estudiantes." };
    }

    const institucionId = session.user.institucionId;

    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values;

    const hashedPassword = await bcrypt.hash(studentData.dni, 10);

    // Crear el estudiante
    const student = await prisma.user.create({
      data: {
        ...sanitizeData(studentData),
        institucionId: institucionId || studentData.institucionId,
        fechaNacimiento: studentData.fechaNacimiento
          ? new Date(studentData.fechaNacimiento)
          : null,
        role: "estudiante" as Role,
        password: hashedPassword,
      },
    });

    // Si hay datos de apoderado, vincular o crear
    if (dniApoderado && nombreApoderado) {
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado },
      });

      if (apoderado && apoderado.role !== "padre") {
        const roleText =
          apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return {
          error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.`,
        };
      }

      if (!apoderado) {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        apoderado = await prisma.user.create({
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            dni: dniApoderado,
            telefono: telefonoApoderado,
            role: "padre" as Role,
            estadoId: studentData.estadoId,
            institucionId: studentData.institucionId,
          },
        });
      }

      await prisma.relacionFamiliar.create({
        data: {
          hijoId: student.id,
          padreTutorId: apoderado.id,
          parentesco: parentescoApoderado || "APODERADO",
          contactoPrimario: true,
        },
      });
    }

    revalidatePath("/gestion/estudiantes");
    return {
      success: "Estudiante registrado con éxito",
      data: serialize(student),
    };
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "P2002") {
      return { error: "El DNI o correo ya se encuentra registrado" };
    }
    return { error: "Error al registrar el estudiante" };
  }
}

/**
 * Actualiza un estudiante existente
 */
export async function updateStudentAction(id: string, values: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values;

    // Si se está actualizando la imagen, eliminar la anterior físicamente
    if (Object.prototype.hasOwnProperty.call(studentData, "image")) {
      const currentStudent = await prisma.user.findUnique({
        where: { id },
        select: { image: true },
      });

      if (currentStudent?.image && currentStudent.image !== studentData.image) {
        await deleteFile(currentStudent.image);
      }
    }

    // 1. Actualizar el estudiante
    const student = await prisma.user.update({
      where: { id },
      data: {
        ...sanitizeData(studentData),
        fechaNacimiento: studentData.fechaNacimiento
          ? new Date(studentData.fechaNacimiento)
          : undefined,
      },
    });

    // 2. Gestionar el Apoderado si se proporcionaron datos básicos
    if (dniApoderado && nombreApoderado) {
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado },
      });

      if (apoderado && apoderado.role !== "padre") {
        const roleText =
          apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return {
          error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.`,
        };
      }

      if (!apoderado) {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        apoderado = await prisma.user.create({
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            dni: dniApoderado,
            telefono: telefonoApoderado,
            role: "padre" as Role,
            estadoId: studentData.estadoId,
            institucionId: studentData.institucionId,
          },
        });
      } else {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        await prisma.user.update({
          where: { id: apoderado.id },
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            telefono: telefonoApoderado,
          },
        });
      }

      const relacionExistente = await prisma.relacionFamiliar.findFirst({
        where: {
          hijoId: id,
          padreTutorId: apoderado.id,
        },
      });

      if (!relacionExistente) {
        await prisma.relacionFamiliar.updateMany({
          where: { hijoId: id },
          data: { contactoPrimario: false },
        });

        await prisma.relacionFamiliar.create({
          data: {
            hijoId: id,
            padreTutorId: apoderado.id,
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true,
          },
        });
      } else {
        await prisma.relacionFamiliar.update({
          where: { id: relacionExistente.id },
          data: {
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true,
          },
        });
      }
    }

    revalidatePath("/gestion/estudiantes");
    return {
      success: "Estudiante actualizado correctamente",
      data: serialize(student),
    };
  } catch (error: any) {
    console.error("Error updating student:", error);
    return { error: "No se pudo actualizar la información del estudiante" };
  }
}

/**
 * Elimina un estudiante
 */
export async function deleteStudentAction(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const estadoRetirado = await prisma.estadoUsuario.upsert({
      where: { codigo: "RETIRADO" },
      update: {},
      create: {
        codigo: "RETIRADO",
        nombre: "Retirado / Baja",
        color: "#ef4444",
        permiteLogin: false,
        esActivo: false,
        sistemico: true,
      },
    });

    await prisma.user.update({
      where: { id },
      data: { 
        estadoId: estadoRetirado.id,
        nivelAcademicoId: null,
      },
    });

    revalidatePath("/gestion/estudiantes");
    return { success: "Estudiante dado de baja correctamente (Soft Delete)" };
  } catch (error) {
    console.error("Error soft-deleting student:", error);
    return { error: "No se pudo dar de baja al estudiante" };
  }
}
