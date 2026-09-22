import { CnebAreaData } from "./seed-cneb-types";

export const CNEB_EXTENDED_AREAS: CnebAreaData[] = [
  {
    codigo: "ING",
    nombre: "Inglés como Lengua Extranjera",
    descripcion: "Comunicación en idioma inglés según estándares internacionales.",
    color: "#8b5cf6",
    icono: "IconLanguage",
    orden: 5,
    competencias: [
      {
        nombre: "Se comunica oralmente en inglés como lengua extranjera",
        descripcion: "Comprensión auditiva y producción oral en idioma inglés.",
        capacidades: [
          { nombre: "Obtiene información de textos orales en inglés" },
          { nombre: "Infiere e interpreta información de textos orales en inglés" },
          { nombre: "Adecúa, organiza y desarrolla las ideas en inglés de forma coherente" },
          { nombre: "Interactúa estratégicamente en inglés con distintos interlocutores" },
        ],
      },
      {
        nombre: "Lee diversos tipos de textos en inglés como lengua extranjera",
        descripcion: "Comprensión de lectura en textos auténticos en inglés.",
        capacidades: [
          { nombre: "Obtiene información del texto escrito en inglés" },
          { nombre: "Infiere e interpreta información del texto en inglés" },
          { nombre: "Reflexiona y evalúa la forma y el contenido del texto en inglés" },
        ],
      },
      {
        nombre: "Escribe diversos tipos de textos en inglés como lengua extranjera",
        descripcion: "Redacción y gramática en idioma inglés.",
        capacidades: [
          { nombre: "Adecúa el texto en inglés a la situación comunicativa" },
          { nombre: "Organiza y desarrolla las ideas en inglés de forma coherente" },
          { nombre: "Utiliza convenciones del lenguaje escrito en inglés" },
        ],
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
        capacidades: [
          { nombre: "Comprende su cuerpo" },
          { nombre: "Se expresa corporalmente" },
        ],
      },
      {
        nombre: "Asume una vida saludable",
        descripcion: "Hábitos de nutrición, higiene y actividad física continua.",
        capacidades: [
          { nombre: "Comprende las relaciones entre actividad física, alimentación e higiene" },
          { nombre: "Incorpora prácticas que mejoran su calidad de vida" },
        ],
      },
      {
        nombre: "Interactúa a través de sus habilidades sociomotrices",
        descripcion: "Trabajo en equipo, fair play y juegos cooperativos.",
        capacidades: [
          { nombre: "Se relaciona utilizando sus habilidades sociomotrices" },
          { nombre: "Crea y aplica estrategias y tácticas de juego" },
        ],
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
        capacidades: [
          { nombre: "Percibe manifestaciones artístico-culturales" },
          { nombre: "Contextualiza manifestaciones artístico-culturales" },
          { nombre: "Reflexiona creativa y críticamente sobre manifestaciones artísticas" },
        ],
      },
      {
        nombre: "Crea proyectos desde los lenguajes artísticos",
        descripcion: "Expresión plástica, musical, dramática y de danza.",
        capacidades: [
          { nombre: "Explora y experimenta los lenguajes del arte" },
          { nombre: "Aplica procesos creativos" },
          { nombre: "Evalúa y comunica sus procesos y proyectos" },
        ],
      },
    ],
  },
  {
    codigo: "REL",
    nombre: "Educación Religiosa",
    descripcion: "Dimensión espiritual, religiosa y trascendente de la persona.",
    color: "#a855f7",
    icono: "IconVocabulary",
    orden: 8,
    competencias: [
      {
        nombre: "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente",
        descripcion: "Doctrina religiosa, dignidad humana y diálogo ecuménico e interreligioso.",
        capacidades: [
          { nombre: "Conoce a Dios y asume su identidad religiosa y espiritual como persona digna, libre y trascendente" },
          { nombre: "Cultiva y valora las manifestaciones religiosas de su entorno argumentando su fe de manera comprensible y respetuosa" },
        ],
      },
      {
        nombre: "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida en coherencia con su creencia religiosa",
        descripcion: "Testimonio de fe, compromiso solidario y proyecto ético de vida.",
        capacidades: [
          { nombre: "Transforma su entorno desde el encuentro personal y comunitario con Dios y desde la fe que profesa" },
          { nombre: "Actúa coherentemente en razón de su fe según los principios de su conciencia moral en situaciones concretas de la vida" },
        ],
      },
    ],
  },
  {
    codigo: "EPT",
    nombre: "Educación para el Trabajo",
    descripcion: "Cultura emprendedora, articulación productiva e inserción en el mundo del trabajo.",
    color: "#ea580c",
    icono: "IconBriefcase",
    orden: 9,
    competencias: [
      {
        nombre: "Gestiona proyectos de emprendimiento económico o social",
        descripcion: "Diseño, ejecución y evaluación de soluciones de valor para el mercado o la comunidad.",
        capacidades: [
          { nombre: "Crea propuestas de valor" },
          { nombre: "Aplica habilidades técnicas" },
          { nombre: "Trabaja cooperativamente para lograr objetivos y metas" },
          { nombre: "Evalúa los resultados del proyecto de emprendimiento" },
        ],
      },
    ],
  },
  {
    codigo: "DPCC",
    nombre: "Desarrollo Personal, Ciudadanía y Cívica",
    descripcion: "Construcción de la identidad, convivencia pacífica, democracia y valores cívicos.",
    color: "#f97316",
    icono: "IconShieldStar",
    orden: 10,
    competencias: [
      {
        nombre: "Construye su identidad",
        descripcion: "Autovaloración personal, regulación emocional, juicio ético y sexualidad integral.",
        capacidades: [
          { nombre: "Se valora a sí mismo" },
          { nombre: "Autorregula sus emociones" },
          { nombre: "Reflexiona y argumenta éticamente" },
          { nombre: "Vive su sexualidad de manera integral y responsable de acuerdo a su etapa de desarrollo y madurez" },
        ],
      },
      {
        nombre: "Convive y participa democráticamente en la búsqueda del bien común",
        descripcion: "Interacción respetuosa, apego a las leyes, resolución de conflictos y deliberación pública.",
        capacidades: [
          { nombre: "Interactúa con todas las personas" },
          { nombre: "Construye normas y asume acuerdos y leyes" },
          { nombre: "Maneja conflictos de manera constructiva" },
          { nombre: "Delibera sobre asuntos públicos" },
          { nombre: "Participa en acciones que promueven el bienestar común" },
        ],
      },
    ],
  },
];
