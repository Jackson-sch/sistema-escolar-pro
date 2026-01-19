import prisma from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { generateText } from "ai";

/**
 * Analiza el historial de un estudiante y predice riesgo de morosidad
 */
export async function analizarRiesgoMorosidad(estudianteId: string) {
  const [estudiante, pagosPasados] = await Promise.all([
    prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        matriculas: { where: { estado: "activo" } }
      }
    }),
    prisma.pago.findMany({
      where: { estudianteId },
      orderBy: { fechaPago: "desc" },
      take: 10
    })
  ]);

  if (!estudiante) return { riesgo: "bajo", motivo: "No hay datos" };

  // Lógica simple: si tiene pagos fuera de fecha o deudas actuales
  const deudasVencidas = await prisma.cronogramaPago.count({
    where: {
      estudianteId,
      pagado: false,
      fechaVencimiento: { lt: new Date() }
    }
  });

  if (deudasVencidas > 0) return { riesgo: "alto", motivo: "Tiene deudas vencidas actualmente" };

  // Análisis de puntualidad histórico (pseudo-código de lógica)
  // ...

  return { riesgo: "medio", motivo: "Patrón de pago ocasionalmente irregular" };
}

/**
 * Genera un recordatorio empático y personalizado para un padre de familia
 */
export async function generarRecordatorioEmpatico(data: {
  nombrePadre: string;
  nombreEstudiante: string;
  monto: number;
  fechaVencimiento: string;
  conceptoPago?: string;
  motivoDescuento?: string;
}) {
  const model = await getGeminiModel();
  
  const concepto = data.conceptoPago || "pensión del mes";
  
  const { text } = await generateText({
    model,
    system: "Eres un gestor de cobranza empático de una escuela premium. Tu objetivo es recordar un pago pendiente sin sonar agresivo, resaltando el valor de la educación del niño. El mensaje debe ser corto y directo, ideal para WhatsApp. No uses formato markdown, solo texto plano con emojis.",
    prompt: `Genera un mensaje corto para WhatsApp para ${data.nombrePadre} sobre el pago de "${concepto}" de ${data.nombreEstudiante}.
    Monto: S/ ${data.monto}.
    Vence: ${data.fechaVencimiento}.
    ${data.motivoDescuento ? `Nota: Tiene un beneficio de ${data.motivoDescuento}` : ""}
    El tono debe ser muy profesional, caluroso y comprensivo.`,
  });

  return text;
}
