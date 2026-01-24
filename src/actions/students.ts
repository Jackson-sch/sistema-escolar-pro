"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "../../prisma/client"
import bcrypt from "bcryptjs"

/**
 * Limpia los datos convirtiendo strings vacíos en undefined para campos que deben ser únicos o nulos.
 * Esto evita errores de restricción única en la base de datos (PostgreSQL trata "" como un valor).
 */
const sanitizeData = (data: any) => {
  const result = { ...data };
  const uniqueFields = ['email', 'dni', 'codigoEstudiante', 'codigoSiagie', 'codigoModular', 'dniApoderado'];

  uniqueFields.forEach(field => {
    if (result[field] === "") {
      result[field] = null; // En la base de datos, múltiples NULL son permitidos en campos únicos, pero no múltiples ""
    }
  });

  return result;
};

/**
 * Obtiene la lista de estudiantes con filtros básicos
 */
export async function getStudentsAction() {
  try {
    const institucion = await prisma.institucionEducativa.findFirst({
      select: { cicloEscolarActual: true }
    })
    const currentYear = institucion?.cicloEscolarActual || new Date().getFullYear()

    const students = await prisma.user.findMany({
      where: {
        role: "estudiante" as Role,
      },
      include: {
        estado: true,
        matriculas: {
          where: { anioAcademico: currentYear },
          include: {
            nivelAcademico: {
              include: {
                grado: true,
                nivel: true
              }
            }
          }
        },
        padresTutores: {
          include: {
            padreTutor: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Mapear para que nivelAcademico refleje la matrícula del año actual
    const mappedStudents = students.map(s => {
      const currentMatricula = s.matriculas[0]
      return {
        ...s,
        nivelAcademico: currentMatricula?.nivelAcademico || null,
        // Mantener una referencia opcional si se requiere saber si tiene matricula este año
        matriculadoEsteAnio: !!currentMatricula
      }
    })

    return { data: JSON.parse(JSON.stringify(mappedStudents)) }
  } catch (error) {
    console.error("Error fetching students:", error)
    return { error: "No se pudieron obtener los estudiantes" }
  }
}

/**
 * Obtiene los estados disponibles para usuarios
 */
export async function getUserStatusessAction() {
  try {
    const statuses = await prisma.estadoUsuario.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" }
    })
    return { data: JSON.parse(JSON.stringify(statuses)) }
  } catch (error) {
    return { error: "Error al cargar estados" }
  }
}

/**
 * Obtiene las instituciones disponibles
 */
export async function getInstitucionesAction() {
  try {
    const instituciones = await prisma.institucionEducativa.findMany({
      select: { id: true, nombreInstitucion: true }
    })
    return { data: JSON.parse(JSON.stringify(instituciones)) }
  } catch (error) {
    return { error: "Error al cargar instituciones" }
  }
}

/**
 * Obtiene los niveles académicos (Grados/Secciones)
 */
export async function getNivelesAcademicosAction(anio?: number) {
  try {
    const niveles = await prisma.nivelAcademico.findMany({
      where: { 
        activo: true,
        anioAcademico: anio
      },
      include: {
        grado: true,
        nivel: true
      },
      orderBy: [
        { nivel: { nombre: "asc" } },
        { grado: { orden: "asc" } },
        { seccion: "asc" }
      ]
    })
    return { data: JSON.parse(JSON.stringify(niveles)) }
  } catch (error) {
    return { error: "Error al cargar niveles académicos" }
  }
}

/**
 * Intenta dividir un nombre completo en nombre, paterno y materno.
 */
const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { name: parts[0], paterno: "", materno: "" };
  if (parts.length === 2) return { name: parts[0], paterno: parts[1], materno: "" };
  if (parts.length === 3) return { name: parts[0], paterno: parts[1], materno: parts[2] };
  
  // Para 4 o más partes, asumimos que las dos primeras son nombres o el primero es nombre y los dos últimos apellidos
  // Usualmente en Perú: [Nombres...] [Paterno] [Materno]
  // Una regla simple: el último es materno, el penúltimo es paterno, el resto es nombre
  const materno = parts.pop() || "";
  const paterno = parts.pop() || "";
  const name = parts.join(" ");
  
  return { name, paterno, materno };
};

/**
 * Crea un nuevo estudiante
 */
export async function createStudentAction(values: any) {
  try {
    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values

    const hashedPassword = await bcrypt.hash(studentData.dni, 10)

    // Crear el estudiante
    const student = await prisma.user.create({
      data: {
        ...sanitizeData(studentData),
        role: "estudiante" as Role,
        password: hashedPassword,
      }
    })

    // Si hay datos de apoderado, vincular o crear
    if (dniApoderado && nombreApoderado) {
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado }
      })

      if (apoderado && apoderado.role !== "padre") {
        const roleText = apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return { error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.` }
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
            estadoId: studentData.estadoId, // Mismo estado por defecto
            institucionId: studentData.institucionId
          }
        })
      }

      await prisma.relacionFamiliar.create({
        data: {
          hijoId: student.id,
          padreTutorId: apoderado.id,
          parentesco: parentescoApoderado || "APODERADO",
          contactoPrimario: true
        }
      })
    }

    revalidatePath("/gestion/estudiantes")
    return { success: "Estudiante registrado con éxito", data: JSON.parse(JSON.stringify(student)) }
  } catch (error: any) {
    console.error("Error creating student:", error)
    if (error.code === 'P2002') {
      return { error: "El DNI o correo ya se encuentra registrado" }
    }
    return { error: "Error al registrar el estudiante" }
  }
}

/**
 * Actualiza un estudiante existente
 */
export async function updateStudentAction(id: string, values: any) {
  try {
    const {
      nombreApoderado,
      dniApoderado,
      telefonoApoderado,
      parentescoApoderado,
      ...studentData
    } = values

    // 1. Actualizar el estudiante
    const student = await prisma.user.update({
      where: { id },
      data: sanitizeData(studentData)
    })

    // 2. Gestionar el Apoderado si se proporcionaron datos básicos
    if (dniApoderado && nombreApoderado) {
      // Buscar o crear el apoderado por DNI
      let apoderado = await prisma.user.findUnique({
        where: { dni: dniApoderado }
      })

      if (apoderado && apoderado.role !== "padre") {
        const roleText = apoderado.role === "estudiante" ? "Estudiante" : "Personal";
        return { error: `El DNI del apoderado ${dniApoderado} ya está registrado como ${roleText} y no puede ser usado aquí.` }
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
            institucionId: studentData.institucionId
          }
        })
      } else {
        const { name, paterno, materno } = splitFullName(nombreApoderado);
        // Si ya existe, actualizamos sus datos de contacto
        await prisma.user.update({
          where: { id: apoderado.id },
          data: {
            name,
            apellidoPaterno: paterno,
            apellidoMaterno: materno,
            telefono: telefonoApoderado,
          }
        })
      }

      // Verificamos si ya existe la relación
      const relacionExistente = await prisma.relacionFamiliar.findFirst({
        where: {
          hijoId: id,
          padreTutorId: apoderado.id
        }
      })

      if (!relacionExistente) {
        // Antes de crear una nueva primaria, quitamos la marca a las otras
        await prisma.relacionFamiliar.updateMany({
          where: { hijoId: id },
          data: { contactoPrimario: false }
        })

        await prisma.relacionFamiliar.create({
          data: {
            hijoId: id,
            padreTutorId: apoderado.id,
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true
          }
        })
      } else {
        // Si existe, actualizamos el parentesco
        await prisma.relacionFamiliar.update({
          where: { id: relacionExistente.id },
          data: {
            parentesco: parentescoApoderado || "APODERADO",
            contactoPrimario: true
          }
        })
      }
    }

    revalidatePath("/gestion/estudiantes")
    return { success: "Estudiante actualizado con éxito", data: JSON.parse(JSON.stringify(student)) }
  } catch (error: any) {
    console.error("Error updating student:", error)
    return { error: "No se pudo actualizar el estudiante" }
  }
}

/**
 * Elimina un estudiante
 */
export async function deleteStudentAction(id: string) {
  try {
    await prisma.user.delete({
      where: { id }
    })
    revalidatePath("/gestion/estudiantes")
    return { success: "Estudiante eliminado correctamente" }
  } catch (error) {
    console.error("Error deleting student:", error)
    return { error: "No se pudo eliminar el estudiante" }
  }
}
/**
 * Busca un apoderado por su DNI
 */
export async function getGuardianByDniAction(dni: string) {
  try {
    const guardian = await prisma.user.findFirst({
      where: { 
        dni,
        role: "padre" as Role
      }
    })

    if (!guardian) return { data: null }

    return { data: JSON.parse(JSON.stringify(guardian)) }
  } catch (error) {
    console.error("Error fetching guardian by DNI:", error)
    return { error: "Error al buscar el apoderado" }
  }
}

/**
 * Busca estudiantes por nombre, apellidos o DNI
 */
export async function searchStudentsAction(query: string) {
  try {
    const students = await prisma.user.findMany({
      where: {
        role: "estudiante" as Role,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { apellidoPaterno: { contains: query, mode: "insensitive" } },
          { apellidoMaterno: { contains: query, mode: "insensitive" } },
          { dni: { contains: query, mode: "insensitive" } }
        ]
      },
      select: {
        id: true,
        name: true,
        apellidoPaterno: true,
        apellidoMaterno: true,
        dni: true,
        nivelAcademico: {
          include: {
            grado: true
          }
        }
      },
      take: 10
    })

    return { data: JSON.parse(JSON.stringify(students)) }
  } catch (error) {
    console.error("Error searching students:", error)
    return { error: "No se pudo realizar la búsqueda" }
  }
}
