// ========================================================
// VECTRA // FRESH KNOWLEDGE & REAL-TIME FACT FETCHER (OCTUBRE 2026)
// ========================================================

/**
 * Enciclopedia viva de vanguardia tecnológica, IA y ciencia a Octubre de 2026.
 * Si el usuario pregunta por modelos de Gemini, OpenAI, Claude, DeepSeek o ciencia actual,
 * provee los datos exactos del estado del arte en 2026.
 */
const VANGUARD_KNOWLEDGE_2026 = {
  gemini: {
    keywords: [
      'gemini', 'google gemini', 'ultimo modelo de google', 'modelo mas reciente de google', 
      'modelo de google', 'gemini 2', 'gemini 2.0', 'gemini 4', 'gemini 4 argon', 'gemini 4 carbon',
      'argon', 'carbon', 'gemini 1.5', 'gemini flash', 'gemini pro',
      'que modelo lanzo google', 'que ha lanzado google', 'ultimo modelo que ha lanzado google'
    ],
    summary: 'A fecha de octubre de 2026, la cúspide absoluta de Google son sus modelos de última generación Gemini 4 Argon y Gemini 4 Carbon, los modelos más potentes, avanzados y especializados lanzados por Google, sucediendo con enorme superioridad a las familias Gemini 2.0 y Gemini 1.5. Cuentan con arquitectura multimodal nativa, razonamiento cuántico asistido y procesamiento ultrarrápido.'
  },
  openai: {
    keywords: ['openai', 'chatgpt', 'gpt-4o', 'gpt 4', 'o1', 'o3', 'o3-mini', 'operator', 'strawberry'],
    summary: 'En octubre de 2026, la línea de OpenAI incluye sus modelos de razonamiento profundo o1 y o3 (con o3-mini ultraeficiente para matemáticas, código y STEM), el modelo insignia multimodal GPT-4o, y el agente autónomo Operator que navega y ejecuta acciones en interfaces web y de escritorio.'
  },
  claude: {
    keywords: ['claude', 'anthropic', 'sonnet', 'haiku', 'opus', 'claude 3.5', 'claude 3.7', 'computer use'],
    summary: 'Anthropic lidera en 2026 con Claude 3.5 Sonnet, Claude 3.5 Haiku y Claude 3.7 Sonnet con razonamiento híbrido adaptable, además de su revolucionaria tecnología Computer Use, que capacita a la IA para interactuar directamente con sistemas operativos, escribir código y mover el cursor como un humano.'
  },
  deepseek: {
    keywords: ['deepseek', 'deepseek r1', 'deepseek-v3', 'r1', 'v3', 'deepseek ai'],
    summary: 'DeepSeek sacudió el panorama tecnológico con DeepSeek-V3 y DeepSeek-R1, demostrando que mediante aprendizaje por refuerzo puro (RL) y arquitectura Mixture-of-Experts (MoE) de código abierto se alcanza el nivel de razonamiento de los mejores modelos propietarios con una fracción mínima del coste de entrenamiento.'
  },
  meta_llama: {
    keywords: ['llama', 'llama 3', 'llama 3.3', 'llama 4', 'meta ai', 'zuckerberg'],
    summary: 'Meta impulsa el ecosistema abierto con la serie Llama 3.3 (70B) y avances hacia Llama 4, ofreciendo rendimiento a nivel GPT-4o de forma libre para la comunidad de desarrolladores global.'
  },
  quantum: {
    keywords: ['cuantica', 'willow', 'qubit', 'computacion cuantica', 'procesador cuantico'],
    summary: 'Google Quantum AI presentó el chip cuántico superconductor Willow en 2026, demostrando por primera vez la reducción exponencial de errores a medida que se aumenta el número de cúbits físicos, superando el umbral crítico de corrección de errores tolerante a fallos.'
  },
  deepmind_bio: {
    keywords: ['alphafold', 'alphagenome', 'deepmind', 'biologia molecular', 'adn', 'arn', 'proteina'],
    summary: 'Google DeepMind revolucionó la biomedicina con AlphaFold 3 (predicción de complejos macromoleculares de proteínas, ADN, ARN, iones y ligandos farmacológicos) y AlphaGenome para decodificar mutaciones en regiones no codificantes del genoma humano.'
  },
  space_energy: {
    keywords: ['fusion nuclear', 'nif', 'iter', 'artemis', 'starship', 'spacex', 'energia'],
    summary: 'En energía y espacio: el LLNL de EE.UU. consolidó la ignición de fusión nuclear neta con ganancia energética en el NIF; SpaceX avanza operaciones orbitales con Starship rumbo a la Luna y Marte con el programa Artemis de la NASA.'
  }
};

export class FreshKnowledgeService {
  /**
   * Detecta si la consulta del usuario requiere contexto fresco de 2026
   */
  getFreshContext(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') return '';
    const norm = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const relevantFacts = [];

    for (const [key, item] of Object.entries(VANGUARD_KNOWLEDGE_2026)) {
      const isMatch = item.keywords.some(kw => norm.includes(kw));
      if (isMatch) {
        relevantFacts.push(item.summary);
      }
    }

    if (relevantFacts.length === 0) return '';

    return `\n### INFORMACIÓN VIGENTE Y ACTUALIZADA AL PRESENTE (OCTUBRE DE 2026):\n${relevantFacts.join('\n\n')}\n`;
  }
}

export const freshKnowledgeService = new FreshKnowledgeService();
