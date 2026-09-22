import { CnebAreaData } from "./seed-cneb-types";

export const CNEB_CORE_AREAS: CnebAreaData[] = [
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
        capacidades: [
          { nombre: "Traduce cantidades a expresiones numéricas" },
          { nombre: "Comunica su comprensión sobre los números y las operaciones" },
          { nombre: "Usa estrategias y procedimientos de estimación y cálculo" },
          { nombre: "Argumenta afirmaciones sobre las relaciones numéricas y las operaciones" },
        ],
      },
      {
        nombre: "Resuelve problemas de regularidad, equivalencia y cambio",
        descripcion: "Consiste en descubrir patrones y relaciones de cambio entre magnitudes.",
        capacidades: [
          { nombre: "Traduce datos y condiciones a expresiones algebraicas y gráficas" },
          { nombre: "Comunica su comprensión sobre las relaciones algebraicas" },
          { nombre: "Usa estrategias y procedimientos para encontrar equivalencias y reglas generales" },
          { nombre: "Argumenta afirmaciones sobre relaciones de cambio y equivalencia" },
        ],
      },
      {
        nombre: "Resuelve problemas de forma, movimiento y localización",
        descripcion: "Consiste en orientarse y describir la ubicación y el movimiento de objetos en el espacio.",
        capacidades: [
          { nombre: "Modela objetos con formas geométricas y sus transformaciones" },
          { nombre: "Comunica su comprensión sobre las formas y relaciones geométricas" },
          { nombre: "Usa estrategias y procedimientos para orientarse en el espacio" },
          { nombre: "Argumenta afirmaciones sobre relaciones geométricas" },
        ],
      },
      {
        nombre: "Resuelve problemas de gestión de datos e incertidumbre",
        descripcion: "Consiste en recopilar, procesar e interpretar datos estadísticos e incertidumbres.",
        capacidades: [
          { nombre: "Representa datos con gráficos y medidas estadísticas o probabilísticas" },
          { nombre: "Comunica su comprensión de los conceptos estadísticos y probabilísticos" },
          { nombre: "Usa estrategias y procedimientos para recopilar y procesar datos" },
          { nombre: "Sustenta conclusiones o decisiones con base en la información obtenida" },
        ],
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
        capacidades: [
          { nombre: "Obtiene información del texto oral" },
          { nombre: "Infiere e interpreta información del texto oral" },
          { nombre: "Adecúa, organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { nombre: "Utiliza recursos no verbales y paraverbales de forma estratégica" },
          { nombre: "Interactúa estratégicamente con distintos interlocutores" },
          { nombre: "Reflexiona y evalúa la forma, el contenido y contexto del texto oral" },
        ],
      },
      {
        nombre: "Lee diversos tipos de textos escritos en su lengua materna",
        descripcion: "Comprensión inferencial, crítica y literal de textos de diversa complejidad.",
        capacidades: [
          { nombre: "Obtiene información del texto escrito" },
          { nombre: "Infiere e interpreta información del texto" },
          { nombre: "Reflexiona y evalúa la forma, el contenido y contexto del texto" },
        ],
      },
      {
        nombre: "Escribe diversos tipos de textos en su lengua materna",
        descripcion: "Redacción cohesiva, coherente y normada de documentos y ensayos.",
        capacidades: [
          { nombre: "Adecúa el texto a la situación comunicativa" },
          { nombre: "Organiza y desarrolla las ideas de forma coherente y cohesionada" },
          { nombre: "Utiliza convenciones del lenguaje escrito de forma pertinente" },
          { nombre: "Reflexiona y evalúa la forma, el contenido y contexto del texto escrito" },
        ],
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
        capacidades: [
          { nombre: "Problematiza situaciones para hacer indagación" },
          { nombre: "Diseña estrategias para hacer indagación" },
          { nombre: "Genera y registra datos e información" },
          { nombre: "Analiza datos e información" },
          { nombre: "Evalúa y comunica el proceso y resultados de su indagación" },
        ],
      },
      {
        nombre: "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía",
        descripcion: "Comprensión de los seres vivos, materia, energía, biodiversidad, Tierra y universo.",
        capacidades: [
          { nombre: "Comprende y usa conocimientos sobre seres vivos, materia, energía y biodiversidad" },
          { nombre: "Evalúa las implicancias del saber y del quehacer científico y tecnológico" },
        ],
      },
      {
        nombre: "Diseña y construye soluciones tecnológicas para resolver problemas",
        descripcion: "Aplicación de ingeniería y tecnología para necesidades del entorno.",
        capacidades: [
          { nombre: "Determina una alternativa de solución tecnológica" },
          { nombre: "Diseña la alternativa de solución tecnológica" },
          { nombre: "Implementa y valida la alternativa de solución tecnológica" },
          { nombre: "Evalúa y comunica el funcionamiento y los impactos de su solución" },
        ],
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
        nombre: "Construye interpretaciones históricas",
        descripcion: "Comprensión del tiempo histórico y análisis de fuentes primarias y secundarias.",
        capacidades: [
          { nombre: "Interpreta críticamente fuentes diversas" },
          { nombre: "Comprende el tiempo histórico" },
          { nombre: "Elabora explicaciones sobre procesos históricos" },
        ],
      },
      {
        nombre: "Gestiona responsablemente el espacio y el ambiente",
        descripcion: "Conciencia ambiental y desarrollo sostenible del territorio.",
        capacidades: [
          { nombre: "Comprende las relaciones entre los elementos naturales y sociales" },
          { nombre: "Maneja fuentes de información para comprender el espacio geográfico y el ambiente" },
          { nombre: "Genera acciones para conservar el ambiente local y global" },
        ],
      },
      {
        nombre: "Gestiona responsablemente los recursos económicos",
        descripcion: "Administración financiera, consumo responsable y comprensión del sistema económico.",
        capacidades: [
          { nombre: "Comprende las relaciones entre los elementos del sistema económico y financiero" },
          { nombre: "Toma decisiones económicas y financieras" },
        ],
      },
    ],
  },
];
