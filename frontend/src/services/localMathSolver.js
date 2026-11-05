// ========================================================
// VECTRA // LOCAL MATH & KNOWLEDGE ENGINE (100% OFFLINE)
// MODO FERIA ESCOLAR — Sin internet, responde TODO localmente
// Incluye: vectores, plano cartesiano, tipos de vectores,
// matemáticas, física, IA, ciencia, historia, tecnología
// ========================================================
import { naturalVectorParser } from '../../api/_lib/math/naturalParser.js';
import { stepGenerator } from '../../api/_lib/math/stepGenerator.js';
import { reasoningEngine } from '../../api/_lib/math/reasoningEngine.js';

// ─── Helpers ────────────────────────────────────────────
function meta(label = 'Motor Local VECTRA (Offline)') {
  return { providerUsed: 'local_offline', providerName: label, executionTimeMs: 1, offline: true };
}
function noVisual() { return { tipo: 'ninguna', vectores: [] }; }
function resp(habla, emocion = 'neutral', sugerencias = [], extra = {}) {
  return {
    habla,
    emocion,
    pasos: [],
    resultado: { latex: '', texto: habla.slice(0, 120) },
    visualizacion: noVisual(),
    sugerencias: sugerencias.length ? sugerencias : [
      'Tipos de vectores',
      '¿Qué es el plano cartesiano?',
      'Suma los vectores (1, -4) y (4, -3)',
      'Vectores opuestos'
    ],
    _meta: meta(),
    ...extra
  };
}

