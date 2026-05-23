import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadFile, deleteFile } from "@/lib/storage";

/**
 * Maneja la subida de archivos (POST)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo" },
        { status: 400 },
      );
    }

    // Validar tamaño (4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máx 4MB)" },
        { status: 400 },
      );
    }

    // Validar tipo MIME
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
      "application/vnd.ms-excel", // xls
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/msword", // doc
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes y documentos estándar (PDF, Word, Excel)." },
        { status: 400 },
      );
    }

    // Validar extensión (Mitigación doble de extensiones peligrosas)
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const disallowedExtensions = ["html", "htm", "svg", "js", "jsx", "ts", "tsx", "sh", "bat", "exe", "cmd"];
    if (!fileExtension || disallowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: "Extensión de archivo peligrosa o no permitida." },
        { status: 400 },
      );
    }

    // Usar utilidad de almacenamiento (Local o Cloudinary)
    const url = await uploadFile(file);

    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Error en POST /api/upload:", error);
    return NextResponse.json(
      { error: "Error al procesar la subida" },
      { status: 500 },
    );
  }
}

/**
 * Maneja la eliminación física de archivos (DELETE)
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "URL de archivo requerida" },
        { status: 400 },
      );
    }

    // Eliminar físicamente el archivo
    const success = await deleteFile(url);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "No se pudo eliminar el archivo físico" },
        { status: 404 },
      );
    }
  } catch (error: any) {
    console.error("Error en DELETE /api/upload:", error);
    return NextResponse.json(
      { error: "Error al procesar la eliminación" },
      { status: 500 },
    );
  }
}
