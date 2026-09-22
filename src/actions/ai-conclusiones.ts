"use server";

import { generateText } from "ai";
import { getGeminiModel } from "@/lib/gemini";
import { auth } from "@/auth";

export interface GenerateConclusionParams {
  estudianteNombre: string;
  cursoNombre: string;
  competenciaNombre?: string;
  nivelLogro: string; // "AD", "A", "B", "C" o nota numérica
  observacionesPrevias?: string;
}

/**
 * Genera conclusiones descriptivas alineadas al CNEB (Currículo Nacional del Perú)
 * para libretas de notas y SIAGIE.
 */
export async function generateConclusionDescriptivaAction(params: GenerateConclusionParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado" };
    }

    const { estudianteNombre, cursoNombre, competenciaNombre, nivelLogro, observacionesPrevias } = params;

    const model = await getGeminiModel();

    const prompt = `
Eres un especialista pedagógico del Ministerio de Educación del Perú (MINEDU) y experto en evaluación formativa bajo el Currículo Nacional de la Educación Básica (CNEB).

Genera una conclusión descriptiva concisa (máximo 2 a 3 oraciones), clara, empática y pedagógicamente constructiva para:
- Estudiante: ${estudianteNombre}
- Curso / Área: ${cursoNombre}
${competenciaNombre ? `- Competencia evaluada: ${competenciaNombre}` : ""}
- Nivel de logro obtenido: ${nivelLogro}
${observacionesPrevias ? `- Contexto docente: ${observacionesPrevias}` : ""}

Criterios obligatorios según el CNEB:
1. Si el nivel es AD (Logro Destacado) o A (Logro Esperado): Resalta las fortalezas evidenciadas y formula un reto para seguir profundizando.
2. Si el nivel es B (En Proceso) o C (En Inicio): Describe los avances alcanzados, identifica puntualmente la dificultad u obstáculo y brinda una recomendación orientadora específica para la mejora (retroalimentación formativa).
3. No uses frases punitivas ni descalificadoras.
4. Responde ÚNICAMENTE con el texto de la conclusión descriptiva, sin introducciones, sin comillas adicionales y sin viñetas.
`;

    const { text } = await generateText({
      model,
      prompt,
    });

    return {
      success: true,
      conclusion: text.trim(),
    };
  } catch (error: any) {
    console.error("Error al generar conclusión descriptiva con IA:", error);
    return {
      error: error?.message || "No se pudo generar la conclusión descriptiva con IA",
    };
  }
}