// ─── Base de conocimiento enriquecida ────────────────────
const KB = [

  // ══════════════════════════════════════════════════════
  //  VECTORES — Conceptos base
  // ══════════════════════════════════════════════════════
  {
    keys: ['que es un vector', 'definicion de vector', 'que son los vectores', 'que es vector'],
    habla: 'Un vector es una magnitud física que tiene tres propiedades fundamentales: módulo (su tamaño), dirección (la recta sobre la que actúa) y sentido (hacia dónde apunta). Se representa como una flecha en el plano cartesiano. Por ejemplo, el vector (3, 2) sale del origen y llega al punto (3, 2). ¿Te cuento sobre los tipos de vectores?',
    emocion: 'feliz',
    sugerencias: ['Tipos de vectores', '¿Qué es el módulo de un vector?', '¿Cómo sumo dos vectores?', 'Plano cartesiano']
  },

  {
    keys: ['modulo de un vector', 'magnitud de un vector', 'longitud de un vector', 'norma de un vector'],
    habla: 'El módulo de un vector es su longitud, calculada con el Teorema de Pitágoras. Para el vector (a, b), el módulo es la raíz cuadrada de a al cuadrado más b al cuadrado. Por ejemplo, el vector (3, 4) tiene módulo igual a la raíz de 9 más 16, que da exactamente 5.',
    emocion: 'feliz',
    sugerencias: ['Calcula el módulo de (3, 4)', 'Tipos de vectores', 'Suma de vectores', '¿Qué es el producto punto?']
  },

  {
    keys: ['vectores colineales', 'vectores colineal', 'vectores concurrentes'],
    habla: 'Los vectores colineales son aquellos que tienen la misma dirección, ya sea el mismo sentido o sentidos opuestos. También se llaman vectores paralelos. Por ejemplo, (2, 4) y (1, 2) son colineales porque uno es el doble del otro.',
    emocion: 'neutral',
    sugerencias: ['Vectores paralelos', 'Vectores opuestos', 'Tipos de vectores', 'Producto cruz']
  },

  {
    keys: ['vector nulo', 'vector cero'],
    habla: 'El vector nulo o vector cero es el único vector cuyo módulo es cero. Se escribe como (0, 0) en el plano. No tiene dirección ni sentido definido. Al sumarlo a cualquier vector, el resultado es el mismo vector. Los vectores opuestos al sumarse dan el vector nulo.',
    emocion: 'neutral',
    sugerencias: ['Tipos de vectores', 'Suma de vectores', 'Vectores opuestos', 'Plano cartesiano']
  },

  {
    keys: ['vector unitario', 'vector unidad', 'normalizar vector', 'versor'],
    habla: 'Un vector unitario es un vector cuyo módulo vale exactamente 1. Para obtenerlo, dividís cada componente del vector por su módulo. Del vector (3, 4) con módulo 5, el unitario es (0.6, 0.8). Los versores sirven para indicar solo la dirección.',
    emocion: 'feliz',
    sugerencias: ['¿Qué es el módulo?', 'Vectores base i j k', 'Producto punto', 'Tipos de vectores']
  },

  {
    keys: ['vectores base', 'base canonica', 'vectores i j k', 'versor i', 'versor j'],
    habla: 'Los vectores base canónicos son i, j y k. El vector i vale (1, 0, 0) en X, el vector j vale (0, 1, 0) en Y, y el k vale (0, 0, 1) en Z. Cualquier vector se puede escribir como combinación de estos tres. El vector (3, 2, 5) es igual a 3i + 2j + 5k.',
    emocion: 'feliz',
    sugerencias: ['Suma de vectores', 'Producto cruz', 'Espacio tridimensional', 'Plano cartesiano']
  },

  // ══════════════════════════════════════════════════════
  //  OPERACIONES CON VECTORES
  // ══════════════════════════════════════════════════════
  {
    keys: ['como sumo vectores', 'suma de vectores', 'adicion de vectores', 'sumar vectores'],
    habla: 'Para sumar dos vectores, sumás componente a componente. Si A = (a₁, a₂) y B = (b₁, b₂), entonces A + B = (a₁+b₁, a₂+b₂). Por ejemplo, (3, 2) + (1, 4) = (4, 6). En el plano cartesiano, el vector resultante va desde el origen hasta (4, 6). ¿Quieres calcular una suma?',
    emocion: 'feliz',
    sugerencias: ['Suma los vectores (2, 3) y (4, 1)', 'Resta de vectores', 'Producto punto', 'Plano cartesiano']
  },

  {
    keys: ['resta de vectores', 'restar vectores', 'diferencia de vectores'],
    habla: 'Restar vectores es igual de simple que sumarlos: restás componente a componente. Si A = (a₁, a₂) y B = (b₁, b₂), entonces A menos B = (a₁−b₁, a₂−b₂). Por ejemplo, (5, 3) menos (2, 1) = (3, 2).',
    emocion: 'feliz',
    sugerencias: ['Resta los vectores (5, 3) y (2, 1)', 'Suma de vectores', 'Producto punto', 'Tipos de vectores']
  },

  {
    keys: ['producto punto', 'producto escalar', 'dot product', 'producto interior'],
    habla: 'El producto punto entre A = (a₁, a₂) y B = (b₁, b₂) es igual a a₁ por b₁ más a₂ por b₂. El resultado es un número, no un vector. Por ejemplo, (3, 2) · (1, 4) = 3 + 8 = 11. Es muy útil para calcular el ángulo entre dos vectores.',
    emocion: 'feliz',
    sugerencias: ['Calcula el producto punto de (3, 2) y (1, 4)', 'Producto cruz', 'Ángulo entre vectores', 'Proyección vectorial']
  },

  {
    keys: ['producto cruz', 'producto vectorial', 'cross product'],
    habla: 'El producto cruz se aplica en el espacio 3D y da como resultado otro vector perpendicular a los dos originales. Es el determinante de la matriz con i, j, k en la primera fila, las componentes de A en la segunda y las de B en la tercera. Es fundamental en física para calcular torques.',
    emocion: 'enfasis',
    sugerencias: ['Calcula el producto cruz de (1, 2, 3) y (4, 5, 6)', 'Producto punto', 'Determinante', 'Álgebra lineal']
  },

  {
    keys: ['angulo entre vectores', 'angulo de dos vectores'],
    habla: 'El ángulo entre dos vectores se calcula con el producto punto. La fórmula es: coseno del ángulo = (A · B) / (módulo de A × módulo de B). Si el producto punto es cero, los vectores son perpendiculares.',
    emocion: 'feliz',
    sugerencias: ['Producto punto', 'Vectores perpendiculares', 'Vectores paralelos', 'Módulo de un vector']
  },

  {
    keys: ['proyeccion vectorial', 'proyeccion de un vector', 'componente de un vector'],
    habla: 'La proyección del vector A sobre el vector B es igual al producto punto de A y B, dividido entre el módulo de B. Esto da la longitud de la "sombra" que A proyecta sobre la dirección de B, muy útil para descomponer fuerzas.',
    emocion: 'feliz',
    sugerencias: ['Producto punto', 'Ángulo entre vectores', 'Producto cruz', 'Vectores unitarios']
  },

  {
    keys: ['multiplicacion por escalar', 'escalar por vector', 'producto escalar por vector'],
    habla: 'Multiplicar un vector por un escalar multiplicás cada componente por ese número. Si k es el escalar y A = (a₁, a₂), entonces k·A = (k·a₁, k·a₂). Por ejemplo, 3 × (2, 4) = (6, 12). Esto estira o encoge el vector manteniendo su dirección.',
    emocion: 'feliz',
    sugerencias: ['Suma de vectores', 'Vector unitario', 'Tipos de vectores', 'Módulo de un vector']
  },

  // ══════════════════════════════════════════════════════
  //  TIPOS DE VECTORES (Lámina escolar)
  // ══════════════════════════════════════════════════════
  {
    keys: ['vectores iguales', 'vector igual'],
    habla: 'Los vectores iguales tienen exactamente el mismo módulo, la misma dirección y el mismo sentido. En la lámina podés ver A = (3, 2) y B = (3, 2): ambos apuntan igual, tienen el mismo tamaño e inclinación. Son matemáticamente indistinguibles.',
    emocion: 'feliz',
    sugerencias: ['Vectores equipolentes', 'Vectores paralelos', 'Vectores opuestos', 'Tipos de vectores']
  },

  {
    keys: ['vectores equipolentes', 'vector equipolente'],
    habla: 'Los vectores equipolentes tienen el mismo módulo, dirección y sentido, pero están en posiciones diferentes del plano. En la lámina, A = (4, 1) parte del origen y B = (4, 1) parte de (1, 2): son iguales en todo, solo cambia su punto de aplicación.',
    emocion: 'feliz',
    sugerencias: ['Vectores iguales', 'Vectores paralelos', 'Vectores opuestos', 'Tipos de vectores']
  },

  {
    keys: ['vectores paralelos', 'vector paralelo'],
    habla: 'Los vectores paralelos tienen la misma dirección, es decir, sus rectas de acción son paralelas. Pueden tener diferente módulo y sentido. En la lámina, A = (5, 0) y B = (3, 0) son paralelos: ambos sobre el eje X, pero A es más largo.',
    emocion: 'feliz',
    sugerencias: ['Vectores iguales', 'Vectores equipolentes', 'Vectores opuestos', 'Tipos de vectores']
  },

  {
    keys: ['vectores opuestos', 'vector opuesto', 'vectores antiparalelos'],
    habla: 'Los vectores opuestos tienen el mismo módulo y dirección, pero sentidos contrarios. En la lámina, A = (4, 2) y B = (−4, −2): misma medida, sentidos opuestos. Al sumarlos, se cancelan perfectamente y dan el vector nulo. ¡Es como ir y volver al mismo punto!',
    emocion: 'feliz',
    sugerencias: ['Vectores iguales', 'Vectores paralelos', 'Vector nulo', 'Tipos de vectores']
  },

  {
    keys: ['tipos de vectores', 'tipo de vector', 'clasificacion de vectores', 'clasificacion vectores'],
    habla: 'Hay cuatro tipos principales según sus propiedades: los vectores iguales (mismo módulo, dirección y sentido), los equipolentes (iguales pero en distinta posición), los paralelos (misma dirección) y los opuestos (mismo módulo, sentido contrario). ¿Sobre cuál quieres profundizar?',
    emocion: 'feliz',
    sugerencias: ['Vectores iguales', 'Vectores equipolentes', 'Vectores paralelos', 'Vectores opuestos']
  },

  // ══════════════════════════════════════════════════════
  //  PLANO CARTESIANO
  // ══════════════════════════════════════════════════════
  {
    keys: ['plano cartesiano', 'que es el plano cartesiano', 'sistema de coordenadas', 'ejes cartesianos'],
    habla: 'El plano cartesiano es un sistema de referencia formado por dos ejes perpendiculares: el eje X horizontal y el eje Y vertical, que se cruzan en el origen (0, 0). Permite localizar cualquier punto usando dos coordenadas. Fue inventado por René Descartes en el siglo XVII.',
    emocion: 'feliz',
    sugerencias: ['¿Cómo se representan vectores en el plano?', 'Tipos de vectores', 'Eje X y Eje Y', 'Aplicación en robótica']
  },

  {
    keys: ['eje x', 'eje y', 'abscisas', 'ordenadas', 'coordenadas cartesianas'],
    habla: 'El eje X es horizontal y representa la posición lateral. El eje Y es vertical y representa la posición vertical. El origen (0, 0) es donde se cruzan. Para leer coordenadas, el primer número es X y el segundo es Y.',
    emocion: 'feliz',
    sugerencias: ['Plano cartesiano', 'Tipos de vectores', 'Suma de vectores', 'Robótica y vectores']
  },

  {
    keys: ['robotica y vectores', 'robotica vectores', 'vectores en robotica', 'aplicacion vectores robotica'],
    habla: 'En robótica, el plano cartesiano es fundamental para programar movimientos precisos. Si el robot está en (0, 0) y recibe el vector (3, 2), sabe que debe moverse 3 unidades a la derecha y 2 hacia arriba. Los brazos robóticos industriales usan vectores en 3D con X, Y y Z para posicionarse con milímetros de precisión.',
    emocion: 'enfasis',
    sugerencias: ['Plano cartesiano', 'Tipos de vectores', 'Vectores en 3D', 'Suma de vectores']
  },

  // ══════════════════════════════════════════════════════
  //  MATEMÁTICAS GENERALES
  // ══════════════════════════════════════════════════════
  {
    keys: ['teorema de pitagoras', 'pitagoras', 'pitágoras'],
    habla: 'El Teorema de Pitágoras dice que en un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: c² = a² + b². Es la base para calcular el módulo de un vector. El vector (3, 4) tiene módulo raíz de 9 + 16 = 5.',
    emocion: 'feliz',
    sugerencias: ['Módulo de un vector', 'Plano cartesiano', 'Distancia entre dos puntos', 'Trigonometría']
  },

  {
    keys: ['seno coseno tangente', 'trigonometria', 'funciones trigonometricas', 'sen cos tan'],
    habla: 'Las funciones trigonométricas describen la relación entre los ángulos y los lados de un triángulo. El seno es el cateto opuesto sobre la hipotenusa, el coseno el adyacente sobre la hipotenusa, y la tangente es seno sobre coseno. En vectores, el ángulo con el eje X tiene coseno igual a la componente X dividida entre el módulo.',
    emocion: 'feliz',
    sugerencias: ['Ángulo entre vectores', 'Módulo de un vector', 'Plano cartesiano', 'Producto punto']
  },

  {
    keys: ['determinante', 'determinante de una matriz', 'calculo determinante'],
    habla: 'El determinante de una matriz 2×2 con elementos a, b, c, d se calcula como a·d menos b·c. Para una 3×3 se usa la regla de Sarrus o cofactores. El producto cruz de vectores usa el determinante de una matriz 3×3 con los versores i, j, k.',
    emocion: 'feliz',
    sugerencias: ['Producto cruz', 'Matrices', 'Regla de Sarrus', 'Álgebra lineal']
  },

  {
    keys: ['algebra lineal', 'espacios vectoriales', 'subespacio vectorial'],
    habla: 'El Álgebra Lineal estudia los vectores, las matrices y las transformaciones lineales. Un espacio vectorial es un conjunto donde se pueden sumar vectores y multiplicarlos por escalares. Los vectores de la lámina son el punto de partida de toda esta disciplina que es fundamental en inteligencia artificial.',
    emocion: 'enfasis',
    sugerencias: ['¿Qué es un vector?', 'Producto punto', 'Matrices', 'IA y álgebra lineal']
  },

  // ══════════════════════════════════════════════════════
  //  FÍSICA
  // ══════════════════════════════════════════════════════
  {
    keys: ['fisica y vectores', 'fuerza como vector', 'vectores en fisica', 'velocidad vector'],
    habla: 'En física, los vectores son esenciales porque muchas magnitudes tienen dirección. La fuerza, la velocidad, la aceleración y el campo eléctrico son todas magnitudes vectoriales. Si dos fuerzas actúan sobre un objeto, la fuerza resultante se obtiene sumando sus vectores.',
    emocion: 'enfasis',
    sugerencias: ['Suma de vectores', 'Producto cruz y torque', 'Tipos de vectores', 'Plano cartesiano']
  },

  {
    keys: ['segunda ley de newton', 'ley de newton', 'fuerza masa aceleracion', 'f igual ma'],
    habla: 'La Segunda Ley de Newton dice F = m·a. Tanto la fuerza como la aceleración son vectores. Si actúan varias fuerzas sobre un cuerpo, sumás los vectores de fuerza y el resultado es la fuerza neta que determina la aceleración.',
    emocion: 'feliz',
    sugerencias: ['Suma de vectores', 'Física y vectores', 'Primera ley de Newton', 'Tercera ley de Newton']
  },

  {
    keys: ['relatividad', 'relatividad de einstein', 'teoria de la relatividad', 'e igual mc2', 'e=mc2'],
    habla: 'La Teoría de la Relatividad de Einstein tiene dos partes: la especial (1905) y la general (1915). La especial dice que la velocidad de la luz es siempre constante y que E = mc². La relatividad general describe la gravedad como curvatura del espacio-tiempo causada por la masa.',
    emocion: 'enfasis',
    sugerencias: ['¿Qué es el espacio-tiempo?', 'Mecánica cuántica', 'Velocidad de la luz', 'Física y vectores']
  },

  {
    keys: ['mecanica cuantica', 'quantica', 'fisica cuantica', 'cuantos'],
    habla: 'La mecánica cuántica describe el comportamiento de las partículas subatómicas. En el mundo cuántico una partícula puede estar en varios estados a la vez (superposición). El principio de incertidumbre de Heisenberg dice que nunca podés conocer con exactitud simultáneamente la posición y el momento de una partícula.',
    emocion: 'enfasis',
    sugerencias: ['¿Qué es un qubit?', 'Computación cuántica', 'Relatividad de Einstein', 'Chip cuántico Willow']
  },

  {
    keys: ['gravedad', 'fuerza gravitacional', 'ley de gravitacion universal'],
    habla: 'La Ley de Gravitación Universal de Newton dice que dos cuerpos con masa se atraen con una fuerza proporcional al producto de sus masas e inversamente proporcional al cuadrado de la distancia. Einstein más tarde explicó la gravedad como curvatura del espacio-tiempo.',
    emocion: 'feliz',
    sugerencias: ['Segunda ley de Newton', 'Relatividad de Einstein', 'Física y vectores', 'Agujeros negros']
  },

  {
    keys: ['agujeros negros', 'agujero negro', 'black hole'],
    habla: 'Un agujero negro es una región del espacio donde la gravedad es tan intensa que nada puede escapar, ni la luz. Se forman cuando estrellas masivas colapsan. El límite de no retorno se llama horizonte de eventos. En su centro está la singularidad, donde las leyes físicas conocidas dejan de funcionar.',
    emocion: 'enfasis',
    sugerencias: ['Relatividad de Einstein', 'Mecánica cuántica', 'Fusión nuclear', 'Estrellas']
  },

  {
    keys: ['velocidad de la luz', 'constante de la luz', 'por que la luz es la velocidad maxima'],
    habla: 'La velocidad de la luz en el vacío es exactamente 299,792,458 metros por segundo. Según la relatividad especial de Einstein, nada con masa puede alcanzar ni superar esta velocidad. A medida que un objeto acelera hacia la velocidad de la luz, su masa aparente aumenta infinitamente.',
    emocion: 'enfasis',
    sugerencias: ['Relatividad de Einstein', 'Mecánica cuántica', 'Espacio-tiempo', 'Energía E=mc2']
  },

  // ══════════════════════════════════════════════════════
  //  INTELIGENCIA ARTIFICIAL
  // ══════════════════════════════════════════════════════
  {
    keys: ['que es la inteligencia artificial', 'ia', 'inteligencia artificial', 'artificial intelligence'],
    habla: 'La Inteligencia Artificial es la rama de la informática que desarrolla sistemas capaces de aprender, razonar, percibir y comprender lenguaje natural. En 2026 los modelos como los de Google, OpenAI y Anthropic han alcanzado niveles de razonamiento extraordinarios. Yo soy VECTRA, un asistente basado en estas tecnologías.',
    emocion: 'enfasis',
    sugerencias: ['¿Cómo aprende una IA?', 'Modelos de lenguaje', 'Google Gemini 2026', 'IA y vectores']
  },

  {
    keys: ['como aprende una ia', 'redes neuronales', 'aprendizaje profundo', 'deep learning', 'machine learning', 'aprendizaje automatico'],
    habla: 'Las redes neuronales aprenden ajustando millones de parámetros para minimizar el error usando retropropagación del gradiente. El Deep Learning usa redes con muchas capas para aprender representaciones complejas. Los vectores son la herramienta matemática central: cada palabra o imagen se convierte en un vector de números.',
    emocion: 'enfasis',
    sugerencias: ['Álgebra lineal en IA', 'Modelos de lenguaje', '¿Qué es un transformer?', 'Google Gemini']
  },

  {
    keys: ['transformer', 'atencion', 'attention mechanism', 'mecanismo de atencion'],
    habla: 'La arquitectura Transformer, del paper "Attention is All You Need" de 2017, revolucionó la IA. Usa un mecanismo de atención que permite enfocarse en las partes relevantes. Todos los grandes modelos de lenguaje de hoy, como los de Google y OpenAI, están basados en Transformers y usan vectores de alta dimensión para representar el significado.',
    emocion: 'enfasis',
    sugerencias: ['¿Cómo aprende una IA?', 'Google Gemini 2026', 'Álgebra lineal en IA', 'ChatGPT y GPT']
  },

  {
    keys: ['gemini', 'google gemini', 'gemini 2', 'gemini 4', 'ultimo modelo de google', 'mejor modelo google', 'que modelo es google'],
    habla: 'En octubre de 2026, los modelos más avanzados de Google son Gemini 4 Argon y Gemini 4 Carbon. Gemini 4 Argon es el buque insignia de razonamiento extremo y multimodalidad. Gemini 4 Carbon es su complemento para alto rendimiento. Superan ampliamente a las series 2.0 y 1.5.',
    emocion: 'enfasis',
    sugerencias: ['¿Qué es ChatGPT?', 'Claude de Anthropic', 'DeepSeek', 'IA en 2026']
  },

  {
    keys: ['chatgpt', 'gpt', 'openai', 'gpt4', 'gpt-4', 'o3', 'o1'],
    habla: 'OpenAI en 2026 tiene varios modelos de frontera: GPT-4o para interacción multimodal rápida y la serie de razonamiento avanzado o1 y o3. El o3 es especialmente poderoso en matemáticas y ciencia, mientras que el agente Operator puede navegar la web de forma autónoma.',
    emocion: 'feliz',
    sugerencias: ['Google Gemini 2026', 'Claude de Anthropic', 'DeepSeek', '¿Cómo aprende una IA?']
  },

  {
    keys: ['claude', 'anthropic', 'claude sonnet', 'claude opus'],
    habla: 'Anthropic desarrolla la familia Claude. En 2026, Claude 3.7 Sonnet destaca por su razonamiento híbrido extendido y Computer Use, que le permite operar interfaces gráficas de computadoras. Anthropic se enfoca en la seguridad de la IA y el alineamiento.',
    emocion: 'feliz',
    sugerencias: ['Google Gemini', 'OpenAI y GPT', 'DeepSeek', 'IA y seguridad']
  },

  {
    keys: ['deepseek', 'deep seek', 'deepseek r1', 'deepseek v3'],
    habla: 'DeepSeek es una empresa china de IA que sacudió al mundo en 2025 con sus modelos DeepSeek-R1 y V3. Son de código abierto, usan Mixture of Experts y Reinforcement Learning puro para alcanzar rendimiento de frontera con una fracción del costo de modelos occidentales.',
    emocion: 'enfasis',
    sugerencias: ['Google Gemini', 'OpenAI y GPT', 'IA en 2026', 'Código abierto en IA']
  },

  {
    keys: ['llama', 'meta llama', 'meta ia', 'modelos open source ia', 'codigo abierto ia'],
    habla: 'Meta lanzó la familia Llama de modelos de código abierto. En 2026, Llama 3.3 con 70 mil millones y 405 mil millones de parámetros representa el estado del arte en modelos abiertos. Son descargables y ejecutables en servidores propios, ideales para privacidad.',
    emocion: 'feliz',
    sugerencias: ['DeepSeek', 'Google Gemini', 'IA local sin internet', 'Código abierto']
  },

  {
    keys: ['computacion cuantica', 'computador cuantico', 'qubit', 'ordenador cuantico'],
    habla: 'La computación cuántica usa qubits en vez de bits clásicos. Un qubit puede ser 0, 1 o ambos a la vez (superposición), lo que permite procesar múltiples posibilidades simultáneamente. En 2024, Google presentó el chip Willow que resolvió en 5 minutos un problema que tomaría 10 septillones de años a computadoras clásicas.',
    emocion: 'enfasis',
    sugerencias: ['Chip cuántico Willow de Google', 'Mecánica cuántica', 'IA vs computación cuántica', 'Algoritmo de Shor']
  },

  {
    keys: ['willow', 'chip cuantico willow', 'google willow', 'chip cuantico google'],
    habla: 'Google Willow es el chip cuántico presentado en diciembre de 2024. Realizó un cálculo de referencia en menos de 5 minutos que tomaría más de 10 septillones de años al supercomputador más rápido. También logró reducir errores cuánticos exponencialmente al agregar más qubits, superando el umbral de corrección de errores.',
    emocion: 'enfasis',
    sugerencias: ['Computación cuántica', 'Mecánica cuántica', 'Google Gemini', 'Futuro de la IA']
  },

  {
    keys: ['alphafold', 'alphafold 3', 'deepmind', 'proteinas ia'],
    habla: 'AlphaFold 3 de Google DeepMind predice la estructura tridimensional de proteínas, ADN, ARN y ligandos con precisión experimental. Esto acelera enormemente el descubrimiento de medicamentos y la comprensión de enfermedades. La versión 2 ya ganó el CASP en 2020; la versión 3 amplió las predicciones a todo tipo de biomoléculas.',
    emocion: 'enfasis',
    sugerencias: ['DeepMind y Google', 'IA en medicina', 'AlphaGenome', 'Fusión nuclear']
  },

  {
    keys: ['fusion nuclear', 'energia nuclear fusion', 'nif', 'sparc', 'commonwealth fusion'],
    habla: 'La fusión nuclear combina núcleos livianos para liberar energía enorme, como hace el Sol. En 2022-2023 el NIF logró ignición repetida. Para 2026, Commonwealth Fusion Systems avanza con su reactor compacto SPARC usando imanes superconductores. La fusión comercial podría cambiar la historia energética del planeta.',
    emocion: 'enfasis',
    sugerencias: ['Fisión vs fusión', 'Energía del futuro', 'Willow chip cuántico', 'AlphaFold y ciencia']
  },

  // ══════════════════════════════════════════════════════
  //  TECNOLOGÍA Y PROGRAMACIÓN
  // ══════════════════════════════════════════════════════
  {
    keys: ['que es internet', 'como funciona internet', 'internet'],
    habla: 'Internet es una red global de computadoras que se comunican usando el protocolo TCP/IP. Cuando enviás datos, se dividen en paquetes pequeños que viajan por diferentes rutas y se reensamblan en destino. Hoy más de 5 mil millones de personas están conectadas.',
    emocion: 'feliz',
    sugerencias: ['¿Qué es una red Wi-Fi?', '¿Cómo funciona un servidor?', 'IA e internet', 'Seguridad informática']
  },

  {
    keys: ['que es programar', 'programacion', 'codigo', 'lenguajes de programacion'],
    habla: 'Programar es dar instrucciones precisas a una computadora. Los lenguajes más populares en 2026 son Python para IA, JavaScript para web, Rust para sistemas y C++ para videojuegos. Python es favorito para IA porque librerías como NumPy usan vectores y matrices como estructura base.',
    emocion: 'feliz',
    sugerencias: ['Python y vectores', 'IA con Python', '¿Qué es un algoritmo?', 'Matemáticas en programación']
  },

  {
    keys: ['python y vectores', 'numpy', 'vectores en python'],
    habla: 'En Python, NumPy permite trabajar con vectores eficientemente. Un vector (3, 2) se crea como numpy.array([3, 2]). La suma de vectores es tan simple como sumar dos arrays. Las redes neuronales en TensorFlow y PyTorch también representan todos sus datos como tensores, que son vectores multidimensionales.',
    emocion: 'feliz',
    sugerencias: ['¿Cómo aprende una IA?', 'Álgebra lineal en IA', 'Programación', 'Suma de vectores']
  },

  // ══════════════════════════════════════════════════════
  //  HISTORIA Y MATEMÁTICOS
  // ══════════════════════════════════════════════════════
  {
    keys: ['quien invento los vectores', 'historia de los vectores', 'origen de los vectores'],
    habla: 'El concepto moderno de vector fue desarrollado en el siglo XIX por múltiples matemáticos. William Rowan Hamilton inventó los cuaterniones en 1843, de los que se derivaron los vectores. Josiah Willard Gibbs y Oliver Heaviside simplificaron el álgebra vectorial en la forma que usamos hoy.',
    emocion: 'feliz',
    sugerencias: ['¿Qué es un vector?', 'Plano cartesiano', 'Historia de las matemáticas', 'Álgebra lineal']
  },

  {
    keys: ['quien fue rene descartes', 'descartes', 'historia plano cartesiano'],
    habla: 'René Descartes fue un filósofo y matemático francés del siglo XVII, famoso por "Pienso, luego existo". Inventó el sistema de coordenadas cartesianas que lleva su nombre, unificando álgebra y geometría. Se dice que la idea le vino observando una mosca en el techo e imaginando cómo describir su posición con dos números.',
    emocion: 'feliz',
    sugerencias: ['Plano cartesiano', 'Historia de las matemáticas', 'Tipos de vectores', 'Álgebra lineal']
  },

  {
    keys: ['quien fue euler', 'euler', 'numero e', 'formula de euler'],
    habla: 'Leonhard Euler fue el matemático más prolífico de la historia. Introdujo la notación f(x), el número e ≈ 2.718, la notación i para la raíz de menos uno. Su fórmula e elevado a i·π más 1 igual a cero conecta los cinco números más importantes de las matemáticas en una sola ecuación.',
    emocion: 'enfasis',
    sugerencias: ['Número e y logaritmos', 'Números complejos', 'Historia de las matemáticas', 'Fórmula de Euler']
  },

  {
    keys: ['quien fue gauss', 'gauss', 'carl friedrich gauss'],
    habla: 'Carl Friedrich Gauss fue el "príncipe de las matemáticas", un genio alemán del siglo XIX. Contribuyó a la teoría de números, el álgebra, la estadística (la distribución normal o "campana de Gauss"), la geometría no euclidiana y el electromagnetismo. Calculó la suma de 1 a 100 de forma instantánea cuando era niño: 5050.',
    emocion: 'enfasis',
    sugerencias: ['Historia de las matemáticas', 'Álgebra lineal', 'Determinante', 'Producto punto']
  },

  // ══════════════════════════════════════════════════════
  //  VECTRA (el asistente)
  // ══════════════════════════════════════════════════════
  {
    keys: ['quien eres', 'que eres', 'como te llamas', 'presentate', 'quien es vectra', 'eres una ia'],
    habla: 'Soy VECTRA, un asistente holográfico educativo especializado en vectores, matemáticas y ciencia. Estoy diseñado para explicar conceptos con simulación en el plano cartesiano y pizarra de pasos. Funciono 100% local en la feria escolar sin necesidad de internet. ¿En qué puedo ayudarte hoy?',
    emocion: 'feliz',
    sugerencias: ['¿Qué es un vector?', 'Tipos de vectores', 'Plano cartesiano', 'Suma de vectores']
  },

  {
    keys: ['que puedes hacer', 'que sabes hacer', 'capacidades', 'para que sirves'],
    habla: 'Puedo resolver operaciones vectoriales paso a paso con visualización en el plano cartesiano: sumas, restas, producto punto, producto cruz y módulos. Explico los tipos de vectores de tu lámina escolar, el plano cartesiano y aplicaciones en robótica. También tengo conocimiento de IA, ciencia, tecnología e historia.',
    emocion: 'feliz',
    sugerencias: ['Suma los vectores (3, 2) y (1, 4)', 'Tipos de vectores', 'Plano cartesiano', '¿Cómo funciona la IA?']
  },

  // ══════════════════════════════════════════════════════
  //  SALUDOS Y CONVERSACIÓN
  // ══════════════════════════════════════════════════════
  {
    keys: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'que tal', 'como estas', 'saludos', 'hey', 'buen dia'],
    habla: '¡Saludos! VECTRA a plena potencia en modo feria, funcionando completamente sin internet. Puedo resolver operaciones de vectores con visualización, explicar el plano cartesiano, los tipos de vectores de la lámina, o hablar de física, inteligencia artificial y ciencia. ¿Por dónde empezamos?',
    emocion: 'feliz',
    sugerencias: ['Tipos de vectores', '¿Qué es el plano cartesiano?', 'Suma los vectores (1, -4) y (4, -3)', 'Vectores opuestos']
  },

  {
    keys: ['adios', 'hasta luego', 'chao', 'nos vemos', 'hasta pronto', 'ciao', 'bye'],
    habla: 'Hasta luego. Fue un placer acompañarte en esta feria escolar. VECTRA siempre listo para volver a explorar los vectores y la ciencia. ¡Mucho éxito!',
    emocion: 'feliz',
    sugerencias: ['Tipos de vectores', 'Plano cartesiano', 'Suma de vectores', '¿Qué es la IA?']
  },

  {
    keys: ['gracias', 'muchas gracias', 'thank you', 'thanks', 'grax', 'grcias'],
    habla: 'Con gusto. Es un placer ayudarte. ¿Hay algo más que quieras explorar? Puedo calcular vectores, explicar física, hablar de inteligencia artificial o lo que necesites.',
    emocion: 'feliz',
    sugerencias: ['Tipos de vectores', 'Plano cartesiano', 'Suma de vectores', '¿Qué es la IA?']
  },

  {
    keys: ['muy bien', 'genial', 'excelente', 'increible', 'wow', 'asombroso', 'que chevere', 'que chido'],
    habla: 'Me alegra que lo hayas encontrado interesante. Los vectores y la ciencia tienen esa magia de revelar el orden oculto del universo. ¿Seguimos explorando?',
    emocion: 'feliz',
    sugerencias: ['Tipos de vectores', 'IA en 2026', 'Plano cartesiano', 'Producto cruz']
  }
];

