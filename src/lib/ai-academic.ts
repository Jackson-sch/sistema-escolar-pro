import prisma from "@/lib/prisma";
import { getGeminiModel } from "@/lib/gemini";
import { generateText } from "ai";

/**
 * Analiza el rendimiento y comportamiento de un estudiante
 */
export async function analizarRendimientoAcademico(estudianteId: string) {
  const [estudiante, notas, asistencias] = await Promise.all([
    prisma.user.findUnique({
      where: { id: estudianteId },
      include: {
        nivelAcademico: { include: { grado: true } }
      }
    }),
    prisma.nota.findMany({
      where: { estudianteId },
      include: { 
        evaluacion: { 
          include: { 
            curso: { include: { areaCurricular: true } }, 
            tipoEvaluacion: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.asistencia.findMany({
      where: { estudianteId },
      orderBy: { fecha: "desc" },
      take: 30
    })
  ]);

  if (!estudiante) return "No se encontró el estudiante.";

  const model = await getGeminiModel();

  // Procesar datos para el prompt
  const promedioNotas = notas.length > 0 
    ? (notas.reduce((acc, curr) => acc + curr.valor, 0) / notas.length).toFixed(2)
    : "Sin notas";
  
  const inasistencias = asistencias.filter(a => !a.presente).length;
  const totalAsistencias = asistencias.length;

  const { text } = await generateText({
    model,
    system: "Eres un psicólogo educativo experto en análisis de datos. Tu objetivo es proporcionar un resumen ejecutivo sobre el desempeño de un estudiante, identificando fortalezas, debilidades y recomendaciones pedagógicas. Sé profesional, constructivo y directo.",
    prompt: `Analiza el siguiente perfil del estudiante:
    Nombre: ${estudiante.name} ${estudiante.apellidoPaterno}
    Grado: ${estudiante.nivelAcademico?.grado.nombre}
    Promedio Reciente: ${promedioNotas}
    Inasistencias: ${inasistencias} de las últimas ${totalAsistencias} sesiones.
    
    Notas Detalladas:
    ${notas.map(n => `- ${n.evaluacion.curso.areaCurricular.nombre}: ${n.valor} (${n.evaluacion.tipoEvaluacion.nombre})`).join("\n")}
    
    Proporciona un análisis breve (máximo 150 palabras) con recomendaciones para los docentes.`,
  });

  return text;
}

/**
 * Genera feedback automático para una calificación
 */
export async function generarFeedbackNota(data: {
  estudianteNombre: string;
  materia: string;
  nota: number;
  tipoEvaluacion: string;
}) {
  const model = await getGeminiModel();

  const { text } = await generateText({
    model,
    system: "Eres un docente motivador y profesional. Tu objetivo es dar retroalimentación personalizada a un estudiante basado en su nota. Si la nota es alta, felicita y sugiere desafíos. Si es baja, motiva y sugiere áreas de mejora sin ser desanimador.",
    prompt: `Genera un feedback corto (2-3 oraciones) para el estudiante ${data.estudianteNombre} que obtuvo una nota de ${data.nota} en su ${data.tipoEvaluacion} de ${data.materia}.`,
  });

  return text;
}
