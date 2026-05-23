import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getSystemVariable } from "./settings";

/**
 * Obtiene el cliente de Google AI configurado con la API Key dinámica.
 */
export async function getGoogleClient() {
  let apiKey = await getSystemVariable("GOOGLE_GENERATIVE_AI_API_KEY");

  // Fallback de resiliencia si en la base de datos se guardó bajo la clave "GEMINI"
  if (!apiKey) {
    apiKey = await getSystemVariable("GEMINI");
  }

  return createGoogleGenerativeAI({
    apiKey: apiKey,
  });
}

/**
 * Obtiene el modelo de Gemini especificado en las variables o el default.
 */
export async function getGeminiModel() {
  const client = await getGoogleClient();
  let modelName = await getSystemVariable(
    "GEMINI_MODEL",
    "gemini-2.5-flash",
  );

  // Redirección de resiliencia si se configuró el preview descontinuado "gemini-3-flash-preview"
  if (modelName === "gemini-3-flash-preview") {
    modelName = "gemini-2.5-flash";
  }

  return client(modelName);
}
