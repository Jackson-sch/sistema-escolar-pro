import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const codigo = searchParams.get("codigo")

  if (!codigo) {
    return NextResponse.json({ error: "Código de verificación requerido" }, { status: 400 })
  }

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

    if (!documento) {
      return NextResponse.json({ error: "No se encontró ningún documento con ese código" }, { status: 404 })
    }

    return NextResponse.json({ data: documento })
  } catch (error) {
    console.error("Error verifying document via API:", error)
    return NextResponse.json({ error: "Error interno al verificar el documento" }, { status: 500 })
  }
}
