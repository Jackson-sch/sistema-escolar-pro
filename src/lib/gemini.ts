import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { getSystemVariable } from './settings';

/**
 * Obtiene el cliente de Google AI configurado con la API Key dinámica.
 */
export async function getGoogleClient() {
  const apiKey = await getSystemVariable('GOOGLE_GENERATIVE_AI_API_KEY');
  
  return createGoogleGenerativeAI({
    apiKey: apiKey,
  });
}

/**
 * Obtiene el modelo de Gemini especificado en las variables o el default.
 */
export async function getGeminiModel() {
  const client = await getGoogleClient();
  const modelName = await getSystemVariable('GEMINI_MODEL', 'gemini-3-flash-preview');
  
  return client(modelName);
}
