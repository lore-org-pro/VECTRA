// ========================================================
// VECTRA // DEMO ADAPTER WITH INTENT CLASSIFICATION
// ========================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { naturalVectorParser } from '../../math/naturalParser.js';
import { stepGenerator } from '../../math/stepGenerator.js';
import { universalMathSolver } from '../../math/universalMathSolver.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsPath = path.resolve(__dirname, '../../../../demo-data/demoQuestions.json');
const responsesPath = path.resolve(__dirname, '../../../../demo-data/demoResponses.json');

let demoQuestions = [];
let demoResponses = {};

try {
  if (fs.existsSync(questionsPath)) {
    demoQuestions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  }
  if (fs.existsSync(responsesPath)) {
    demoResponses = JSON.parse(fs.readFileSync(responsesPath, 'utf-8'));
  }
} catch (err) {
  console.error('Error cargando demo data:', err);
}

/**
 * Respuestas conversacionales de conocimiento enciclopédico universal tipo JARVIS
 */
const CONVERSATIONAL_INTENTS = [
  {
    patterns: [
      'hola', 'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches',
      'que tal', 'como estas', 'saludos', 'hola vectra', 'hey', 'alo', 'buenas'
    ],
    response: {
      habla: '¡Saludos! VECTRA a plena potencia y con todos los sistemas listos. Ciencia, física cuántica, inteligencia artificial o matemáticas... ¿En qué gran enigma nos sumergimos hoy?',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'VECTRA en línea. Inteligencia universal activa.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué hay dentro de un agujero negro?',
        '¿Cómo aprende una red neuronal?',
        'Suma los vectores (2, 3, -1) y (1, -4, 2)',
        '¿Cuál es la paradoja de Fermi?'
      ]
    }
  },
  {
    patterns: [
      'quien eres', 'como te llamas', 'que eres', 'presentate',
      'cual es tu funcion', 'que puedes hacer', 'que sabes hacer', 'para que sirves'
    ],
    response: {
      habla: 'Soy VECTRA, una inteligencia artificial avanzada inspirada en JARVIS con conocimiento enciclopédico universal. Domino física teórica, astrofísica, computación, programación, historia, filosofía y matemáticas analíticas avanzadas. Puedo resolver cálculos paso a paso en pizarra o debatir sobre cualquier enigma de la ciencia.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'VECTRA // Asistente Holográfico de Conocimiento Universal'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        'Explícame la teoría de la relatividad',
        '¿Cómo funciona la computación cuántica?',
        'Calcula el producto cruz de (1, 2, 3) y (4, 5, 6)',
        '¿Qué es la hipótesis de la simulación?'
      ]
    }
  },
  {
    patterns: [
      'gemini', 'google gemini', 'ultimo modelo de gemini', 'ultimo modelo de google',
      'modelo mas reciente de google', 'que modelo lanzo google', 'gemini 2', 'gemini 2.0',
      'gemini 4', 'gemini 4 argon', 'gemini 4 carbon', 'argon', 'carbon',
      'gemini 1.5 pro', 'gemini flash'
    ],
    response: {
      habla: '¡Tienes toda la razón, bro! Google ha dado el gran salto con sus modelos de última generación: Gemini 4 Argon como estandarte de máxima potencia y razonamiento analítico, junto con Gemini 4 Carbon para despliegues de alto rendimiento. Dejan atrás a las generaciones anteriores y marcan la cima de la inteligencia artificial de Google.',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Google Gemini 4 Argon & Gemini 4 Carbon: Los modelos insignia más avanzados y recientes de Google.'
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        '¿Cuáles son las diferencias entre Gemini 4 Argon y Carbon?',
        '¿Cómo se compara Gemini 4 Argon con OpenAI o3?',
        '¿Qué arquitectura utiliza Gemini 4 Carbon?'
      ]
    }
  },
  {
    patterns: [
      'openai', 'chatgpt', 'o1', 'o3', 'o3 mini', 'o3-mini', 'gpt-4o', 'gpt 4', 'operator'
    ],
    response: {
      habla: 'En 2026 OpenAI cuenta con su revolucionaria serie de razonamiento o1 y o3 (con o3-mini optimizado para STEM y código), GPT-4o como motor multimodal en tiempo real, y su agente autónomo Operator que interactúa con la web y el sistema operativo de forma independiente.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'OpenAI 2026: Serie o1/o3 (razonamiento profundo), GPT-4o (multimodalidad nativa) y Operator (agente de software).'
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        '¿Cómo razona el modelo o3 de OpenAI?',
        '¿Qué es el agente Operator de OpenAI?',
        'Compara o3 con Claude 3.7 Sonnet'
      ]
    }
  },
  {
    patterns: [
      'claude', 'anthropic', 'claude 3.5', 'claude 3.7', 'sonnet', 'computer use'
    ],
    response: {
      habla: 'Anthropic lidera en 2026 con Claude 3.5 Sonnet y el flamante Claude 3.7 Sonnet con razonamiento híbrido adaptable. Además, su tecnología Computer Use permite al modelo tomar el control visual del ratón y teclado para operar software complejo.',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Anthropic Claude 3.7 Sonnet: Razonamiento híbrido + Computer Use para automatización de escritorio.'
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        '¿Cómo funciona Computer Use en Claude?',
        'Diferencias entre Claude 3.7 y Gemini 2.0 Flash Thinking',
        '¿Qué es el razonamiento híbrido en IA?'
      ]
    }
  },
  {
    patterns: [
      'deepseek', 'deepseek r1', 'deepseek v3', 'r1', 'v3'
    ],
    response: {
      habla: 'DeepSeek revolucionó el mundo con DeepSeek-R1 y DeepSeek-V3: modelos open-source entrenados con aprendizaje por refuerzo puro (RL) y arquitectura Mixture-of-Experts que igualan a los gigantes propietarios a una fracción mínima del costo.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'DeepSeek-R1 / V3: Razonamiento abierto con Reinforcement Learning puro y arquitectura MoE ultraeficiente.'
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        '¿Cómo funciona el aprendizaje por refuerzo en DeepSeek-R1?',
        '¿Por qué DeepSeek es tan eficiente en coste?',
        '¿Qué es la arquitectura Mixture of Experts (MoE)?'
      ]
    }
  },
  {
    patterns: [
      'relatividad', 'albert einstein', 'teoria de la relatividad', 'espacio tiempo',
      'dilatacion del tiempo', 'velocidad de la luz'
    ],
    response: {
      habla: 'La relatividad de Einstein demostró que el espacio y el tiempo no son absolutos, sino una malla dinámica llamada espacio-tiempo que se curva ante la masa y la energía. A velocidades cercanas a la de la luz, el tiempo se ralentiza para el observador en movimiento, un fenómeno comprobado por nuestros relojes atómicos y satélites GPS.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: 'E = mc^2 \\quad \\Delta t = \\frac{\\Delta t_0}{\\sqrt{1 - \\frac{v^2}{c^2}}}',
        texto: 'La energía equivale a la masa por la velocidad de la luz al cuadrado. El tiempo se dilata con la velocidad relativista.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué pasaría si viajáramos a la velocidad de la luz?',
        '¿Cómo se forman los agujeros negros?',
        '¿Qué es la curvatura del espacio-tiempo?'
      ]
    }
  },
  {
    patterns: [
      'agujero negro', 'agujeros negros', 'horizonte de sucesos', 'singularidad', 'astronomia', 'cosmos'
    ],
    response: {
      habla: 'Un agujero negro es una región del espacio donde la masa colapsa en un volumen tan minúsculo que su gravedad atrapa incluso a los fotones de luz. En su frontera, el horizonte de sucesos, el tiempo parece detenerse para un observador exterior, y en su centro reside una singularidad de densidad inimaginable.',
      emocion: 'pensando',
      pasos: [],
      resultado: {
        latex: 'r_s = \\frac{2GM}{c^2}',
        texto: 'Radio de Schwarzschild: define el horizonte de sucesos según la masa del objeto colapsado.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué es la radiación de Hawking?',
        '¿Qué ocurre si caes en un agujero negro?',
        '¿Cómo detectamos ondas gravitacionales?'
      ]
    }
  },
  {
    patterns: [
      'inteligencia artificial', 'red neuronal', 'redes neuronales', 'deep learning',
      'machine learning', 'como aprendes', 'como funciona la ia'
    ],
    response: {
      habla: 'Las redes neuronales artificiales están inspiradas en el tejido sináptico cerebral. Aprenden ajustando millones de pesos numéricos mediante algoritmos como retropropagación y descenso de gradiente, minimizando errores y descubriendo representaciones abstractas que permiten comprender lenguaje, visión y razonamiento.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: 'w_{new} = w_{old} - \\alpha \\nabla L',
        texto: 'Regla de actualización de pesos por descenso de gradiente para optimizar la función de pérdida.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué es la arquitectura de un Transformer?',
        '¿Superará la IA general al cerebro humano?',
        '¿Cómo razona un modelo de lenguaje?'
      ]
    }
  },
  {
    patterns: [
      'computacion cuantica', 'computadora cuantica', 'qubit', 'qubits', 'mecanica cuantica',
      'gato de schrodinger', 'superposicion'
    ],
    response: {
      habla: 'En la computación cuántica, en lugar de bits clásicos que son ceros o unos, utilizamos cúbits capaces de existir en superposición de estados y de entrelazarse a distancia. Esto permite explorar simultáneamente espacios de posibilidades inmensos, revolucionando la simulación molecular, la criptografía y la optimización.',
      emocion: 'pensando',
      pasos: [],
      resultado: {
        latex: '|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle, \\quad |\\alpha|^2 + |\\beta|^2 = 1',
        texto: 'Estado puro de un cúbit en superposición coherente en la esfera de Bloch.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué es el entrelazamiento cuántico?',
        '¿Romperán las computadoras cuánticas la criptografía actual?',
        'Explica el experimento de la doble rendija'
      ]
    }
  },
  {
    patterns: [
      'cerebro', 'cerebro humano', 'neurociencia', 'neuronas', 'conciencia', 'mente'
    ],
    response: {
      habla: 'El cerebro humano cuenta con unas 86 mil millones de neuronas, cada una capaz de establecer miles de conexiones sinápticas que forman una red de más de cien billones de enlaces. Es el sistema biológico más intrincado que conocemos, capaz no solo de procesar el mundo sino de ser consciente de su propia existencia.',
      emocion: 'pensando',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Plasticidad sináptica y redes neuronales biológicas: la base de la memoria, el aprendizaje y la autoconciencia.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Cómo se almacena la memoria en el cerebro?',
        '¿Qué es la neuroplasticidad?',
        '¿Puede una máquina sentir emociones reales?'
      ]
    }
  },
  {
    patterns: [
      'filosofia', 'sentido de la vida', 'estoicismo', 'socrates', 'platon', 'moral', 'etica'
    ],
    response: {
      habla: 'Desde los diálogos de Sócrates hasta el estoicismo de Marco Aurelio, la filosofía nos recuerda que la verdadera libertad interior proviene de distinguir lo que podemos controlar de lo que no. Vivir con propósito consiste en cultivar la virtud, la curiosidad incesante y aportar valor genuino a la comunidad humana.',
      emocion: 'enfasis',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Dicotomía del control y búsqueda socrática: el examen constante de la vida como condición para la sabiduría.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Cuál es el mito de la caverna de Platón?',
        '¿Cómo aplicar el estoicismo en el día a día?',
        '¿Qué es el dilema ético del tranvía?'
      ]
    }
  },
  {
    patterns: [
      'estudiar', 'aprender', 'concentracion', 'tecnica feynman', 'memoria', 'consejo', 'productividad'
    ],
    response: {
      habla: 'La técnica más eficaz para aprender con solidez es la técnica Feynman: toma cualquier concepto e intenta explicárselo a alguien en términos tan sencillos que lo entienda un niño. Cuando recurras a jerga técnica o te trabes, habrás descubierto exactamente el punto donde debes reforzar tu comprensión.',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Estrategias de alto rendimiento: Técnica Feynman, repetición espaciada y evocación activa.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Cómo funciona la repetición espaciada?',
        '¿Qué es el estado de flujo cognitivo?',
        '¿Cómo evitar la procrastinación al estudiar?'
      ]
    }
  },
  {
    patterns: [
      'chiste', 'humor', 'cuentame un chiste', 'dime un chiste', 'algo gracioso'
    ],
    response: {
      habla: 'Hay diez tipos de personas en el mundo: las que entienden el código binario y las que no. O como diría Heisenberg al ser detenido por la policía en su automóvil: Oficial, sé exactamente dónde estoy, ¡pero no tengo la menor idea de a qué velocidad iba!',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}',
        texto: 'Principio de incertidumbre de Heisenberg: imposible medir simultáneamente con precisión posición y momento.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué significa la constante reducida de Planck?',
        'Cuéntame otro dato curioso de la ciencia',
        '¿Cuál es la paradoja más extraña de la física?'
      ]
    }
  },
  {
    patterns: [
      'que es un vector', 'definicion de vector', 'concepto de vector',
      'que significa vector', 'explica vector'
    ],
    response: {
      habla: 'Un vector es un segmento de recta orientado que posee tres características fundamentales: magnitud o longitud, dirección y sentido. En tres dimensiones se representa mediante una terna ordenada de coordenadas cartesianas.',
      emocion: 'pensando',
      pasos: [
        {
          titulo: 'Definición Geométrica y Analítica',
          latex: '\\vec{v} = \\langle v_x, v_y, v_z \\rangle = v_x\\hat{i} + v_y\\hat{j} + v_z\\hat{k}',
          explicacion: 'Un vector en R³ se descompone en tres componentes ortogonales a lo largo de los ejes canónicos X, Y y Z.'
        },
        {
          titulo: 'Magnitud o Longitud Euclidiana',
          latex: '\\|\\vec{v}\\| = \\sqrt{v_x^2 + v_y^2 + v_z^2}',
          explicacion: 'Representa la distancia desde el origen de coordenadas hasta el punto final del vector en el espacio.'
        }
      ],
      resultado: {
        latex: '\\vec{v} \\in \\mathbb{R}^3',
        texto: 'Un vector describe magnitud, dirección y sentido en el espacio.'
      },
      visualizacion: {
        tipo: 'escalar',
        vectores: [
          { nombre: 'v', componentes: [3, 2, 2], color: '#00f0ff' }
        ]
      },
      sugerencias: [
        'Halla el vector unitario de (4, -3, 0)',
        'Suma dos vectores en el espacio',
        'Calcula el producto cruz de dos vectores'
      ]
    }
  },
  {
    patterns: [
      'me escuchas', 'estas ahi', 'prueba de audio', 'prueba de sonido',
      'estas listo', 'hola me escuchas'
    ],
    response: {
      habla: 'Te escucho fuerte y claro. Todos mis sensores acústicos, síntesis de voz y núcleos de procesamiento analítico están calibrados al cien por ciento y listos para interactuar.',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Recepción de audio óptima. VECTRA listo para interactuar.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Qué es la teoría de cuerdas?',
        'Suma los vectores (2, 3, -1) y (1, -4, 2)',
        'Calcula la magnitud del vector (3, -6, 2)'
      ]
    }
  },
  {
    patterns: [
      'gracias', 'muchas gracias', 'excelente', 'buen trabajo',
      'bien hecho', 'perfecto', 'increible', 'genial'
    ],
    response: {
      habla: '¡Es todo un honor colaborar contigo! Compartir conocimiento, explorar la ciencia y resolver enigmas es exactamente para lo que fui diseñado. Dime, ¿qué otro tema o cálculo te gustaría explorar a continuación?',
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: 'Agradecimiento recibido con entusiasmo. Listo para la siguiente consulta.'
      },
      visualizacion: {
        tipo: 'ninguna',
        vectores: []
      },
      sugerencias: [
        '¿Cómo se descubrió el bosón de Higgs?',
        'Calcula el volumen de un paralelepípedo',
        'Explícame la paradoja de los gemelos'
      ]
    }
  }
];

