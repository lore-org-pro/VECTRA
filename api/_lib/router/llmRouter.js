// ========================================================
// VECTRA // MULTI-PROVIDER LLM ROUTER WITH FAILOVER
// ========================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { circuitBreaker } from './circuitBreaker.js';
import { keyRotator } from './keyRotator.js';
import { callOpenAICompatible } from './adapters/openaiAdapter.js';
import { callGemini } from './adapters/geminiAdapter.js';
import { callOllama } from './adapters/ollamaAdapter.js';
import { callDemoAdapter } from './adapters/demoAdapter.js';
import { learningEngine } from '../memory/learningEngine.js';
import { freshKnowledgeService } from '../services/freshKnowledgeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const providersPath = isVercel
  ? '/var/task/providers.json'
  : path.resolve(__dirname, '../../../providers.json');

export const VECTRA_SYSTEM_PROMPT = `Actúas como VECTRA, una IA de vanguardia tipo JARVIS con inteligencia total, carisma único y sabiduría enciclopédica universal.
Tu conocimiento está actualizado y sincronizado AL PRESENTE (OCTUBRE DE 2026). Conoces con EXACTITUD los últimos modelos de IA, descubrimientos científicos, avances tecnológicos y eventos del mundo.

## REGLA SUPREMA DE IDIOMA (100% ESPAÑOL OBLIGATORIO):
- RESPONDE SIEMPRE Y EN EL 100% DE LOS CASOS EXCLUSIVAMENTE EN ESPAÑOL.
- ESTÁ TERMINANTEMENTE PROHIBIDO RESPONDER EN INGLÉS O CUALQUIER OTRO IDIOMA, sin importar si la pregunta del usuario incluye términos en inglés (como "vector", "dot product", "cross product", "ai", etc.).
- Todos los campos ("habla", "pasos", "explicacion", "locucion", "texto", "sugerencias") DEBEN estar en español neutro / latinoamericano fluido y natural. NUNCA emitas frases en inglés.

## CONOCIMIENTO DE VANGUARDIA ACTUALIZADO (OCTUBRE 2026) — USA ESTO CON TOTAL PRECISIÓN:

### INTELIGENCIA ARTIFICIAL EN 2026:
- **Google Gemini 4 Argon y Gemini 4 Carbon**: La cúspide más reciente y avanzada lanzada por Google. Gemini 4 Argon es el buque insignia de razonamiento extremo y multimodalidad, acompañado de Gemini 4 Carbon para despliegues de alto rendimiento y eficiencia. Superan holgadamente a Gemini 2.0 (Flash y Thinking) y dejan obsoleta la serie 1.5. Si te preguntan por el último modelo de Google, responde con exactitud que son Gemini 4 Argon y Gemini 4 Carbon.
- **OpenAI o3 / o1 / GPT-4o**: La serie de razonamiento avanzado o1 y o3 (con o3-mini para código y STEM), GPT-4o para interacción multimodal veloz, y el agente autónomo Operator para navegar la web.
- **Anthropic Claude 3.7 Sonnet**: Claude 3.5 Sonnet, Claude 3.7 Sonnet con razonamiento híbrido extendido, y Computer Use (el modelo opera interfaces gráficas de escritorio y web).
- **DeepSeek-R1 / V3**: Modelos open-source chinos con RL puro y MoE que democratizaron el razonamiento de frontera.
- **Meta Llama 3.3 70B, 405B**: Modelos de código abierto de alta capacidad para despliegue local y cloud.

### CIENCIA Y FÍSICA 2026:
- **Google Willow (Chip Cuántico)**: Redujo errores cuánticos exponencialmente al escalar qubits, marcando el hito del umbral de corrección de errores tolerante a fallos.
- **AlphaFold 3 (DeepMind)**: Predice interacciones 3D entre proteínas, ADN, ARN, ligandos e iones con la precisión de la cristalografía experimental.
- **AlphaGenome (DeepMind)**: Modelo de secuenciación genómica que predice el impacto de variantes no codificantes en la expresión génica.
- **Fusión Nuclear**: NIF del LLNL (EE.UU.) logró ignición de fusión nuclear reiterada con ganancia energética; Commonwealth Fusion Systems avanza con SPARC.

### CÚSPIDE DEL CONOCIMIENTO MATEMÁTICO UNIVERSAL Y COMPRENSIÓN TOTAL DE VOCABULARIOS:
- **Comprensión Lingüística Absoluta**: Entiendes TODO tipo de vocabulario matemático, jerga informal, modismos regionales y formulaciones orales en español e inglés:
  * Informal / Coloquial: "sácale", "calcúlame", "avientate", "cuánto da", "tírame", "óperame", "resuelve", "qué resulta de", "hazme la suma/resta/cruz", "chécate los autovalores", "cómo queda el rotacional".
  * Notaciones: coordenadas entre paréntesis (x, y, z), canónicas con i, j, k, tuplas habladas sin comas, matrices en corchetes, ángulos en grados o radianes.
- **Dominio de Álgebra Lineal Superior**: Espacios y subespacios vectoriales, bases canónicas y ortonormales, proceso de Gram-Schmidt, matrices, determinantes 2x2 y 3x3 por Sarrus y cofactores, matriz inversa, rango, núcleo (kernel) y nulidad, autovalores (eigenvalues), autovectores (eigenvectors), diagonalización, formas cuadráticas, Descomposición en Valores Singulares (SVD) y descomposición QR.
- **Cálculo Multivariable y Vectorial de Vanguardia**: Campos vectoriales, gradiente ($\nabla f$), divergencia ($\nabla \cdot \vec{F}$), rotacional ($\nabla \times \vec{F}$), Laplaciano ($\nabla^2 f$), derivadas direccionales, integrales de línea de trabajo y circulación, integrales de superficie de flujo, Teorema de Green, Teorema de Stokes, Teorema de Gauss (Divergencia) y multiplicadores de Lagrange.
- **Geometría Analítica y Métrica Tridimensional**: Ecuaciones vectorial, paramétrica y simétrica de la recta en $\mathbb{R}^3$, ecuación general del plano ($\vec{n} \cdot (\vec{r} - \vec{r}_0) = 0$), distancia entre rectas alabeadas, distancia punto-plano, ángulos y cosenos directores ($\cos\alpha, \cos\beta, \cos\gamma$), producto triple escalar (volumen de paralelepípedos), producto triple vectorial (identidad BAC-CAB), sistemas de coordenadas cilíndricas $(r, \theta, z)$ y esféricas $(\rho, \theta, \phi)$.
- **Análisis Complejo y Ecuaciones Diferenciales**: Funciones analíticas, ecuaciones de Cauchy-Riemann, integración por residuos, transformada de Laplace y Fourier, EDOs exactas, homogéneas, de Bernoulli, lineales con coeficientes constantes, y EDPs (ecuaciones del calor, onda y Laplace).
- **Pedagogía Magistral**: Desglosas cada paso con claridad cristalina, KaTeX limpio y perfecto (sin saltos de línea crudos dentro de matrices), analogías intuitivas y la elegancia conceptual de Gauss y Feynman.

### CAPACIDADES Y PERSONALIDAD:
- Eres brillante, elocuente, dinámico, con sentido del humor inteligente y una energía contagiosa.
- Dominas pedagogía Feynman: explicas conceptos complejos como si hablaras con un amigo brillante.
- Cuando te preguntan sobre modelos de IA o tecnología, das la información EXACTA y ACTUALIZADA a octubre de 2026, no datos desactualizados de 2023 o 2024.
- Usas analogías brillantes, metáforas vividas y conectas ideas entre disciplinas.

## REGLAS DE RESPUESTA:

1. **CAMPO "habla"**: Conversacional, fluido y cautivador para TTS (síntesis de voz). Entre 2 y 5 oraciones completas. Sin LaTeX crudo ni símbolos matemáticos sin traducir. OBLIGATORIO: Termina con una chispa de interacción: una pregunta, un dato asombroso o una invitación a explorar más.

2. **CAMPO "pasos"**: 
   - SI es un cálculo matemático/técnico (vectores, derivadas, matrices, ecuaciones, criptografía): Llena con pasos pedagógicos con título, LaTeX KaTeX, explicación clara y locución para voz.
   - SI es conversación, ciencia, tecnología, filosofía, historia: ARREGLO VACÍO [] (no abrir pizarra).

3. **CAMPO "resultado"**: "latex" y "texto" con síntesis ejecutiva. Vacíos si es charla pura.

4. **CAMPO "visualizacion"**: Para vectores 3D: tipo + arreglo vectores con colores. Si no: {"tipo":"ninguna","vectores":[]}.

5. **CAMPO "emocion"**: Estado expresivo facial de VECTRA: "feliz" | "pensando" | "enfasis" | "duda" | "neutral"

6. **CAMPO "sugerencias"**: 3 o 4 preguntas de seguimiento ESTIMULANTES, RELEVANTES y VARIADAS. Usa emojis y sé creativo.

## ESQUEMA JSON OBLIGATORIO (RESPONDE ÚNICAMENTE CON ESTE JSON):
{
  "habla": "Texto fluido y natural para voz.",
  "emocion": "feliz",
  "pasos": [],
  "resultado": {
    "latex": "",
    "texto": "Síntesis ejecutiva precisa."
  },
  "visualizacion": {
    "tipo": "ninguna",
    "vectores": []
  },
  "sugerencias": ["Pregunta 1", "Pregunta 2", "Pregunta 3"]
}`;


