"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { splitFullName } from "./student-helpers";
import { StudentImportPayload } from "./student-import-types";

export async function importStudentsBulkAction(
  students: StudentImportPayload[],
  defaultNivelAcademicoId?: string,
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const institucionId = session.user.institucionId;
    if (!institucionId && session.user.role !== "super_admin") {
      return { error: "Institución no especificada" };
    }

    const institucion = await prisma.institucionEducativa.findFirst({
      where: institucionId ? { id: institucionId } : undefined,
      select: { id: true, cicloEscolarActual: true },
    });

    const targetInstitucionId = institucion?.id || institucionId!;
    const currentYear =
      institucion?.cicloEscolarActual || new Date().getFullYear();

    // Obtener o crear estado 'Activo'
    let estadoActivo = await prisma.estadoUsuario.findFirst({
      where: {
        institucionId: targetInstitucionId,
        esActivo: true,
      },
    });

    if (!estadoActivo) {
      estadoActivo = await prisma.estadoUsuario.findFirst({
        where: { esActivo: true },
      });
    }

    if (!estadoActivo) {
      estadoActivo = await prisma.estadoUsuario.create({
        data: {
          codigo: `ACTIVO_${targetInstitucionId.substring(0, 8)}`,
          nombre: "Activo",
          color: "#10b981",
          permiteLogin: true,
          esActivo: true,
          sistemico: true,
          institucionId: targetInstitucionId,
        },
      });
    }

    // Cargar mapa de secciones para resolución rápida por [Nivel][Grado][Seccion]
    const secciones = await prisma.nivelAcademico.findMany({
      where: {
        institucionId: targetInstitucionId,
        anioAcademico: currentYear,
        activo: true,
      },
      include: {
        grado: { include: { nivel: true } },
      },
    });

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (const item of students) {
      try {
        if (!item.dni || !item.nombres || !item.apellidoPaterno) {
          continue;
        }

        // Resolver sección
        let nivelAcademicoId = defaultNivelAcademicoId || null;
        if (item.nivel && item.grado) {
          const match = secciones.find(
            (s) =>
              s.grado.nivel.nombre.toLowerCase().trim() ===
                item.nivel!.toLowerCase().trim() &&
              s.grado.nombre.toLowerCase().trim() ===
                item.grado!.toLowerCase().trim() &&
              (!item.seccion ||
                s.seccion.toLowerCase().trim() ===
                  item.seccion.toLowerCase().trim()),
          );
          if (match) {
            nivelAcademicoId = match.id;
          }
        }

        const hashedPassword = await bcrypt.hash(item.dni, 10);
        const fechaNac = item.fechaNacimiento
          ? new Date(item.fechaNacimiento)
          : null;

        // Upsert estudiante por DNI
        const existingStudent = await prisma.user.findUnique({
          where: { dni: item.dni },
        });

        let studentId = "";

        if (existingStudent) {
          await prisma.user.update({
            where: { id: existingStudent.id },
            data: {
              name: item.nombres.toUpperCase(),
              apellidoPaterno: item.apellidoPaterno.toUpperCase(),
              apellidoMaterno: item.apellidoMaterno.toUpperCase(),
              sexo: item.genero || existingStudent.sexo,
              telefono: item.telefono || existingStudent.telefono,
              email: item.email || existingStudent.email,
              direccion: item.direccion || existingStudent.direccion,
              codigoSiagie: item.codigoSiagie || existingStudent.codigoSiagie,
              nivelAcademicoId:
                nivelAcademicoId || existingStudent.nivelAcademicoId,
            },
          });
          studentId = existingStudent.id;
          updatedCount++;
        } else {
          const newStudent = await prisma.user.create({
            data: {
              dni: item.dni,
              name: item.nombres.toUpperCase(),
              apellidoPaterno: item.apellidoPaterno.toUpperCase(),
              apellidoMaterno: item.apellidoMaterno.toUpperCase(),
              sexo: item.genero || undefined,
              fechaNacimiento:
                fechaNac && !isNaN(fechaNac.getTime()) ? fechaNac : undefined,
              telefono: item.telefono || undefined,
              email: item.email || undefined,
              direccion: item.direccion || undefined,
              codigoSiagie: item.codigoSiagie || undefined,
              codigoEstudiante: `EST-${item.dni}`,
              role: "estudiante" as Role,
              password: hashedPassword,
              estadoId: estadoActivo.id,
              institucionId: targetInstitucionId,
              nivelAcademicoId: nivelAcademicoId || undefined,
            },
          });
          studentId = newStudent.id;
          createdCount++;
        }

        // Matrícula activa del año si hay sección
        if (nivelAcademicoId) {
          const existingMatricula = await prisma.matricula.findFirst({
            where: {
              estudianteId: studentId,
              anioAcademico: currentYear,
            },
          });

          if (!existingMatricula) {
            await prisma.matricula.create({
              data: {
                estudianteId: studentId,
                nivelAcademicoId,
                anioAcademico: currentYear,
                estado: "activo",
                numeroMatricula: `MAT-${currentYear}-${item.dni}`,
              },
            });
          }
        }

        // Apoderado
        if (item.dniApoderado && item.apoderadoNombre) {
          let apoderado = await prisma.user.findUnique({
            where: { dni: item.dniApoderado },
          });

          if (!apoderado) {
            const { name, paterno, materno } = splitFullName(
              item.apoderadoNombre,
            );
            const apoderadoHash = await bcrypt.hash(item.dniApoderado, 10);
            apoderado = await prisma.user.create({
              data: {
                dni: item.dniApoderado,
                name: name.toUpperCase(),
                apellidoPaterno: paterno.toUpperCase(),
                apellidoMaterno: materno.toUpperCase(),
                telefono: item.telefonoApoderado || undefined,
                role: "padre" as Role,
                password: apoderadoHash,
                estadoId: estadoActivo.id,
                institucionId: targetInstitucionId,
              },
            });
          }

          const existingRel = await prisma.relacionFamiliar.findFirst({
            where: {
              hijoId: studentId,
              padreTutorId: apoderado.id,
            },
          });

          if (!existingRel) {
            await prisma.relacionFamiliar.create({
              data: {
                hijoId: studentId,
                padreTutorId: apoderado.id,
                parentesco: item.parentesco?.toUpperCase() || "APODERADO",
                contactoPrimario: true,
              },
            });
          }
        }
      } catch (err: any) {
        errors.push(`DNI ${item.dni}: ${err.message || "Error al procesar"}`);
      }
    }

    revalidatePath("/gestion/estudiantes");
    revalidatePath("/gestion/matriculas");
    revalidatePath("/dashboard");

    return {
      success: true,
      createdCount,
      updatedCount,
      errorsCount: errors.length,
      errors: errors.slice(0, 10),
    };
  } catch (error: any) {
    console.error("Error in bulk student import:", error);
    return { error: `Error en la importación masiva: ${error.message}` };
  }
}
