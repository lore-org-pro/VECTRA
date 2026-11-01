// ========================================================
// VECTRA // CONTINUOUS LEARNING & PERSISTENT MEMORY ENGINE
// ========================================================
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const dataDir = isVercel ? '/tmp/vectra_data' : path.resolve(__dirname, '../../data');
const memoryFilePath = path.resolve(dataDir, 'learned_memory.json');

// Memoria base precargada con conocimientos confirmados de vanguardia a Octubre de 2026
const DEFAULT_PRELOADED_KNOWLEDGE = [
  {
    id: 'ai-gemini-2026',
    concepto: 'Google Gemini',
    hecho: 'A fecha de octubre de 2026, la generación más avanzada de Google es la familia Gemini 2.0 (Gemini 2.0 Flash, Gemini 2.0 Flash Thinking con razonamiento en vivo, y Gemini 2.0 Pro Experimental). Cuentan con soporte multimodal en tiempo real nativo (Live API) y la integración de Project Astra.',
    categoria: 'Inteligencia Artificial',
    fecha: '2026-10-01'
  },
  {
    id: 'ai-openai-2026',
    concepto: 'OpenAI',
    hecho: 'OpenAI cuenta en 2026 con su serie de razonamiento o1 y o3 (o3-mini), el modelo multimodal insignia GPT-4o y sus agentes autónomos Operator para tareas web.',
    categoria: 'Inteligencia Artificial',
    fecha: '2026-10-01'
  },
  {
    id: 'ai-anthropic-2026',
    concepto: 'Anthropic Claude',
    hecho: 'Anthropic dispone de Claude 3.5 Sonnet, Claude 3.5 Haiku y Claude 3.7 Sonnet con razonamiento híbrido y capacidades de control de interfaz de usuario (Computer Use).',
    categoria: 'Inteligencia Artificial',
    fecha: '2026-10-01'
  },
  {
    id: 'ai-deepseek-2026',
    concepto: 'DeepSeek',
    hecho: 'DeepSeek revolucionó el panorama con DeepSeek-V3 y DeepSeek-R1, modelos de código abierto con razonamiento por aprendizaje por refuerzo puro (RL) y arquitectura MoE ultraeficiente.',
    categoria: 'Inteligencia Artificial',
    fecha: '2026-10-01'
  },
  {
    id: 'science-quantum-willow',
    concepto: 'Computación Cuántica Willow',
    hecho: 'Google Quantum AI anunció el chip Willow, logrando reducir exponencialmente los errores cuánticos conforme se escala el número de qubits físicos, superando el umbral crítico de corrección de errores.',
    categoria: 'Física y Computación',
    fecha: '2026-10-01'
  },
  {
    id: 'science-alphafold3',
    concepto: 'AlphaFold 3 y AlphaGenome',
    hecho: 'Google DeepMind presentó AlphaFold 3, capaz de predecir la estructura no solo de proteínas sino de complejos con ADN, ARN y moléculas farmacológicas, y AlphaGenome para decodificar variantes genómicas no codificantes.',
    categoria: 'Biotecnología',
    fecha: '2026-10-01'
  }
];

export class LearningEngine {
  constructor() {
    this.memory = [];
    this.init();
  }

