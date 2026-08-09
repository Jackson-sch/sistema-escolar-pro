"use server"

import { generarRecordatorioEmpatico } from "@/lib/ai-finance"
import { createSafeAction } from "@/lib/safe-action"
import { z } from "zod"

/**
 * Acción para generar un recordatorio usando IA
 */
export const getAIReminderAction = createSafeAction(
  z.any(), 
  async (data) => {
    const text = await generarRecordatorioEmpatico(data)
    return { success: text }
  },
  { roles: ["administrativo"] }
)

/**
 * Acción para analizar el riesgo de un estudiante (descontinuada; usar analizarRiesgoMorosidad directamente)
 */
