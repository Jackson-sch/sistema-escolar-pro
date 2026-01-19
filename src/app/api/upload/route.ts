import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { join } from "path";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Verificar sesión (opcional pero recomendado)
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 2. Obtener el archivo del FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No se encontró ningún archivo" }, { status: 400 });
    }

    // 3. Validaciones básicas
    const buffer = Buffer.from(await file.arrayBuffer());
    const bytes = buffer.byteLength;

    if (bytes > 4 * 1024 * 1024) { // 4MB límite
      return NextResponse.json({ error: "El archivo es demasiado grande (máx 4MB)" }, { status: 400 });
    }

    // 4. Preparar el path de guardado
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Asegurar que el directorio existe
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Ignorar si ya existe
    }

    // 5. Generar nombre de archivo único
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, "-");
    const filename = `${timestamp}-${originalName}`;
    const filePath = join(uploadDir, filename);

    // 6. Guardar el archivo
    await writeFile(filePath, buffer);

    // 7. Retornar la URL pública
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Error en /api/upload:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