  init() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(memoryFilePath)) {
        const raw = fs.readFileSync(memoryFilePath, 'utf-8');
        this.memory = JSON.parse(raw);
      } else {
        this.memory = [...DEFAULT_PRELOADED_KNOWLEDGE];
        this.persist();
      }
    } catch (err) {
      console.error('[LEARNING-ENGINE] Error inicializando memoria:', err.message);
      this.memory = [...DEFAULT_PRELOADED_KNOWLEDGE];
    }
  }

  persist() {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(memoryFilePath, JSON.stringify(this.memory, null, 2), 'utf-8');
    } catch (err) {
      console.error('[LEARNING-ENGINE] Error persistiendo memoria:', err.message);
    }
  }

  /**
   * Detecta si el usuario está enseñándole activamente un dato nuevo a VECTRA
   */
  detectLearningIntent(message) {
    if (!message || typeof message !== 'string') return null;
    const norm = message.trim();

    // Patrones explícitos y naturales de enseñanza y corrección del usuario
    const patterns = [
      /^(?:aprende\s+(?:esto|que)?|aprende:)\s*(.+)/i,
      /^(?:recuerda\s+(?:esto|que)?|recuerda:)\s*(.+)/i,
      /^(?:quiero\s+que\s+(?:sepas|recuerdes)\s+que)\s*(.+)/i,
      /^(?:te\s+(?:enseño|cuento|digo)\s+que)\s*(.+)/i,
      /^(?:guarda\s+(?:esto|en\s+tu\s+memoria)?\s*(?:que)?)\s*(.+)/i,
      /^(?:a\s+partir\s+de\s+ahora\s+(?:recuerda|ten\s+en\s+cuenta)\s+que)\s*(.+)/i,
      /^(?:te\s+corrijo:?|para\s+que\s+sepas,?\s*)\s*(.+)/i,
      /^(?:hasta\s+tu\s+estas\s+mal\s+porque|estas\s+mal\s+porque|te\s+equivocas\s+porque|no\s*,?\s*en\s+realidad)\s*(.+)/i,
      /^(?:no\s+es\s+asi\s*,?\s*(?:porque)?|estas\s+desactualizado\s*,?\s*porque)\s*(.+)/i,
      /^(?:actualizate:?|ojo\s+con\s+esto:?)\s*(.+)/i
    ];

    for (const pat of patterns) {
      const match = norm.match(pat);
      if (match && match[1] && match[1].trim().length > 6) {
        return match[1].trim();
      }
    }

    return null;
  }

  /**
   * Detecta si el usuario pregunta sobre la memoria o lo que VECTRA ha aprendido
   */
  detectQueryAboutLearnings(message) {
    if (!message || typeof message !== 'string') return false;
    const norm = message.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return (
      norm.includes('que has aprendido') ||
      norm.includes('que recuerdas') ||
      norm.includes('muestrame tu memoria') ||
      norm.includes('que te he ensenado') ||
      norm.includes('que sabes de memoria') ||
      norm.includes('revisa tu memoria')
    );
  }

  /**
   * Guarda un nuevo conocimiento aprendido del usuario
   */
  learnFact(factText, userMessage) {
    const cleanFact = factText.replace(/^[:,\s]+/, '').trim();
    if (!cleanFact || cleanFact.length < 5) return null;

    // Extraer un concepto breve
    const words = cleanFact.split(/\s+/).slice(0, 5).join(' ');
    const concept = words.length > 30 ? words.slice(0, 30) + '...' : words;

    const newEntry = {
      id: `learn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      concepto: concept,
      hecho: cleanFact,
      categoria: 'Conocimiento Aprendido del Usuario',
      fecha: new Date().toISOString().split('T')[0],
      fechaTexto: 'Octubre de 2026',
      origenUsuario: true
    };

    // Agregar al inicio para dar máxima prioridad
    this.memory.unshift(newEntry);
    this.persist();

    return newEntry;
  }

  /**
   * Genera una respuesta inmediata de celebración de aprendizaje
   */
  generateLearningResponse(learnedEntry) {
    return {
      habla: `¡Entendido, bro! He asimilado ese nuevo dato directamente en mis núcleos de memoria persistente: "${learnedEntry.hecho}". A partir de ahora lo tendré siempre presente en todos nuestros análisis y razonamientos.`,
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: `Conocimiento memorizado exitosamente: "${learnedEntry.hecho}". Guardado en memoria viva a fecha de Octubre de 2026.`
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        '¿Qué otros conocimientos tienes en tu memoria?',
        'Hazme una pregunta sobre lo que acabas de aprender',
        '¿Cuál es el último modelo de Google Gemini en 2026?',
        'Suma los vectores (2, 3, -1) y (1, -4, 2)'
      ],
      _meta: {
        providerUsed: 'learning_engine',
        providerName: 'Motor de Memoria & Aprendizaje Continuo VECTRA',
        learnedFact: learnedEntry
      }
    };
  }

  /**
   * Genera un reporte de todo lo que VECTRA recuerda y ha aprendido
   */
  generateMemoryReport() {
    const userLearnings = this.memory.filter(m => m.origenUsuario);
    const preloaded = this.memory.filter(m => !m.origenUsuario);

    const bullets = this.memory.slice(0, 6).map((m, i) => `${i + 1}. **${m.concepto}**: ${m.hecho}`).join('\n');

    const speakSummary = userLearnings.length > 0
      ? `Tengo guardados ${this.memory.length} conocimientos en mi memoria activa, incluyendo ${userLearnings.length} datos exclusivos que me has enseñado tú personalmente. Mi base está sincronizada con la vanguardia científica y tecnológica de octubre de 2026.`
      : `Mi memoria activa cuenta con conocimientos actualizados a octubre de 2026 sobre la familia Gemini 2.0, razonamiento cuántico de Willow, AlphaFold 3 y modelos o1 y o3. Además, ¡estoy listo para que me enseñes lo que quieras diciéndome "Aprende esto"!`;

    return {
      habla: speakSummary,
      emocion: 'feliz',
      pasos: [],
      resultado: {
        latex: '',
        texto: `Memoria de Conocimiento Activo (Octubre 2026):\n${bullets}`
      },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        'Aprende que el telescopio espacial Nancy Grace Roman se lanzará pronto',
        '¿Cuál es el último modelo de Google Gemini en 2026?',
        '¿Qué avances hay en computación cuántica?',
        'Resolvamos un problema de vectores 3D'
      ],
      _meta: {
        providerUsed: 'learning_engine_report',
        providerName: 'Auditoría de Memoria VECTRA',
        totalLearned: this.memory.length
      }
    };
  }

  /**
   * Retorna hechos relevantes para inyectar en el prompt del LLM
   */
  getRelevantLearningsPrompt(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') return '';
    const norm = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const tokens = norm.split(/\s+/).filter(w => w.length > 3);

    // Filtrar entradas coincidentes
    const matches = this.memory.filter(entry => {
      const entryText = `${entry.concepto} ${entry.hecho} ${entry.categoria}`.toLowerCase();
      return tokens.some(t => entryText.includes(t));
    });

    // Tomar las mejores coincidencias o las más recientes
    const selected = matches.length > 0 ? matches.slice(0, 4) : this.memory.slice(0, 3);

    if (selected.length === 0) return '';

    const lines = selected.map(s => `- [${s.categoria || 'Hecho'}] (${s.fechaTexto || '2026'}): ${s.hecho}`);
    return `\n### BASE DE CONOCIMIENTOS DE MEMORIA VIVA Y APRENDIZAJES DEL USUARIO (FECHA ACTUAL: OCTUBRE DE 2026):\n${lines.join('\n')}\n`;
  }
}

export const learningEngine = new LearningEngine();
