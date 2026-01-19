"use server"

import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";
import { analizarRendimientoAcademico, generarFeedbackNota } from "@/lib/ai-academic";

export const getStudentAcademicAnalysisAction = createSafeAction(
  z.object({ estudianteId: z.string() }),
  async ({ estudianteId }) => {
    const analysis = await analizarRendimientoAcademico(estudianteId);
    return { success: analysis };
  },
  { roles: ["administrativo", "profesor"] }
);

export const getGradeFeedbackAction = createSafeAction(
  z.object({
    estudianteNombre: z.string(),
    materia: z.string(),
    nota: z.number(),
    tipoEvaluacion: z.string(),
  }),
  async (values) => {
    const feedback = await generarFeedbackNota(values);
    return { success: feedback };
  },
  { roles: ["profesor"] }
);
