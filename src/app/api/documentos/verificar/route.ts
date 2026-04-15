import { NextRequest, NextResponse } from "next/server"
import { getDocumentByCodeAction } from "@/actions/documents"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const codigo = searchParams.get("codigo")

  if (!codigo) {
    return NextResponse.json({ error: "Código de verificación requerido" }, { status: 400 })
  }

  const result = await getDocumentByCodeAction(codigo)

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  if (!result.data) {
    return NextResponse.json({ error: "No se encontró ningún documento con ese código" }, { status: 404 })
  }

  return NextResponse.json({ data: result.data })
}
