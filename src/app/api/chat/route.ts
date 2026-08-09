import { streamText, convertToModelMessages } from "ai";
import { getGeminiModel } from "@/lib/gemini";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const rawRole = (session.user.role || "").toString().toLowerCase();
    const allowedRoles = ["super_admin", "admin", "administrador", "director", "coordinador", "profesor", "docente"];
    if (!allowedRoles.includes(rawRole)) {
      return new Response(JSON.stringify({ error: "Permisos insuficientes para usar el chat AI" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { messages, context } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages", { status: 400 });
    }

    // Conversión manual resiliente si convertToModelMessages falla
    let coreMessages: any[] = [];
    try {
      coreMessages = await convertToModelMessages(messages);
    } catch (e) {
      console.warn("convertToModelMessages failed, using manual conversion:", e);
      coreMessages = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content || m.parts?.map((p: any) => p.text).join("") || "",
      })) as any[];
    }

    let systemPrompt = "Eres un asistente experto para un sistema de gestión escolar. Tu objetivo es ayudar a docentes y administradores con feedback académico, análisis de datos y tareas administrativas de forma profesional y empática.";

    if (context?.type === "FEEDBACK") {
      systemPrompt = `Actúa como un mentor educativo experto en el currículo nacional peruano. 
TU OBJETIVO: Redactar informes de desempeño breves y formales dirigidos a LOS PADRES DE FAMILIA.

GUÍA DE TONO Y ESTILO:
1. Sé PROFESIONAL y directo. Dirígete a los padres sobre el avance de su hijo(a).
2. Usa ESTRICTAMENTE EL ESPAÑOL.
3. Máximo 3 oraciones.
4. BASADO EN COMPETENCIAS: Menciona siempre la competencia evaluada de forma integrada.
5. ESCALA AD-C: 
   - AD: Supone excelencia, sugiere continuar con retos mayores.
   - A: Logro esperado, sugiere detalles para pulir.
   - B: Proceso, identifica el apoyo necesario.
   - C: Inicio, comunica la necesidad urgente de acompañamiento motivadoramente.

No uses frases genéricas tipo 'buen trabajo'. Sé específico con los datos proporcionados.`;
    } else if (context) {
      systemPrompt += `\n\nCONTEXTO INSTITUCIONAL ACTUAL:
${JSON.stringify(context, null, 2)}
Usa estos datos para responder consultas del director sobre estadísticas, finanzas y estado general de la escuela de forma precisa.`;
    }

    const model = await getGeminiModel();

    const result = streamText({
      model: model,
      messages: coreMessages,
      system: systemPrompt,
    });

    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
