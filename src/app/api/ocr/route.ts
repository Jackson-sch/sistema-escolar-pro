import { generateObject } from "ai";
import { z } from "zod";
import { getGoogleClient } from "@/lib/gemini";

export const runtime = "nodejs"; // Cambiar a nodejs ya que edge no soporta prisma fácilmente si se usa el cliente estándar

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
    const { image } = await req.json(); // base64 image

    if (!image) {
      return new Response("No image provided", { status: 400 });
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

    return Response.json(result.object);
  } catch (error: any) {
    console.error("OCR Error:", error);
    return Response.json(
      { 
        error: error.message || "Error processing image",
        details: error.cause?.message || error.toString()
      }, 
      { status: 500 }
    );
  }
}
