import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { getGoogleClient } from "@/lib/gemini";
import { auth } from "@/auth";

export const runtime = "nodejs";

const documentSchema = z.object({
  dni: z.string().optional(),
  nombre: z.string().optional(),
  apellidoPaterno: z.string().optional(),
  apellidoMaterno: z.string().optional(),
  direccion: z.string().optional(),
  fechaNacimiento: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }

    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // El modelo base64 viene con el prefijo data:image/jpeg;base64,
    const base64Data = image.split(",")[1] || image;

    const google = await getGoogleClient();

    const result = await generateObject({
      model: google("gemini-3-flash-preview"),
      schema: documentSchema,
      messages: [
        {
          role: "system",
          content: "Eres un experto en extracción de datos de documentos de identidad (DNI). Extrae los datos del documento proporcionado de forma precisa. Si no encuentras un campo, déjalo vacío.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Extrae la información de esta imagen de documento de identidad:",
            },
            {
              type: "image",
              image: base64Data,
            },
          ],
        },
      ],
    });

    return NextResponse.json(result.object);
  } catch (error: any) {
    console.error("OCR Error:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen" },
      { status: 500 },
    );
  }
}
