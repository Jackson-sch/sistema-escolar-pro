"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

const REVALIDATE_PATH = "/gestion/admisiones"

/**
 * Obtiene la lista de prospectos con filtros básicos
 */
export async function getProspectosAction(filters?: { estado?: string; anioPostulacion?: number }) {
  try {
    const prospectos = await prisma.prospecto.findMany({
      where: {
        estado: filters?.estado as any,
        anioPostulacion: filters?.anioPostulacion
      },
      include: {
        admision: true,
        institucion: {
          select: { nombreInstitucion: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return { data: JSON.parse(JSON.stringify(prospectos)) }
  } catch (error) {
    console.error("Error fetching prospectos:", error)
    return { error: "No se pudieron obtener los prospectos" }
  }
}

/**
 * Crea o actualiza un prospecto
 */
export async function upsertProspectoAction(values: any, id?: string) {
  try {
    // Sanitizar datos vacíos
    const data = { ...values }
    if (data.dni === "") data.dni = null
    if (data.email === "") data.email = null

    if (id) {
      const prospecto = await prisma.prospecto.update({
        where: { id },
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Prospecto actualizado", data: JSON.parse(JSON.stringify(prospecto)) }
    } else {
      const prospecto = await prisma.prospecto.create({
        data
      })
      revalidatePath(REVALIDATE_PATH)
      return { success: "Prospecto registrado correctamente", data: JSON.parse(JSON.stringify(prospecto)) }
    }
  } catch (error: any) {
    console.error("Error upserting prospecto:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un prospecto con este DNI" }
    }
    return { error: "No se pudo procesar el prospecto" }
  }
}

/**
 * Convierte un prospecto a proceso de admisión formal
 */
export async function convertProspectoToAdmisionAction(prospectoId: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear registro de admisión
      const admision = await tx.admision.create({
        data: {
          prospectoId,
        }
      })

      // 2. Actualizar estado del prospecto
      await tx.prospecto.update({
        where: { id: prospectoId },
        data: { estado: "EVALUANDO" }
      })

      return admision
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Proceso de admisión iniciado", data: JSON.parse(JSON.stringify(result)) }
  } catch (error) {
    console.error("Error converting to admision:", error)
    return { error: "No se pudo iniciar el proceso de admisión" }
  }
}

/**
 * Registra resultados de entrevista o examen
 */
export async function updateAdmisionResultAction(admisionId: string, values: any, finalStatus?: "ADMITIDO" | "RECHAZADO") {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const admision = await tx.admision.update({
        where: { id: admisionId },
        data: values,
        include: { prospecto: true }
      })

      if (finalStatus) {
        await tx.prospecto.update({
          where: { id: admision.prospectoId },
          data: { estado: finalStatus }
        })
      }

      return admision
    })

    revalidatePath(REVALIDATE_PATH)
    return { success: "Gestión de admisión actualizada", data: JSON.parse(JSON.stringify(result)) }
  } catch (error) {
    console.error("Error updating admision:", error)
    return { error: "No se pudo actualizar el resultado de la admisión" }
  }
}

/**
 * Convierte un prospecto ADMITIDO en un Estudiante (User) y cambia su estado a MATRICULADO
 */
export async function convertProspectoToEstudianteAction(prospectoId: string) {
  try {
    const prospecto = await prisma.prospecto.findUnique({
      where: { id: prospectoId }
    })

    if (!prospecto) {
      return { error: "Prospecto no encontrado" }
    }

    if (prospecto.estado !== "ADMITIDO") {
      return { error: "El prospecto debe estar en estado ADMITIDO para ser convertido a estudiante" }
    }

    // Buscar el estado ACTIVO para el usuario
    const estadoActivo = await prisma.estadoUsuario.findFirst({
      where: { codigo: "ACTIVO", institucionId: prospecto.institucionId }
    })

    // Fallback por si no encuentra el estado específico por institución
    const estadoFallo = await prisma.estadoUsuario.findFirst({
      where: { codigo: "ACTIVO" }
    })

    const estadoId = estadoActivo?.id || estadoFallo?.id;

    if (!estadoId) {
      return { error: "No se encontró un estado ACTIVO configurado en el sistema" }
    }

    // Hashear el DNI para usarlo como contraseña inicial
    // Usamos un import dinámico de bcryptjs o podemos usar una contraseña genérica si bcrypt no está disponible aquí.
    // Asumiendo que bcrypjs está instalado por su uso en students.ts
    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(prospecto.dni || prospecto.nombre.toLowerCase().replace(/\s/g, ""), 10)

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el usuario Estudiante
      const newStudent = await tx.user.create({
        data: {
          name: prospecto.nombre,
          apellidoPaterno: prospecto.apellidoPaterno,
          apellidoMaterno: prospecto.apellidoMaterno,
          email: prospecto.email || null,
          telefono: prospecto.telefono,
          direccion: prospecto.direccion,
          dni: prospecto.dni || null,
          fechaNacimiento: prospecto.fechaNacimiento,
          role: "estudiante",
          estadoId: estadoId,
          institucionId: prospecto.institucionId,
          password: hashedPassword
        }
      })

      // 2. Actualizar estado del prospecto a MATRICULADO
      await tx.prospecto.update({
        where: { id: prospectoId },
        data: { estado: "MATRICULADO" }
      })

      return newStudent
    })

    revalidatePath("/gestion/admisiones")
    revalidatePath("/gestion/estudiantes")
    revalidatePath("/gestion/matriculas")
    
    return { success: "Estudiante generado correctamente. Ahora puede iniciar su matrícula.", data: JSON.parse(JSON.stringify(result)) }
  } catch (error: any) {
    console.error("Error converting prospecto to student:", error)
    if (error.code === "P2002") {
      return { error: "Ya existe un usuario/estudiante con este DNI o Correo" }
    }
    return { error: "No se pudo convertir el prospecto a estudiante" }
  }
}
