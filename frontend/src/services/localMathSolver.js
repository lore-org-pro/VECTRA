// ========================================================
// VECTRA // LOCAL MATH & EDUCATIONAL SOLVER (100% OFFLINE)
// Funciona en el navegador sin conexión a internet ni APIs externas
// Incluye soporte directo para la lámina: "Tipos de Vectores" y "Plano Cartesiano"
// ========================================================
import { naturalVectorParser } from '../../api/_lib/math/naturalParser.js';
import { stepGenerator } from '../../api/_lib/math/stepGenerator.js';
import { reasoningEngine } from '../../api/_lib/math/reasoningEngine.js';

export class LocalMathSolver {
  /**
   * Resuelve cualquier consulta de vectores o preguntas conceptuales localmente
   */
  solve(query) {
    if (!query || typeof query !== 'string') return null;

    const norm = query
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,]/g, '')
      .trim();

    // ──────────────────────────────────────────────
    // 1. MODO EDUCATIVO: "TIPOS DE VECTORES" (Foto 1 de la lámina)
    // ──────────────────────────────────────────────
    if (
      norm.includes('tipos de vectores') ||
      norm.includes('tipo de vectores') ||
      norm.includes('vectores iguales') ||
      norm.includes('vectores equipolentes') ||
      norm.includes('vectores paralelos') ||
      norm.includes('vectores opuestos')
    ) {
      let subtipo = 'todos';
      if (norm.includes('iguales')) subtipo = 'iguales';
      else if (norm.includes('equipolentes')) subtipo = 'equipolentes';
      else if (norm.includes('paralelos')) subtipo = 'paralelos';
      else if (norm.includes('opuestos')) subtipo = 'opuestos';

      return this._buildTiposVectoresResponse(subtipo);
    }

    // ──────────────────────────────────────────────
    // 2. MODO EDUCATIVO: "PLANO CARTESIANO Y VECTORES" (Foto 2 de la lámina)
    // ──────────────────────────────────────────────
    if (
      norm.includes('plano cartesiano') ||
      norm.includes('eje x') ||
      norm.includes('eje y') ||
      norm.includes('origen 0 0') ||
      norm.includes('robotica') ||
      norm.includes('como se representan los vectores') ||
      (norm.includes('que es') && norm.includes('vector'))
    ) {
      return this._buildPlanoCartesianoResponse();
    }

    // ──────────────────────────────────────────────
    // 3. OPERACIONES MATEMÁTICAS VECTORIALES (Suma, resta, etc.)
    // ──────────────────────────────────────────────
    try {
      const extractedVectors = naturalVectorParser.extractVectors(query);
      const detectedOp = naturalVectorParser.detectOperation(query);

      if (extractedVectors.length > 0 && detectedOp !== 'desconocida') {
        const mathResult = stepGenerator.verifyAndCorrect({}, query);
        if (mathResult && Array.isArray(mathResult.pasos) && mathResult.pasos.length > 0) {
          const reasoning = reasoningEngine.analyze(query, extractedVectors.flat());
          if (reasoning) mathResult.razonamiento = reasoning;

          return {
            ...mathResult,
            _meta: {
              providerUsed: 'local_math_engine',
              providerName: 'Motor Matemático Local VECTRA (Offline)',
              executionTimeMs: 1,
              offline: true
            }
          };
        }
      }
    } catch (err) {
      console.warn('[LocalMathSolver] Error en cálculo vectorial:', err);
    }

    // ──────────────────────────────────────────────
    // 4. RESPUESTAS CONVERSACIONALES BÁSICAS OFFLINE
    // ──────────────────────────────────────────────
    if (/^(?:hola|buen(?:os)?\s*(?:dias|tardes|noches)|que\s*tal|como\s*estas|saludos|hey|alo)$/i.test(norm)) {
      return {
        habla: '¡Saludos! VECTRA a plena potencia en modo local. Puedes pedirme sumas o restas de vectores, explorar el Plano Cartesiano o ver los Tipos de Vectores de tu lámina escolar.',
        emocion: 'feliz',
        pasos: [],
        resultado: { latex: '', texto: 'VECTRA en línea (Modo Local Offline activo).' },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: [
          '¿Cuáles son los tipos de vectores?',
          '¿Qué es el plano cartesiano?',
          'Suma los vectores (1, -4) y (4, -3)',
          '¿Qué son vectores opuestos?'
        ],
        _meta: { providerUsed: 'local_offline', providerName: 'VECTRA Offline', executionTimeMs: 1 }
      };
    }

    if (/^(?:quien\s*eres|como\s*te\s*llamas|que\s*eres|presentate)$/i.test(norm)) {
      return {
        habla: 'Soy VECTRA, tu asistente holográfico de vectores y matemáticas. Estoy configurado para funcionar 100% local en tu aula escolar, con simulación en el Plano Cartesiano y pizarra de pasos.',
        emocion: 'enfasis',
        pasos: [],
        resultado: { latex: '', texto: 'VECTRA // Asistente Educativo de Álgebra Lineal' },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: [
          'Muéstrame el plano cartesiano',
          'Tipos de vectores',
          'Suma los vectores (3, 2) y (4, 1)'
        ],
        _meta: { providerUsed: 'local_offline', providerName: 'VECTRA Offline', executionTimeMs: 1 }
      };
    }

    // Fallback genérico local
    return {
      habla: 'Puedo resolver cualquier operación de vectores paso a paso en el pizarrón y simularla en el Plano Cartesiano. Prueba con: "suma los vectores 1 -4 y 4 -3" o "tipos de vectores".',
      emocion: 'neutral',
      pasos: [],
      resultado: { latex: '', texto: 'Listo para calcular vectores o explorar la simulación.' },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [
        'Tipos de vectores',
        '¿Qué es el plano cartesiano?',
        'Suma los vectores (1, -4) y (4, -3)',
        'Vectores opuestos'
      ],
      _meta: { providerUsed: 'local_offline', providerName: 'VECTRA Offline', executionTimeMs: 1 }
    };
  }

  // ──────────────────────────────────────────────
  // Generador de respuesta para "Tipos de Vectores"
  // ──────────────────────────────────────────────
  _buildTiposVectoresResponse(subtipo = 'todos') {
    const dataBySubtipo = {
      iguales: {
        titulo: 'Vectores Iguales',
        desc: 'Tienen el mismo módulo, dirección y sentido.',
        latex: '\\vec{A} = \\langle 3, \\; 2 \\rangle, \\quad \\vec{B} = \\langle 3, \\; 2 \\rangle \\implies \\vec{A} = \\vec{B}',
        vectores: [
          { nombre: 'A', componentes: [3, 2], origen: [0, 0], color: '#a855f7' },
          { nombre: 'B', componentes: [3, 2], origen: [0, 0], color: '#c084fc' }
        ],
        habla: 'Los vectores iguales tienen exactamente el mismo tamaño o módulo, la misma inclinación y apuntan al mismo sentido, como el vector A (3, 2) y el vector B (3, 2).'
      },
      equipolentes: {
        titulo: 'Vectores Equipolentes',
        desc: 'Tienen el mismo módulo, dirección y sentido, aunque se encuentren en posiciones diferentes.',
        latex: '\\vec{A}_{(0,0)} = \\langle 4, \\; 1 \\rangle, \\quad \\vec{B}_{(1,2)} = \\langle 4, \\; 1 \\rangle',
        vectores: [
          { nombre: 'A', componentes: [4, 1], origen: [0, 0], color: '#3b82f6' },
          { nombre: 'B', componentes: [4, 1], origen: [1, 2], color: '#60a5fa' }
        ],
        habla: 'Los vectores equipolentes son gemelos en tamaño y dirección, pero nacen en lugares distintos del plano, como el vector A desde el origen y el vector B desde el punto (1, 2).'
      },
      paralelos: {
        titulo: 'Vectores Paralelos',
        desc: 'Sus direcciones son paralelas. Pueden tener diferentes módulos y sentidos.',
        latex: '\\vec{A} = \\langle 5, \\; 0 \\rangle, \\quad \\vec{B} = \\langle 3, \\; 0 \\rangle \\implies \\vec{A} \\parallel \\vec{B}',
        vectores: [
          { nombre: 'A', componentes: [5, 0], origen: [0, 1], color: '#10b981' },
          { nombre: 'B', componentes: [3, 0], origen: [0, -1], color: '#f59e0b' }
        ],
        habla: 'Los vectores paralelos siguen rectas con la misma inclinación. Pueden tener diferente longitud o sentido, como las líneas de un tren.'
      },
      opuestos: {
        titulo: 'Vectores Opuestos',
        desc: 'Tienen el mismo módulo y dirección, pero sentidos contrarios.',
        latex: '\\vec{A} = \\langle 4, \\; 2 \\rangle, \\quad \\vec{B} = -\\vec{A} = \\langle -4, \\; -2 \\rangle',
        vectores: [
          { nombre: 'A', componentes: [4, 2], origen: [0, 0], color: '#3b82f6' },
          { nombre: 'B', componentes: [-4, -2], origen: [0, 0], color: '#ef4444' }
        ],
        habla: 'Los vectores opuestos tienen la misma medida pero apuntan exactamente en sentido contrario. Al sumarlos se cancelan a cero.'
      }
    };

    const target = dataBySubtipo[subtipo] || dataBySubtipo.iguales;

    return {
      habla: target.habla,
      emocion: 'feliz',
      pasos: [
        {
          titulo: 'Clasificación: Tipos de Vectores',
          latex: target.latex,
          explicacion: target.desc,
          locucion: target.habla
        },
        {
          titulo: 'Importancia Práctica',
          latex: '\\text{Comparar movimientos, desplazamientos y fuerzas}',
          explicacion: 'Conocer los tipos de vectores permite comparar movimientos, representar desplazamientos y comprender cómo interactúan diferentes fuerzas en la física y robótica.',
          locucion: 'Conocer estos tipos de vectores nos permite comparar movimientos y entender cómo interactúan las fuerzas.'
        }
      ],
      resultado: {
        latex: target.latex,
        texto: `${target.titulo}: ${target.desc}`,
        explicacionFacil: target.habla,
        explicacionHarvard: `Definición formal: ${target.desc} Cumple con las propiedades de los espacios vectoriales afines.`
      },
      visualizacion: {
        tipo: 'tipos_vectores',
        subtipo: subtipo === 'todos' ? 'iguales' : subtipo,
        vectores: target.vectores
      },
      sugerencias: [
        'Vectores iguales',
        'Vectores equipolentes',
        'Vectores paralelos',
        'Vectores opuestos'
      ],
      razonamiento: {
        dominio: 'Geometría Vectorial y Clasificación en ℝ²',
        estrategia: 'Análisis de módulo, dirección, sentido y punto de aplicación',
        verificacion: 'Correspondencia con la lámina didáctica escolar',
        pensamiento: 'Identificando tipo de vector: ' + target.titulo
      },
      _meta: {
        providerUsed: 'local_educational_engine',
        providerName: 'Lámina Escolar VECTRA (Offline)',
        executionTimeMs: 1,
        offline: true
      }
    };
  }

  // ──────────────────────────────────────────────
  // Generador de respuesta para "Plano Cartesiano"
  // ──────────────────────────────────────────────
  _buildPlanoCartesianoResponse() {
    return {
      habla: 'El plano cartesiano está formado por dos ejes perpendiculares: el eje horizontal X y el vertical Y, que se cruzan en el origen (0, 0). En la lámina puedes ver cómo se representan los vectores como flechas que nacen del origen y llegan a un punto determinado.',
      emocion: 'feliz',
      pasos: [
        {
          titulo: '¿Qué es el Plano Cartesiano?',
          latex: '\\text{Eje X: horizontal}, \\quad \\text{Eje Y: vertical}, \\quad \\text{Origen: } (0, 0)',
          explicacion: 'Es un sistema de referencia formado por dos ejes perpendiculares que permiten localizar puntos mediante coordenadas.',
          locucion: 'El plano cartesiano es un sistema de referencia con dos ejes perpendiculares: el eje X horizontal, el eje Y vertical y el origen donde se cruzan en cero cero.'
        },
        {
          titulo: '¿Cómo se representan los vectores?',
          latex: '\\vec{A}=(0,3), \\quad \\vec{B}=(4,0), \\quad \\vec{C}=(3,2)',
          explicacion: 'Un vector puede dibujarse como una flecha que parte del origen y llega a un punto determinado.',
          locucion: 'Un vector se dibuja como una flecha que nace en el origen: A sube tres en Y, B avanza cuatro en X, y C avanza tres a la derecha y dos hacia arriba.'
        },
        {
          titulo: 'Aplicación Práctica en Robótica',
          latex: '\\text{Robot en } (0,0) \\xrightarrow{\\vec{C}=\\langle 3, 2 \\rangle} \\text{Meta en } (3,2)',
          explicacion: 'En robótica, el plano cartesiano permite establecer coordenadas precisas para que un robot pueda desplazarse hacia una posición específica.',
          locucion: 'En robótica, este plano permite programar las coordenadas exactas para que un robot se mueva con precisión.'
        }
      ],
      resultado: {
        latex: '\\vec{A}=\\langle 0, 3 \\rangle, \\; \\vec{B}=\\langle 4, 0 \\rangle, \\; \\vec{C}=\\langle 3, 2 \\rangle',
        texto: 'Plano Cartesiano con vectores A(0,3), B(4,0) y C(3,2).',
        explicacionFacil: 'Imagina una cuadrícula en el piso: el punto central (0,0) es donde estás parado. El eje X es cuántos pasos das a los lados y el eje Y cuántos pasos das adelante. ¡Cada flecha es el camino para llegar a una meta!',
        explicacionHarvard: 'Sistema coordenado cartesiano bidimensional ℝ² ortogonal provisto de base canónica ortonormal {i, j}.'
      },
      visualizacion: {
        tipo: 'plano_cartesiano',
        vectores: [
          { nombre: 'A', componentes: [0, 3], origen: [0, 0], color: '#ef4444', desc: 'Se desplaza tres unidades hacia arriba' },
          { nombre: 'B', componentes: [4, 0], origen: [0, 0], color: '#3b82f6', desc: 'Se desplaza cuatro unidades hacia la derecha' },
          { nombre: 'C', componentes: [3, 2], origen: [0, 0], color: '#10b981', desc: 'Tres a la derecha y dos hacia arriba' }
        ]
      },
      sugerencias: [
        'Simular movimiento del robot',
        'Tipos de vectores',
        'Suma los vectores A y B',
        '¿Qué son vectores opuestos?'
      ],
      razonamiento: {
        dominio: 'Fundamentos del Plano Cartesiano en ℝ²',
        estrategia: 'Representación canónica de coordenadas y vectores de posición',
        verificacion: 'Fidelidad exacta con la lámina didáctica de aula',
        pensamiento: 'Estructurando los conceptos de eje X, eje Y, origen y aplicación en robótica.'
      },
      _meta: {
        providerUsed: 'local_educational_engine',
        providerName: 'Lámina Escolar VECTRA (Offline)',
        executionTimeMs: 1,
        offline: true
      }
    };
  }
}

export const localMathSolver = new LocalMathSolver();
