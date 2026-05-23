import { NextRequest, NextResponse } from "next/server"
import { getDocumentByCodeAction } from "@/actions/documents"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const codigo = searchParams.get("codigo")

    if (!codigo || codigo.length < 6) {
      return NextResponse.json({ error: "Código de verificación inválido" }, { status: 400 })
    }

    const result = await getDocumentByCodeAction(codigo)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    if (!result.data) {
      return NextResponse.json({ error: "No se encontró ningún documento con ese código" }, { status: 404 })
    }

    return NextResponse.json({ data: result.data })
  } catch (error) {
    console.error("Error verifying document:", error)
    return NextResponse.json({ error: "Error al verificar el documento" }, { status: 500 })
  }
}
