"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmailAction } from "@/actions/email"
import { sendSmsAction } from "@/actions/sms"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"
import { auth } from "@/auth"


const REVALIDATE_PATH = "/gestion/admisiones"

/**
 * Obtiene la lista de prospectos con filtros básicos
 */
export const getProspectosAction = createSafeAction(
  z.object({ estado: z.string().optional(), anioPostulacion: z.number().optional() }).optional(),
  async (filters, session) => {
    try {
      const prospectos = await prisma.prospecto.findMany({
        where: {
          institucionId: session.user.institucionId || undefined,
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
      return { success: JSON.parse(JSON.stringify(prospectos)) }
    } catch (error) {
      console.error("Error fetching prospectos:", error)
      return { error: "No se pudieron obtener los prospectos" }
    }
  },
  { roles: ["administrativo"] }
);

/**
 * Crea o actualiza un prospecto
 */
export const upsertProspectoAction = createSafeAction(
  z.object({
    values: z.any(),
    id: z.string().optional()
  }),
  async ({ values, id }, session) => {
    try {
      // Sanitizar datos vacíos
      const data = { 
        ...values,
        institucionId: session.user.institucionId || values.institucionId
      }
      if (data.dni === "") data.dni = null
      if (data.email === "") data.email = null

      if (id) {
        // Verificar que el prospecto pertenece a la institución
        const existing = await prisma.prospecto.findUnique({
          where: { id, institucionId: session.user.institucionId || undefined }
        });

        if (!existing) return { error: "Prospecto no encontrado o sin permisos" };

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

        // Send Welcome Email
        if (prospecto.email) {
          sendEmailAction({
            to: prospecto.email,
            subject: "Hemos recibido su postulación",
            nombre: `${prospecto.nombre} ${prospecto.apellidoPaterno}`,
            mensaje: "Gracias por su interés en nuestra institución. Hemos recibido sus datos y nuestro equipo revisará su postulación a la brevedad."
          }).catch(e => console.error("Error welcome email:", e));
        }

        if (prospecto.telefono) {
          sendSmsAction({
            to: prospecto.telefono,
            mensaje: `Hola ${prospecto.nombre}. Gracias por postular a nuestra institución. Tu solicitud ha sido recibida y está en evaluación.`
          }).catch(e => console.error("Error welcome sms:", e));
        }

        return { success: "Prospecto registrado correctamente", data: JSON.parse(JSON.stringify(prospecto)) }
      }
    } catch (error: any) {
      console.error("Error upserting prospecto:", error)
      if (error.code === "P2002") {
        return { error: "Ya existe un prospecto con este DNI" }
      }
      return { error: "No se pudo procesar el prospecto" }
    }
  },
  { roles: ["administrativo"] }
);

/**
 * Convierte un prospecto a proceso de admisión formal
 */
export const convertProspectoToAdmisionAction = createSafeAction(
  z.object({ prospectoId: z.string() }),
  async ({ prospectoId }, session) => {
    try {
      // Validar pertenencia
      const existing = await prisma.prospecto.findUnique({
        where: { id: prospectoId, institucionId: session.user.institucionId || undefined }
      });

      if (!existing) return { error: "Prospecto no encontrado" };

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
  },
  { roles: ["administrativo"] }
);

/**
 * Registra resultados de entrevista o examen
 */
export const updateAdmisionResultAction = createSafeAction(
  z.object({
    admisionId: z.string(),
    values: z.any(),
    finalStatus: z.enum(["ADMITIDO", "RECHAZADO"]).optional()
  }),
  async ({ admisionId, values, finalStatus }, session) => {
    try {
      // Validar pertenencia vía prospecto
      const existing = await prisma.admision.findUnique({
        where: { id: admisionId },
        include: { prospecto: true }
      });

      if (!existing || existing.prospecto.institucionId !== session.user.institucionId) {
        return { error: "Proceso de admisión no encontrado o sin permisos" };
      }

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

      // Send final status email if changed
      if (finalStatus && result.prospecto?.email) {
        const isAdmitido = finalStatus === "ADMITIDO";
        sendEmailAction({
          to: result.prospecto.email,
          subject: isAdmitido ? "¡Felicidades! Ha sido admitido" : "Actualización de su Postulación",
          nombre: `${result.prospecto.nombre} ${result.prospecto.apellidoPaterno}`,
          mensaje: isAdmitido 
            ? "Nos complace informarle que ha superado el proceso de evaluación y ha sido ADMITIDO a nuestra institución. Esté atento a los próximos pasos para completar su matrícula."
            : "Gracias por participar en nuestro proceso de admisión. Lamentablemente, en esta ocasión su postulación no ha sido aceptada.",
        }).catch(e => console.error("Error status email:", e));
        
        if (result.prospecto.telefono) {
          sendSmsAction({
            to: result.prospecto.telefono,
            mensaje: isAdmitido
              ? `¡Felicitaciones ${result.prospecto.nombre}! Has sido ADMITIDO. Revisa tu correo electrónico para conocer los siguientes pasos.`
              : `${result.prospecto.nombre}, gracias por postular. Lamentablemente no has sido admitido. Revisa tu correo electrónico para más detalles.`
          }).catch(e => console.error("Error status sms:", e));
        }
      }

      return { success: "Gestión de admisión actualizada", data: JSON.parse(JSON.stringify(result)) }
    } catch (error) {
      console.error("Error updating admision:", error)
      return { error: "No se pudo actualizar el resultado de la admisión" }
    }
  },
  { roles: ["administrativo"] }
);

/**
 * Convierte un prospecto ADMITIDO en un Estudiante (User) y cambia su estado a MATRICULADO
 */
export const convertProspectoToEstudianteAction = createSafeAction(
  z.object({ prospectoId: z.string() }),
  async ({ prospectoId }, session) => {
    try {
      const prospecto = await prisma.prospecto.findUnique({
        where: { id: prospectoId, institucionId: session.user.institucionId || undefined }
      })

      if (!prospecto) {
        return { error: "Prospecto no encontrado o sin permisos" }
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
      
      // Send Credentials Email
      if (prospecto.email) {
        sendEmailAction({
          to: prospecto.email,
          subject: "Credenciales de Acceso al Portal",
          nombre: `${prospecto.nombre} ${prospecto.apellidoPaterno}`,
          mensaje: "Su usuario y registro en el sistema han sido creados con éxito. Puede iniciar sesión utilizando su DNI/Correo como usuario y su DNI como contraseña inicial.",
          accionLabel: "Ingresar al Portal",
          accionUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`
        }).catch(e => console.error("Error credentials email:", e));
      }

      if (prospecto.telefono) {
        sendSmsAction({
          to: prospecto.telefono,
          mensaje: `${prospecto.nombre}, tus credenciales de acceso se han creado. Ingresa al portal usando tu DNI con contraseña inicial: ${prospecto.dni}`
        }).catch(e => console.error("Error credentials sms:", e));
      }

      return { success: "Estudiante generado correctamente. Ahora puede iniciar su matrícula.", data: JSON.parse(JSON.stringify(result)) }
    } catch (error: any) {
      console.error("Error converting prospecto to student:", error)
      if (error.code === "P2002") {
        return { error: "Ya existe un usuario/estudiante con este DNI o Correo" }
      }
      return { error: "No se pudo convertir el prospecto a estudiante" }
    }
  },
  { roles: ["administrativo"] }
);
