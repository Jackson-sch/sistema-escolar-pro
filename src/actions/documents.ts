"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function registerDocumentAction(data: {
  tipoDocumentoCodigo: string
  titulo: string
  estudianteId?: string
  emisorId: string
  codigoVerificacion: string
  datosAdicionales?: any
}) {
  try {
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
