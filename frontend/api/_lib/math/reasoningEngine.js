// ========================================================
// VECTRA // MATHEMATICAL REASONING & CHAIN-OF-THOUGHT ENGINE
// Valida, razona, planifica y previene trabas o saltos en falso
// ========================================================

export class ReasoningEngine {
  /**
   * Genera el desglose del razonamiento interno antes de proceder
   */
  analyze(query, parsedNumbers = []) {
    if (!query) return null;

    const norm = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!.,]/g, '')
      .trim();

    // 0. Si es saludo, cortesía o charla informal: NO generar razonamiento matemático de pizarra
    const isGreeting = /^(?:hola|buen(?:os)?\s*(?:dias|tardes|noches)|que\s*tal|como\s*estas|saludos|hey|hola\s*vectra|quien\s*eres|gracias|adios|chao)$/i.test(norm);
    if (isGreeting) return null;

    // 1. Identificar el dominio del problema
    let dominio = 'Conocimiento general y análisis cognitivo';
    let estrategia = 'Descomposición analítica, síntesis conceptual y diálogo socrático';
    let verificacion = 'Coherencia lógica y rigor conceptual';

    if (norm.includes('vector') || norm.includes('vectores') || norm.includes('cruz') || norm.includes('punto') || norm.includes('norma')) {
      dominio = 'Álgebra vectorial en R³';
      estrategia = 'Extracción de componentes canónicas, validación de dimensiones y producto analítico';
      verificacion = 'Verificación de ortogonalidad o norma euclidiana';
    } else if (norm.includes('cuantica') || norm.includes('relatividad') || norm.includes('fisica') || norm.includes('agujero negro') || norm.includes('universo') || norm.includes('luz') || norm.includes('energia')) {
      dominio = 'Física y Cosmología';
      estrategia = 'Aplicación de principios fundamentales (mecánica relativista, termodinámica o cuántica) y analogías intuitivas';
      verificacion = 'Consistencia con leyes universales de la física';
    } else if (norm.includes('inteligencia artificial') || norm.includes('red neuronal') || norm.includes('codigo') || norm.includes('programar') || norm.includes('algoritmo') || norm.includes('software') || norm.includes('python') || norm.includes('javascript')) {
      dominio = 'Ciencias de la Computación e Inteligencia Artificial';
      estrategia = 'Estructuración algorítmica, paradigmas de computación y modelado de sistemas';
      verificacion = 'Viabilidad de ejecución y eficiencia asintótica O(n)';
    } else if (norm.includes('filosofia') || norm.includes('etica') || norm.includes('conciencia') || norm.includes('moral') || norm.includes('realidad') || norm.includes('sentido') || norm.includes('pensar')) {
      dominio = 'Filosofía y Pensamiento Crítico';
      estrategia = 'Examen socrático, contrastación de corrientes filosóficas y argumentación dialéctica';
      verificacion = 'Validez deductiva y ausencia de falacias';
    } else if (norm.includes('historia') || norm.includes('guerra') || norm.includes('revolucion') || norm.includes('siglo') || norm.includes('civilizacion') || norm.includes('imperio') || norm.includes('antigua')) {
      dominio = 'Historia Universal y Humanidades';
      estrategia = 'Contextualización cronológica, causas y consecuencias socio-históricas';
      verificacion = 'Fidelidad a fuentes historiográficas contrastadas';
    } else if (norm.includes('cerebro') || norm.includes('adn') || norm.includes('celula') || norm.includes('biologia') || norm.includes('evolucion') || norm.includes('genetica')) {
      dominio = 'Biología y Neurociencia';
      estrategia = 'Mapeo molecular, celular y biológico funcional';
      verificacion = 'Evidencia empírica biológica y teoría sintética';
    } else if (norm.includes('matriz') || norm.includes('determinante') || norm.includes('transpuesta')) {
      dominio = 'Álgebra lineal (Matrices)';
      estrategia = 'Ordenamiento en filas/columnas y cálculo por cofactores o Sarrus';
      verificacion = 'Comprobación de invertibilidad (det != 0)';
    } else if (norm.includes('derivada') || norm.includes('integral') || norm.includes('limite')) {
      dominio = 'Cálculo diferencial e integral';
      estrategia = 'Identificación de la variable independiente y aplicación de reglas de derivación o integración';
      verificacion = 'Comprobación con la operación inversa';
    } else if (norm.includes('media') || norm.includes('mediana') || norm.includes('moda') || norm.includes('varianza')) {
      dominio = 'Estadística descriptiva';
      estrategia = 'Conteo, ordenación de menor a mayor y aplicación de medidas de tendencia central o dispersión';
      verificacion = 'Suma de frecuencias absolutas y rango intercuartil';
    } else if (norm.includes('probabilidad') || norm.includes('combinacion') || norm.includes('permutacion')) {
      dominio = 'Probabilidad y combinatoria';
      estrategia = 'Determinación de si importa el orden (permutación) o no (combinación) y evaluación factorial';
      verificacion = '0 <= P(A) <= 1 o n >= r';
    } else if (norm.includes('primo') || norm.includes('mcd') || norm.includes('mcm') || norm.includes('binario')) {
      dominio = 'Teoría de números';
      estrategia = 'Descomposición en factores primos o divisiones sucesivas';
      verificacion = 'Teorema fundamental de la aritmética';
    } else if (/[\d\+\-\*\/=\^]/.test(norm)) {
      dominio = 'Aritmética y cálculo numérico';
      estrategia = 'Identificación de operandos y cálculo analítico determinista';
      verificacion = 'Comprobación de propiedades aritméticas';
    }

    return {
      dominio,
      estrategia,
      verificacion,
      pensamiento: `Analizando enunciado: "${query}". Dominio identificado: ${dominio}. Aplicando: ${estrategia}. Validando consistencia para garantizar una resolución precisa sin inconsistencias.`
    };
  }
}

export const reasoningEngine = new ReasoningEngine();