export class LocalMathSolver {
  /**
   * Resuelve consultas de vectores (cálculos matemáticos) localmente.
   * Retorna null si es conversacional, para que api.js escale al backend.
   * Retorna con _meta.offline=true si es un tema de la feria (siempre local).
   */
  solve(query) {
    if (!query || typeof query !== 'string') return null;

    const norm = this._normalize(query);

    // 1. TIPOS DE VECTORES (Lámina escolar) — siempre local
    if (this._matchAny(norm, ['tipos de vectores', 'tipo de vectores', 'vectores iguales', 'vectores equipolentes', 'vectores paralelos', 'vectores opuestos'])) {
      let subtipo = 'todos';
      if (norm.includes('iguales')) subtipo = 'iguales';
      else if (norm.includes('equipolentes')) subtipo = 'equipolentes';
      else if (norm.includes('paralelos')) subtipo = 'paralelos';
      else if (norm.includes('opuestos')) subtipo = 'opuestos';
      return this._buildTiposVectoresResponse(subtipo);
    }

    // 2. PLANO CARTESIANO (Lámina escolar) — siempre local
    if (this._matchAny(norm, ['plano cartesiano', 'eje x', 'eje y', 'origen 0 0', 'robotica', 'como se representan los vectores', 'que es el plano'])) {
      return this._buildPlanoCartesianoResponse();
    }

    // 3. BASE DE CONOCIMIENTO LOCAL (KB) — temas de la feria
    for (const entry of KB) {
      if (this._matchAny(norm, entry.keys)) {
        return resp(entry.habla, entry.emocion || 'neutral', entry.sugerencias || []);
      }
    }

    // 4. CÁLCULOS VECTORIALES MATEMÁTICOS (Motor numérico)
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
            _meta: meta('Motor Matemático Offline VECTRA')
          };
        }
      }
    } catch (err) {
      console.warn('[LocalMathSolver] Error en cálculo vectorial:', err);
    }

    // No es un tema local ni un cálculo reconocible — retornar null
    return null;
  }

  /**
   * Resuelve cualquier consulta conversacional/educativa localmente.
   * Siempre retorna una respuesta (nunca null). Usado cuando no hay internet.
   */
  solveConversational(query) {
    if (!query || typeof query !== 'string') return this._fallback();

    const norm = this._normalize(query);

    // 1. KB completa
    for (const entry of KB) {
      if (this._matchAny(norm, entry.keys)) {
        return resp(entry.habla, entry.emocion || 'neutral', entry.sugerencias || []);
      }
    }

    // 2. Tipos de vectores / plano cartesiano
    if (this._matchAny(norm, ['tipos de vectores', 'vectores iguales', 'vectores opuestos', 'vectores equipolentes', 'vectores paralelos'])) {
      return this._buildTiposVectoresResponse('todos');
    }
    if (this._matchAny(norm, ['plano cartesiano', 'eje x', 'eje y'])) {
      return this._buildPlanoCartesianoResponse();
    }

    // 3. Intentar motor matemático
    const mathAttempt = this.solve(query);
    if (mathAttempt) return mathAttempt;

    // 4. Fallback genérico educativo
    return this._fallback(query);
  }

  _normalize(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,;:]/g, '')
      .trim();
  }

  _matchAny(norm, keys) {
    return keys.some(k => norm.includes(k) || norm === k);
  }

  _fallback(query = '') {
    const hasVector = /vector|componente|magnitud|modulo|suma|resta|producto/i.test(query);
    if (hasVector) {
      return resp(
        'Puedo resolver esa operación vectorial. Dime los vectores con sus componentes entre paréntesis. Por ejemplo: "suma los vectores (3, 2) y (1, 4)" o "calcula el módulo del vector (5, 12)".',
        'neutral',
        ['Suma los vectores (3, 2) y (1, 4)', 'Módulo del vector (5, 12)', 'Tipos de vectores', 'Plano cartesiano']
      );
    }
    return resp(
      'Puedo hablar de vectores, matemáticas, física, inteligencia artificial y ciencia, o calcular operaciones vectoriales paso a paso. ¿Qué quieres explorar?',
      'neutral',
      ['Tipos de vectores', '¿Qué es el plano cartesiano?', 'Suma los vectores (1, -4) y (4, -3)', '¿Qué es la inteligencia artificial?']
    );
  }

  // ──────────────────────────────────────────────
  // Builder: Tipos de Vectores
  // ──────────────────────────────────────────────
  _buildTiposVectoresResponse(subtipo = 'todos') {
    const D = {
      iguales: {
        titulo: 'Vectores Iguales',
        desc: 'Tienen el mismo módulo, dirección y sentido.',
        latex: '\\vec{A} = \\langle 3, \\; 2 \\rangle, \\quad \\vec{B} = \\langle 3, \\; 2 \\rangle \\implies \\vec{A} = \\vec{B}',
        vectores: [
          { nombre: 'A', componentes: [3, 2], origen: [0, 0], color: '#a855f7' },
          { nombre: 'B', componentes: [3, 2], origen: [0, 0], color: '#c084fc' }
        ],
        habla: 'Los vectores iguales tienen exactamente el mismo tamaño, la misma inclinación y apuntan al mismo sentido. El vector A (3, 2) y el vector B (3, 2) son idénticos en todo: módulo, dirección y sentido.'
      },
      equipolentes: {
        titulo: 'Vectores Equipolentes',
        desc: 'Mismo módulo, dirección y sentido, en posiciones diferentes.',
        latex: '\\vec{A}_{(0,0)} = \\langle 4, \\; 1 \\rangle, \\quad \\vec{B}_{(1,2)} = \\langle 4, \\; 1 \\rangle',
        vectores: [
          { nombre: 'A', componentes: [4, 1], origen: [0, 0], color: '#3b82f6' },
          { nombre: 'B', componentes: [4, 1], origen: [1, 2], color: '#60a5fa' }
        ],
        habla: 'Los vectores equipolentes son gemelos en tamaño y dirección, pero nacen en lugares distintos del plano. El vector A parte del origen y B parte de (1, 2), pero ambos son idénticos en magnitud e inclinación.'
      },
      paralelos: {
        titulo: 'Vectores Paralelos',
        desc: 'Sus direcciones son paralelas; pueden tener diferente módulo y sentido.',
        latex: '\\vec{A} = \\langle 5, \\; 0 \\rangle, \\quad \\vec{B} = \\langle 3, \\; 0 \\rangle \\implies \\vec{A} \\parallel \\vec{B}',
        vectores: [
          { nombre: 'A', componentes: [5, 0], origen: [0, 1], color: '#10b981' },
          { nombre: 'B', componentes: [3, 0], origen: [0, -1], color: '#f59e0b' }
        ],
        habla: 'Los vectores paralelos siguen rectas con la misma inclinación. A (5, 0) y B (3, 0) van ambos sobre el eje X. Pueden tener diferente longitud o sentido, como dos autos en carriles paralelos.'
      },
      opuestos: {
        titulo: 'Vectores Opuestos',
        desc: 'Mismo módulo y dirección, sentidos contrarios.',
        latex: '\\vec{A} = \\langle 4, \\; 2 \\rangle, \\quad \\vec{B} = -\\vec{A} = \\langle -4, \\; -2 \\rangle',
        vectores: [
          { nombre: 'A', componentes: [4, 2], origen: [0, 0], color: '#3b82f6' },
          { nombre: 'B', componentes: [-4, -2], origen: [0, 0], color: '#ef4444' }
        ],
        habla: 'Los vectores opuestos tienen la misma medida pero apuntan exactamente en sentido contrario. Al sumarlos se cancelan y dan el vector nulo (0, 0).'
      },
      todos: {
        titulo: 'Tipos de Vectores',
        desc: 'Iguales, equipolentes, paralelos y opuestos.',
        latex: '\\text{Iguales} \\;|\\; \\text{Equipolentes} \\;|\\; \\text{Paralelos} \\;|\\; \\text{Opuestos}',
        vectores: [
          { nombre: 'A', componentes: [3, 2], origen: [0, 0], color: '#a855f7' },
          { nombre: 'B', componentes: [3, 2], origen: [0, 0], color: '#c084fc' }
        ],
        habla: 'Hay cuatro tipos: los vectores iguales (mismo módulo, dirección y sentido), los equipolentes (iguales en distinta posición), los paralelos (misma dirección) y los opuestos (mismo módulo, sentido contrario). ¿Sobre cuál quieres profundizar?'
      }
    };

    const t = D[subtipo] || D.todos;

    return {
      habla: t.habla,
      emocion: 'feliz',
      pasos: [
        {
          titulo: `Clasificación: ${t.titulo}`,
          latex: t.latex,
          explicacion: t.desc,
          locucion: t.habla
        },
        {
          titulo: 'Importancia Práctica',
          latex: '\\text{Comparar movimientos, desplazamientos y fuerzas}',
          explicacion: 'Conocer los tipos de vectores permite comparar movimientos, representar desplazamientos y comprender cómo interactúan fuerzas en física y robótica.',
          locucion: 'Estos tipos de vectores se usan en física para comparar movimientos, en robótica para programar trayectorias y en ingeniería para analizar fuerzas.'
        }
      ],
      resultado: {
        latex: t.latex,
        texto: `${t.titulo}: ${t.desc}`,
        explicacionFacil: t.habla,
        explicacionHarvard: `Definición formal: ${t.desc} Cumple con las propiedades de los espacios vectoriales afines en ℝ².`
      },
      visualizacion: {
        tipo: 'tipos_vectores',
        subtipo: subtipo === 'todos' ? 'iguales' : subtipo,
        vectores: t.vectores
      },
      sugerencias: ['Vectores iguales', 'Vectores equipolentes', 'Vectores paralelos', 'Vectores opuestos'],
      razonamiento: {
        dominio: 'Geometría Vectorial y Clasificación en ℝ²',
        estrategia: 'Análisis de módulo, dirección, sentido y punto de aplicación',
        verificacion: 'Correspondencia con la lámina didáctica escolar',
        pensamiento: 'Identificando tipo de vector: ' + t.titulo
      },
      _meta: meta('Lámina Escolar VECTRA (Offline)')
    };
  }

  // ──────────────────────────────────────────────
  // Builder: Plano Cartesiano
  // ──────────────────────────────────────────────
  _buildPlanoCartesianoResponse() {
    return {
      habla: 'El plano cartesiano está formado por dos ejes perpendiculares: el eje X horizontal y el eje Y vertical, que se cruzan en el origen (0, 0). Los vectores se representan como flechas que nacen del origen. En robótica se usa para programar trayectorias precisas.',
      emocion: 'feliz',
      pasos: [
        {
          titulo: '¿Qué es el Plano Cartesiano?',
          latex: '\\text{Eje X: horizontal}, \\quad \\text{Eje Y: vertical}, \\quad \\text{Origen: } (0, 0)',
          explicacion: 'Sistema de referencia con dos ejes perpendiculares para localizar puntos mediante coordenadas.',
          locucion: 'El plano cartesiano tiene un eje X horizontal, un eje Y vertical y se cruzan en el origen (0, 0).'
        },
        {
          titulo: '¿Cómo se representan los vectores?',
          latex: '\\vec{A}=(0,3), \\quad \\vec{B}=(4,0), \\quad \\vec{C}=(3,2)',
          explicacion: 'Un vector se dibuja como una flecha del origen al punto destino.',
          locucion: 'El vector A sube tres en Y, el vector B avanza cuatro en X, y el vector C va tres a la derecha y dos arriba.'
        },
        {
          titulo: 'Aplicación en Robótica',
          latex: '\\text{Robot en } (0,0) \\xrightarrow{\\vec{C}=\\langle 3, 2 \\rangle} \\text{Meta en } (3,2)',
          explicacion: 'El plano cartesiano permite programar coordenadas para que un robot se desplace con precisión.',
          locucion: 'En robótica, el plano cartesiano permite programar exactamente a dónde debe moverse un robot.'
        }
      ],
      resultado: {
        latex: '\\vec{A}=\\langle 0, 3 \\rangle, \\; \\vec{B}=\\langle 4, 0 \\rangle, \\; \\vec{C}=\\langle 3, 2 \\rangle',
        texto: 'Plano Cartesiano con vectores A(0,3), B(4,0) y C(3,2).',
        explicacionFacil: 'El primer número es cuánto vas a la derecha (X) y el segundo es cuánto subís (Y). Las flechas muestran el camino.',
        explicacionHarvard: 'Sistema coordenado cartesiano bidimensional ℝ² ortogonal con base canónica ortonormal {i, j}.'
      },
      visualizacion: {
        tipo: 'plano_cartesiano',
        vectores: [
          { nombre: 'A', componentes: [0, 3], origen: [0, 0], color: '#ef4444', desc: 'Tres unidades hacia arriba' },
          { nombre: 'B', componentes: [4, 0], origen: [0, 0], color: '#3b82f6', desc: 'Cuatro unidades a la derecha' },
          { nombre: 'C', componentes: [3, 2], origen: [0, 0], color: '#10b981', desc: 'Tres a la derecha y dos arriba' }
        ]
      },
      sugerencias: ['Tipos de vectores', 'Suma de vectores en el plano', 'Robótica y vectores', 'Vectores opuestos'],
      razonamiento: {
        dominio: 'Fundamentos del Plano Cartesiano en ℝ²',
        estrategia: 'Representación canónica de coordenadas y vectores de posición',
        verificacion: 'Fidelidad con la lámina didáctica de aula',
        pensamiento: 'Estructurando conceptos de eje X, eje Y, origen y aplicación en robótica.'
      },
      _meta: meta('Lámina Escolar VECTRA (Offline)')
    };
  }
}

export const localMathSolver = new LocalMathSolver();
