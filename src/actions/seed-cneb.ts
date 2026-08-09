"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface SeedCnebParams {
  nivelId?: string;
}

const CNEB_AREAS = [
  {
    codigo: "MAT",
    nombre: "Matemática",
    descripcion: "Desarrollo del pensamiento matemático y resolución de problemas.",
    color: "#3b82f6",
    icono: "IconMathFunction",
    orden: 1,
    competencias: [
      {
        nombre: "Resuelve problemas de cantidad",
        descripcion: "Consiste en construir y usar la noción de cantidad, número, operaciones y relaciones numéricas.",
      },
      {
        nombre: "Resuelve problemas de regularidad, equivalencia y cambio",
        descripcion: "Consiste en descubrir patrones y relaciones de cambio entre magnitudes.",
      },
      {
        nombre: "Resuelve problemas de forma, movimiento y localización",
        descripcion: "Consiste en orientarse y describir la ubicación y el movimiento de objetos en el espacio.",
      },
      {
        nombre: "Resuelve problemas de gestión de datos e incertidumbre",
        descripcion: "Consiste en recopilar, procesar e interpretar datos estadísticos e incertidumbres.",
      },
    ],
  },
  {
    codigo: "COM",
    nombre: "Comunicación",
    descripcion: "Desarrollo de competencias comunicativas en expresión y comprensión lectora.",
    color: "#ec4899",
    icono: "IconMessageCode",
    orden: 2,
    competencias: [
      {
        nombre: "Se comunica oralmente en su lengua materna",
        descripcion: "Expresión oral activa, escucha atenta y articulación de ideas en público.",
      },
      {
        nombre: "Lee diversos tipos de textos escritos en su lengua materna",
        descripcion: "Comprensión inferencial, crítica y literal de textos de diversa complejidad.",
      },
      {
        nombre: "Escribe diversos tipos de textos en su lengua materna",
        descripcion: "Redacción cohesiva, coherente y normada de documentos y ensayos.",
      },
    ],
  },
  {
    codigo: "CYT",
    nombre: "Ciencia y Tecnología",
    descripcion: "Indagación científica y comprensión del mundo físico y biológico.",
    color: "#10b981",
    icono: "IconAtom",
    orden: 3,
    competencias: [
      {
        nombre: "Indaga mediante métodos científicos para construir conocimientos",
        descripcion: "Formulación de hipótesis, experimentación y análisis de evidencias.",
      },
      {
        nombre: "Explica el mundo físico basándose en conocimientos científicos",
        descripcion: "Comprensión de los seres vivos, materia, energía y universo.",
      },
      {
        nombre: "Diseña y construye soluciones tecnológicas para resolver problemas",
        descripcion: "Aplicación de ingeniería y tecnología para necesidades del entorno.",
      },
    ],
  },
  {
    codigo: "CCSS",
    nombre: "Personal Social / Ciencias Sociales",
    descripcion: "Desarrollo personal, ciudadanía y comprensión del espacio e historia.",
    color: "#f59e0b",
    icono: "IconCompass",
    orden: 4,
    competencias: [
      {
        nombre: "Construye su identidad",
        descripcion: "Autoconocimiento, regulación emocional y ética personal.",
      },
      {
        nombre: "Convive y participa democráticamente en la búsqueda del bien común",
        descripcion: "Ciudadanía responsable, diálogo intercultural y resolución de conflictos.",
      },
      {
        nombre: "Construye interpretaciones históricas",
        descripcion: "Comprensión del tiempo histórico y análisis de fuentes primarias y secundarias.",
      },
      {
        nombre: "Gestiona responsablemente el espacio y el ambiente",
        descripcion: "Conciencia ambiental y desarrollo sostenible del territorio.",
      },
    ],
  },
  {
    codigo: "ING",
    nombre: "Inglés como Lengua Extranjera",
    descripcion: "Comunicación en idioma inglés según estándares del marco común europeo.",
    color: "#8b5cf6",
    icono: "IconLanguage",
    orden: 5,
    competencias: [
      {
        nombre: "Se comunica oralmente en inglés como lengua extranjera",
        descripcion: "Comprensión auditiva y producción oral en idioma inglés.",
      },
      {
        nombre: "Lee diversos tipos de textos escritos en inglés",
        descripcion: "Comprensión de lectura en textos auténticos en inglés.",
      },
      {
        nombre: "Escribe diversos tipos de textos en inglés",
        descripcion: "Redacción y gramática en idioma inglés.",
      },
    ],
  },
  {
    codigo: "EF",
    nombre: "Educación Física",
    descripcion: "Desarrollo psicomotriz, vida saludable y habilidades socio-motrices.",
    color: "#ef4444",
    icono: "IconActivity",
    orden: 6,
    competencias: [
      {
        nombre: "Se desenvuelve de manera autónoma a través de su motricidad",
        descripcion: "Dominio corporal, postura y esquema motriz.",
      },
      {
        nombre: "Asume una vida saludable",
        descripcion: "Hábitos de nutrición, higiene y actividad física continua.",
      },
      {
        nombre: "Interactúa a través de sus habilidades sociomotrices",
        descripcion: "Trabajo en equipo, fair play y juegos cooperativos.",
      },
    ],
  },
  {
    codigo: "ART",
    nombre: "Arte y Cultura",
    descripcion: "Apreciación crítica y expresión mediante lenguajes artísticos.",
    color: "#06b6d4",
    icono: "IconPalette",
    orden: 7,
    competencias: [
      {
        nombre: "Aprecia de manera crítica manifestaciones artístico-culturales",
        descripcion: "Análisis estético e histórico del arte nacional y global.",
      },
      {
        nombre: "Crea proyectos desde los lenguajes artísticos",
        descripcion: "Expresión plástica, musical, dramática y de danza.",
      },
    ],
  },
];

