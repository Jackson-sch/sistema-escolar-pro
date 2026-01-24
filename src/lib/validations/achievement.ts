import { z } from "zod";

export const achievementSchema = z.object({
  titulo: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  descripcion: z.string().optional(),
  fecha: z.date({
    error: "La fecha es requerida",
  }),
  categoria: z.enum(["ACADEMICO", "DEPORTIVO", "CULTURAL", "VALORES", "OTROS"]),
  institucion: z.string().optional(),
  adjunto: z.string().optional(),
});

export type AchievementValues = z.infer<typeof achievementSchema>;
