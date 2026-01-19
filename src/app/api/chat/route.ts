import { streamText, convertToModelMessages } from "ai";
import { getGeminiModel } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
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

    if (context) {
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