export async function seedCnebTemplateAction({ nivelId }: SeedCnebParams = {}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "No autorizado. Inicie sesión para continuar." };
    }

    const institucionId = session.user.institucionId;
    if (!institucionId) {
      return { error: "No se encontró la institución vinculada al usuario." };
    }

    let createdCount = 0;
    let competenciesCount = 0;

    for (const areaData of CNEB_AREAS) {
      const areaCodigo = nivelId ? `${areaData.codigo}_${nivelId.slice(-4)}` : areaData.codigo;

      // Buscar si el área ya existe
      let area = await prisma.areaCurricular.findFirst({
        where: {
          codigo: areaCodigo,
          institucionId,
        },
      });

      if (!area) {
        area = await prisma.areaCurricular.create({
          data: {
            codigo: areaCodigo,
            nombre: areaData.nombre,
            descripcion: areaData.descripcion,
            color: areaData.color,
            icono: areaData.icono,
            orden: areaData.orden,
            institucionId,
            nivelId: nivelId || undefined,
            activa: true,
          },
        });
        createdCount++;
      }

      // Crear competencias asociadas
      for (const compData of areaData.competencias) {
        const compExistente = await prisma.competencia.findFirst({
          where: {
            areaCurricularId: area.id,
            nombre: compData.nombre,
          },
        });

        if (!compExistente) {
          await prisma.competencia.create({
            data: {
              areaCurricularId: area.id,
              nombre: compData.nombre,
              descripcion: compData.descripcion,
            },
          });
          competenciesCount++;
        }
      }
    }

    revalidatePath("/gestion/academico/areas");
    revalidatePath("/gestion/academico/competencias");

    return {
      success: `Se poblaron exitosamente ${createdCount} áreas curriculares y ${competenciesCount} competencias CNEB oficiales de MINEDU.`,
    };
  } catch (error: any) {
    console.error("Error in seedCnebTemplateAction:", error);
    return { error: "No se pudo cargar la malla oficial CNEB." };
  }
}