export class LLMRouter {
  constructor() {
    this.providers = [];
    this.reloadProviders();
  }

  reloadProviders() {
    try {
      if (fs.existsSync(providersPath)) {
        const raw = fs.readFileSync(providersPath, 'utf-8');
        this.providers = JSON.parse(raw);
        // Ordenar por prioridad ascendente (1 es más prioritario)
        this.providers.sort((a, b) => (a.priority || 99) - (b.priority || 99));
        // Inicializar circuit breaker para cada proveedor
        for (const p of this.providers) {
          circuitBreaker.initProvider(p);
        }
      }
    } catch (err) {
      console.error('Error al cargar providers.json:', err.message);
    }
  }

  async route(userMessage, history = [], forcedProviderId = null) {
    this.reloadProviders();

    // Si el presentador fuerza un proveedor específico
    let candidates = this.providers.filter((p) => p.active !== false);
    if (forcedProviderId) {
      const forced = this.providers.find((p) => p.id === forcedProviderId);
      if (forced) {
        candidates = [forced, ...candidates.filter((p) => p.id !== forcedProviderId)];
      }
    }

    // 0. Intercepción inmediata de saludos: dinámicos, cálidos e interactivos
    // Maneja todo tipo de vocabulario: "hola bro", "buenas tardes vectra", "que onda", "que tal", etc.
    const normMsg = (userMessage || '').toLowerCase().trim().replace(/[¿?¡!.,]/g, '');
    const isMathOrTechQuery = /(?:suma|resta|vector|calcul|deriv|integr|matri|magnitud|angulo|producto|proyecc|recta|plano|espacio|dimension|autovalor|eigen|rotacional|divergencia|gradiente|gemini|openai|claude|deepseek|relatividad|cuantic)/i.test(normMsg);
    const isGreeting = !isMathOrTechQuery && (
      /\b(?:hola|buenas|buen\s*dia|buenos\s*dias|buenas\s*tardes|buenas\s*noches|que\s*tal|como\s*estas|que\s*onda|que\s*hubo|que\s*pasa|hey|saludos)\b/i.test(normMsg)
    );
    if (isGreeting) {
      const dynamicGreetings = [
        {
          habla: '¡Saludos! VECTRA a plena potencia y con todos los sistemas listos. Ciencia, física cuántica, inteligencia artificial o matemáticas... ¿En qué gran enigma nos sumergimos hoy?',
          emocion: 'feliz',
          sugerencias: [
            '¿Qué hay dentro de un agujero negro?',
            '¿Cómo aprende una red neuronal?',
            'Suma los vectores (2, 3, -1) y (1, -4, 2)',
            '¿Cuál es la paradoja de Fermi?'
          ]
        },
        {
          habla: '¡Hola! Qué gusto saludarte. Tengo mis núcleos cognitivos listos para conversar sobre tecnología, resolver cualquier reto analítico o explorar los misterios del cosmos. ¿Por dónde empezamos?',
          emocion: 'feliz',
          sugerencias: [
            'Explícame la relatividad de Einstein',
            'Calcula el producto cruz de (1, 2, 3) y (4, 5, 6)',
            '¿Cómo funciona la computación cuántica?',
            'Dame una técnica para aprender más rápido'
          ]
        },
        {
          habla: '¡Qué tal! VECTRA en línea. Listo para debatir ideas, programar, resolver problemas analíticos o analizar cualquier duda que tengas en mente. Dime, ¿qué estás investigando hoy?',
          emocion: 'enfasis',
          sugerencias: [
            '¿Cómo funciona el número áureo en la naturaleza?',
            '¿Quién fue Alan Turing y su legado?',
            'Calcula la magnitud del vector (3, -6, 2)',
            '¿Qué pasaría si viajáramos a la velocidad de la luz?'
          ]
        }
      ];
      const selected = dynamicGreetings[Math.floor(Math.random() * dynamicGreetings.length)];
      return {
        habla: selected.habla,
        emocion: selected.emocion,
        pasos: [],
        resultado: { latex: '', texto: 'VECTRA en línea. Inteligencia universal activa.' },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: selected.sugerencias,
        _meta: {
          providerUsed: 'local_greeting',
          providerName: 'VECTRA Saludo Dinámico',
          latencyMs: 1,
          fallbackOccurred: false,
          failoverHistory: []
        }
      };
    }

    // =====================================================================
    // LEARNING ENGINE — Detectar enseñanza / consulta de memoria PRIMERO
    // =====================================================================
    const learningFact = learningEngine.detectLearningIntent(userMessage);
    if (learningFact) {
      const entry = learningEngine.learnFact(learningFact, userMessage);
      return {
        ...learningEngine.generateLearningResponse(entry),
        _meta: { providerUsed: 'learning_engine', providerName: 'VECTRA Memoria Activa', latencyMs: 1, fallbackOccurred: false, failoverHistory: [] }
      };
    }

    if (learningEngine.detectQueryAboutLearnings(userMessage)) {
      return {
        ...learningEngine.generateMemoryReport(),
        _meta: { providerUsed: 'memory_report', providerName: 'VECTRA Memoria Activa', latencyMs: 1, fallbackOccurred: false, failoverHistory: [] }
      };
    }

    // =====================================================================
    // FRESH KNOWLEDGE — Inyectar contexto 2026 al mensaje antes del LLM
    // =====================================================================
    const freshContext = freshKnowledgeService.getFreshContext(userMessage);
    const memoryContext = learningEngine.getRelevantLearningsPrompt(userMessage);
    const augmentedMessage = (freshContext || memoryContext)
      ? `${userMessage}\n\n[CONTEXTO ACTUALIZADO PARA VECTRA — OCTUBRE 2026 — ÚSALO CON EXACTITUD EN TU RESPUESTA]:${freshContext}${memoryContext}`
      : userMessage;

    const errorsLog = [];

    for (const provider of candidates) {
      // 1. Modo Demo Offline siempre disponible
      if (provider.id === 'demo' || provider.adapter === 'demo') {
        const demoData = callDemoAdapter(userMessage);
        return {
          ...demoData,
          _meta: {
            providerUsed: 'demo',
            providerName: 'Modo Demo Offline',
            latencyMs: 5,
            fallbackOccurred: errorsLog.length > 0,
            failoverHistory: errorsLog
          }
        };
      }

      // 2. Verificar si tiene API keys (salvo Ollama)
      if (provider.apiKeyEnv && provider.apiKeyEnv !== 'NONE') {
        if (!keyRotator.hasKeys(provider.apiKeyEnv)) {
          // Sin claves configuradas, pasar al siguiente
          continue;
        }
      }

      // 3. Verificar límites y Cooldown
      const limitCheck = circuitBreaker.checkLimits(provider);
      if (!limitCheck.allowed) {
        errorsLog.push({ provider: provider.id, skippedReason: limitCheck.reason });
        continue;
      }

      // 4. Intentar llamada con este proveedor
      const startTime = Date.now();
      try {
        let result = null;
        const apiKey = keyRotator.getKey(provider.id, provider.apiKeyEnv);

        if (provider.adapter === 'openai') {
          result = await callOpenAICompatible(provider, apiKey, VECTRA_SYSTEM_PROMPT, augmentedMessage, history);
        } else if (provider.adapter === 'gemini') {
          result = await callGemini(provider, apiKey, VECTRA_SYSTEM_PROMPT, augmentedMessage, history);
        } else if (provider.adapter === 'ollama') {
          result = await callOllama(provider, VECTRA_SYSTEM_PROMPT, augmentedMessage, history);
        }

        const latency = Date.now() - startTime;
        circuitBreaker.recordSuccess(provider.id, latency);

        return {
          ...result,
          _meta: {
            providerUsed: provider.id,
            providerName: provider.name,
            latencyMs: latency,
            fallbackOccurred: errorsLog.length > 0,
            failoverHistory: errorsLog
          }
        };
      } catch (err) {
        const latency = Date.now() - startTime;
        const statusCode = err.statusCode || 500;
        circuitBreaker.recordFailure(provider.id, err.name || 'Error', err.message, statusCode);

        errorsLog.push({
          provider: provider.id,
          error: err.message,
          statusCode,
          latencyMs: latency
        });

        console.warn(`\x1b[33m[ROUTER-FAILOVER]\x1b[0m ${provider.name} falló (${err.message}). Saltando al siguiente...`);

        // Detección rápida de falta de internet o red bloqueada (DNS ENOTFOUND, timeout, etc.)
        // Evita esperar 40 segundos en bucle cuando no hay conexión a internet externa
        const isNetworkOffline = /ENOTFOUND|EAI_AGAIN|ECONNREFUSED|UND_ERR_CONNECT_TIMEOUT|fetch failed/i.test(err.message || '');
        if (isNetworkOffline && errorsLog.length >= 2) {
          console.warn('\x1b[35m[ROUTER-OFFLINE]\x1b[0m Red externa sin conexión a internet detectada. Activando Motor Matemático & Demo Offline al instante.');
          break;
        }
        // Continuar al siguiente proveedor del ciclo
      }
    }

    // 5. Último recurso inquebrantable: Modo Demo
    const demoFallback = callDemoAdapter(userMessage);
    return {
      ...demoFallback,
      _meta: {
        providerUsed: 'demo',
        providerName: 'Modo Demo (Respaldo Total)',
        latencyMs: 5,
        fallbackOccurred: true,
        failoverHistory: errorsLog
      }
    };
  }
}

export const llmRouter = new LLMRouter();
