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
 * Genera feedback automático para una calificación basado en competencias (Escala Peruana AD-C)
 */
export async function generarFeedbackNota(data: {
  estudianteNombre: string;
  materia: string;
  competencia?: string;
  nota: string | number;
  tipoEvaluacion: string;
}) {
  const model = await getGeminiModel();

  const prompt = `Actúa como un docente experto y empático. Genera un reporte de retroalimentación académico formal dirigido a los PADRES DE FAMILIA del estudiante ${data.estudianteNombre}.
  
Contexto:
- Materia: ${data.materia}
- Competencia Evaluada: ${data.competencia || "Competencias generales del curso"}
- Evaluación: ${data.tipoEvaluacion}
- Calificación obtenida: ${data.nota} (Escala: AD/A/B/C)

Instrucciones:
1. El tono debe ser FORMAL y profesional, dirigiéndose a los padres sobre el progreso de su hijo(a).
2. Debes referirte explícitamente a la COMPETENCIA mencionada.
3. Considera la escala literal:
   - AD (Logro Destacado): Felicitar por superar las expectativas y sugerir retos de mayor complejidad.
   - A (Logro Esperado): Reconocer el buen desempeño y sugerir precisiones para alcanzar la excelencia.
   - B (En Proceso): Identificar avances parciales y recomendar acompañamiento específico o refuerzo.
   - C (En Inicio): Ser motivador pero claro sobre las dificultades, sugiriendo un plan de apoyo inmediato.
4. Máximo 3 oraciones cortas pero impactantes.
5. ESTRICTAMENTE EN ESPAÑOL.

Evita frases genéricas. Sé específico con la competencia.`;

  const { text } = await generateText({
    model,
    system: "Eres un mentor educativo experto en el currículo nacional peruano. Tu objetivo es redactar informes de desempeño para padres de familia que sean pedagógicamente útiles, constructivos y precisos.",
    prompt,
  });

  return text;
}