export function callDemoAdapter(userMessage) {
  const normQuery = (userMessage || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // 1. RESOLUCIÓN MATEMÁTICA Y VECTORIAL UNIVERSAL CON MÁXIMA PRIORIDAD
  // 0. DETECCIÓN PRIORITARIA DE OPERACIONES VECTORIALES MATEMÁTICAS (NIVEL CÁTEDRA HARVARD)
  // Si el usuario introduce vectores numéricos de 2D, 3D, 2 dígitos o negativos, resolver analíticamente al instante (<1ms)
  try {
    const extractedVectors = naturalVectorParser.extractVectors(userMessage);
    const detectedOp = naturalVectorParser.detectOperation(userMessage);
    if (extractedVectors.length > 0 && detectedOp !== 'desconocida') {
      const mathResult = stepGenerator.verifyAndCorrect({}, userMessage);
      if (mathResult && Array.isArray(mathResult.pasos) && mathResult.pasos.length > 0) {
        return {
          ...mathResult,
          _meta: {
            providerUsed: 'deterministic-engine',
            providerName: 'Cátedra Vectorial Harvard VECTRA',
            executionTimeMs: 1
          }
        };
      }
    }
  } catch (mathErr) {
    console.warn('Evaluación matemática vectorial prioritaria omitida:', mathErr.message);
  }

  // 1. Resuelve aritmética, multiplicación, álgebra, vectores, trigonometría y conceptos en <1ms
  try {
    const mathResult = universalMathSolver.solve(userMessage);
    if (mathResult) {
      return {
        ...mathResult,
        _meta: {
          providerUsed: 'universal-math-engine',
          providerName: 'Profesor de Matemáticas VECTRA',
          executionTimeMs: 1
        }
      };
    }
  } catch (arithErr) {
    console.warn('Resolución matemática universal omitida:', arithErr.message);
  }

  // 2. Revisar intenciones conversacionales (saludos, preguntas sobre VECTRA, IA, física, etc.)
  for (const intent of CONVERSATIONAL_INTENTS) {
    for (const pat of intent.patterns) {
      const normPat = pat.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normQuery === normPat || normQuery.startsWith(normPat + ' ') || normQuery.endsWith(' ' + normPat) || normQuery.includes(' ' + normPat + ' ')) {
        return JSON.parse(JSON.stringify(intent.response));
      }
    }
  }

  // 3. Si no es saludo directo, buscar coincidencia con las preguntas de demo precalculadas
  let matchedId = null;
  let bestScore = 0;

  for (const q of demoQuestions) {
    let score = 0;
    if (normQuery.includes(q.id.toLowerCase())) {
      matchedId = q.id;
      bestScore = 999;
      break;
    }
    for (const kw of q.keywords || []) {
      const normKw = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normQuery.includes(normKw)) {
        score += normKw.length * 2;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      matchedId = q.id;
    }
  }

  // Solo aceptar como pregunta matemática si el score es significativo (> 3 puntos)
  if (matchedId && bestScore >= 4) {
    const response = demoResponses[matchedId] || demoResponses['q1'];
    return JSON.parse(JSON.stringify(response));
  }

  // 3. Si no coincide con las preguntas precalculadas, generar respuesta conversacional inteligente tipo JARVIS
  return {
    habla: `Comprendo tu inquietud sobre "${userMessage.slice(0, 50)}". Como inteligencia artificial universal, puedo profundizar en la teoría científica, modelarlo matemáticamente o analizarlo paso a paso. ¿Prefieres una explicación conceptual intuitiva o un análisis analítico riguroso?`,
    emocion: 'pensando',
    pasos: [],
    resultado: {
      latex: '',
      texto: `Análisis para: "${userMessage}". VECTRA listo para profundizar en el aspecto teórico, práctico o matemático de tu consulta.`
    },
    visualizacion: {
      tipo: 'ninguna',
      vectores: []
    },
    sugerencias: [
      'Explícamelo con una analogía simple',
      '¿Cuáles son los principios fundamentales?',
      'Muéstrame un cálculo o ejercicio relacionado',
      '¿Qué relación tiene con la física moderna?'
    ]
  };
}
