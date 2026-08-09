"use server"
import { serialize } from "@/lib/dto";

import prisma from "@/lib/prisma"
import { auth } from "@/auth";
import { revalidatePath } from "next/cache"

/**
 * Verifica un documento por su código de verificación (usado por la API pública)
 */
export async function getDocumentByCodeAction(codigo: string) {
  try {
    const documento = await prisma.documento.findUnique({
      where: { codigoVerificacion: codigo },
      include: {
        estudiante: {
          select: {
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            dni: true,
            codigoEstudiante: true
          }
        },
        emisor: {
          select: {
            name: true,
            apellidoPaterno: true,
            apellidoMaterno: true,
            cargo: {
              select: {
                nombre: true
              }
            }
          }
        },
        tipoDocumento: true
      }
    })
    return { data: documento ? serialize(documento) : null }
  } catch (error) {
    console.error("Error verifying document:", error)
    return { error: "Error interno al verificar el documento" }
  }
}
export async function registerDocumentAction(data: {
  tipoDocumentoCodigo: string
  titulo: string
  estudianteId?: string
  emisorId: string
  codigoVerificacion: string
  datosAdicionales?: any
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    let tipo = await prisma.tipoDocumento.findUnique({
      where: { codigo: data.tipoDocumentoCodigo }
    })

    if (!tipo) {
      // Intentamos buscar por el código exacto primero (por si las dudas)
      tipo = await prisma.tipoDocumento.findFirst({
        where: { codigo: data.tipoDocumentoCodigo }
      })
      
      if (!tipo) {
        tipo = await prisma.tipoDocumento.create({
          data: {
            codigo: data.tipoDocumentoCodigo,
            nombre: data.tipoDocumentoCodigo.replace(/_/g, ' '),
            sistemico: true
          }
        })
      }
    }

    let finalEmisorId = data.emisorId
    
    // Intentamos buscar al director oficial de la institución
    const institucion = await prisma.institucionEducativa.findFirst({
      select: { directorId: true }
    })

    if (institucion?.directorId) {
      finalEmisorId = institucion.directorId
    } else {
      // Si no hay director asignado en la institución, buscamos por cargo
      const directorCargo = await prisma.cargo.findFirst({
        where: { codigo: 'DIRECTOR' }
      })

      if (directorCargo) {
        const directorUser = await prisma.user.findFirst({
          where: { cargoId: directorCargo.id }
        })
        if (directorUser) {
          finalEmisorId = directorUser.id
        }
      }
    }

    // Verificamos si el emisor final existe, si no, fallback a administrativo
    const emisorExists = await prisma.user.findUnique({ where: { id: finalEmisorId } })
    
    if (!emisorExists) {
      const firstAdmin = await prisma.user.findFirst({
        where: { role: { in: ['administrativo', 'profesor'] as any } }
      })
      if (firstAdmin) {
        finalEmisorId = firstAdmin.id
      } else {
        const anyUser = await prisma.user.findFirst()
        if (anyUser) {
          finalEmisorId = anyUser.id
        } else {
          return { error: "No se encontró ningún usuario emisor válido" }
        }
      }
    }

    // Verificamos si ya existe un documento similar para evitar duplicidad
    if (data.estudianteId && data.datosAdicionales?.anioAcademico) {
      const existingDocs = await prisma.documento.findMany({
        where: {
          tipoDocumentoId: tipo.id,
          estudianteId: data.estudianteId,
          verificado: true,
        }
      })

      const existingDoc = existingDocs.find(doc => {
        const docData = doc.datosAdicionales as any;
        return docData?.anioAcademico === data.datosAdicionales.anioAcademico;
      })

      if (existingDoc) {
        return { data: existingDoc }
      }
    }

    const documento = await prisma.documento.create({
      data: {
        tipoDocumentoId: tipo.id,
        titulo: data.titulo,
        estudianteId: data.estudianteId,
        emisorId: finalEmisorId,
        codigoVerificacion: data.codigoVerificacion,
        codigo: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        contenido: JSON.stringify(data.datosAdicionales || {}),
        datosAdicionales: data.datosAdicionales,
        verificado: true 
      }
    })

    return { data: documento }
  } catch (error) {
    console.error("Error registerDocumentAction:", error)
    return { error: "Error al registrar el documento en el sistema" }
  }
}
