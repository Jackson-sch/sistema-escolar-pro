"use server";

import { z } from "zod";
import { generateObject } from "ai";
import { getGeminiModel } from "@/lib/gemini";
import { createSafeAction } from "@/lib/safe-action";

const OCRResponseSchema = z.object({
  monto: z
    .number()
    .nullable()
    .describe("El monto total de la transferencia o pago (solo el número)"),
  fecha: z
    .string()
    .nullable()
    .describe("La fecha de la operación en formato YYYY-MM-DD"),
  banco: z
    .string()
    .nullable()
    .describe(
      "El nombre del banco de origen (ej: BCP, Interbank, BBVA, Scotiabank, BanBif, Yape, Plin, etc.)",
    ),
  numeroOperacion: z
    .string()
    .nullable()
    .describe("El número de operación o referencia de la transacción"),
});

export const extractReceiptDataAction = createSafeAction(
  z.object({
    imageBase64: z.string().describe("Imagen en formato base64"),
  }),
  async ({ imageBase64 }) => {
    try {
      const model = await getGeminiModel();

      const { object } = await generateObject({
        model,
        schema: OCRResponseSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extrae los datos de este comprobante de pago peruano para el registro en un sistema escolar.
                Bancos sugeridos: BCP, Interbank, BBVA, Scotiabank, BanBif, Yape, Plin.
                Si no estás seguro de un campo, devuelve null.
                Asegúrate de que la fecha esté en formato YYYY-MM-DD.`,
              },
              {
                type: "image",
                image: imageBase64,
              },
            ],
          },
        ],
      });

      return { success: object };
    } catch (error) {
      console.error("Error en Gemini OCR:", error);
      return {
        error:
          "No se pudo procesar la imagen con IA. Intenta ingresando los datos manualmente.",
      };
    }
  },
);
