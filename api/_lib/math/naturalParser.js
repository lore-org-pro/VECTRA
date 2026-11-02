// ========================================================
// VECTRA // ADVANCED NATURAL LANGUAGE MATHEMATICAL & VECTOR PARSER
// Comprende cualquier jerga, modismo, variación fonética y sintaxis
// ========================================================

const SPANISH_DIGITS = {
  'cero': '0', 'un': '1', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3',
  'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8',
  'nueve': '9', 'diez': '10', 'once': '11', 'doce': '12', 'trece': '13',
  'catorce': '14', 'quince': '15', 'dieciséis': '16', 'dieciseis': '16',
  'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19', 'veinte': '20',
  'veintiuno': '21', 'veintidós': '22', 'veintidos': '22', 'veintitrés': '23',
  'veintitres': '23', 'veinticuatro': '24', 'veinticinco': '25',
  'veintiséis': '26', 'veintiseis': '26', 'veintisiete': '27',
  'veintiocho': '28', 'veintinueve': '29', 'treinta': '30',
  'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60', 'setenta': '70',
  'ochenta': '80', 'noventa': '90', 'cien': '100'
};

// Conversión de decenas compuestas: "treinta y cinco" -> "35", "cuarenta y dos" -> "42"
const TENS_MAP = {
  'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
  'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90
};
const ONES_MAP = {
  'uno': 1, 'un': 1, 'una': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
  'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9
};

export class NaturalVectorParser {
  /**
   * Extrae vectores de cualquier cadena en lenguaje natural o técnico
   * Soporta:
   * - (1, 2, 3), [1, 2, 3], <1, 2, 3>, {1, 2, 3}
   * - Notación canónica i, j, k (ej: 2i - 3j + 4k, -i + 2k)
   * - Separación por espacios o puntos y comas: (1 2 3) o (1; 2; 3)
   * - Lenguaje hablado sin paréntesis: "2, 3, menos 1 y 1, menos 4, 2"
   * - Palabras habladas: "tres, dos, menos cinco y uno, cuatro, dos"
   * - Notación con letras: "vector A = (1, 2, 3) y B = (4, 5, 6)"
   * - Tuplas planas: "quiero que sumes los vectores 2 1 menos 4 y 1 menos 4 3"
   */
  extractVectors(rawText) {
    if (!rawText || typeof rawText !== 'string') return [];
    const vectors = [];

    // Pre-procesamiento de palabras numéricas en español
    let text = rawText
      .replace(/[¿?¡!]/g, ' ')
      .replace(/Â/g, '')
      .replace(/\bmenos\s+(\w+)/gi, (m, word) => {
        const dig = SPANISH_DIGITS[word.toLowerCase()] || word;
        return `-${dig}`;
      })
      .replace(/\bnegativo\s+(\w+)/gi, (m, word) => {
        const dig = SPANISH_DIGITS[word.toLowerCase()] || word;
        return `-${dig}`;
      });

    // Reemplazar decenas compuestas primero (ej: "treinta y cinco" -> 35)
    for (const [tenStr, tenVal] of Object.entries(TENS_MAP)) {
      for (const [oneStr, oneVal] of Object.entries(ONES_MAP)) {
        const pattern = new RegExp(`\\b${tenStr}\\s+y\\s+${oneStr}\\b`, 'gi');
        text = text.replace(pattern, (tenVal + oneVal).toString());
      }
    }

    // Reemplazar dígitos en palabras individuales
    for (const [w, d] of Object.entries(SPANISH_DIGITS)) {
      text = text.replace(new RegExp(`\\b${w}\\b`, 'gi'), d);
    }

    // 1. Coordenadas explícitas con corchetes, paréntesis, llaves o signos angulares
    // Ej: (1, 2, 3) | <1, -4, 2> | [0, 5, -2] | (1; 2; 3) | (1 2 3) | (1, -4)
    const bracketRegex = /[\(\<\[\{]\s*(-?\d+(?:\.\d+)?)(?:[\s,;]+(-?\d+(?:\.\d+)?))(?:[\s,;]+(-?\d+(?:\.\d+)?))?\s*[\)\>\]\}]/g;
    let match;
    while ((match = bracketRegex.exec(text)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      if (match[3] !== undefined && match[3] !== '') {
        vectors.push([x, y, parseFloat(match[3])]);
      } else {
        vectors.push([x, y]); // 2D estricto: conserva exactamente la dimensión de entrada
      }
    }

    if (vectors.length >= 1) {
      return vectors;
    }

    // 2. Notación canónica con i, j, k (ej: 2i + 3j - k, 3i - 2j, 5k)
    const ijkMatches = [...text.matchAll(/(?:([+-]?\s*\d*(?:\.\d+)?)\s*i)?\s*(?:([+-]?\s*\d*(?:\.\d+)?)\s*j)?\s*(?:([+-]?\s*\d*(?:\.\d+)?)\s*k)?/gi)]
      .filter(m => m[0].trim().length > 1 && (m[0].includes('i') || m[0].includes('j') || m[0].includes('k')));

    if (ijkMatches.length > 0) {
      const hasAnyK = ijkMatches.some(m => (m[0].match(/([+-]?\s*\d*(?:\.\d+)?)\s*k/i) || [])[1] !== undefined);
      for (const m of ijkMatches) {
        const parseCoeff = (str) => {
          if (!str) return 0;
          const clean = str.replace(/\s+/g, '');
          if (clean === '' || clean === '+') return 1;
          if (clean === '-') return -1;
          return parseFloat(clean) || 0;
        };
        const iCoeff = (m[0].match(/([+-]?\s*\d*(?:\.\d+)?)\s*i/i) || [])[1];
        const jCoeff = (m[0].match(/([+-]?\s*\d*(?:\.\d+)?)\s*j/i) || [])[1];
        const kCoeff = (m[0].match(/([+-]?\s*\d*(?:\.\d+)?)\s*k/i) || [])[1];
        if (iCoeff !== undefined || jCoeff !== undefined || kCoeff !== undefined) {
          if (hasAnyK) {
            vectors.push([parseCoeff(iCoeff), parseCoeff(jCoeff), parseCoeff(kCoeff)]);
          } else {
            vectors.push([parseCoeff(iCoeff), parseCoeff(jCoeff)]);
          }
        }
      }
      if (vectors.length > 0) return vectors;
    }

    // 3. Lenguaje hablado natural dividido por conectores ("y", "e", "con", "+", "frente a")
    let norm = text.toLowerCase()
      .replace(/\.\s+(?=[yYec])/g, ' ')
      .replace(/\s+/g, ' ');

    const parts = norm.split(/\s+(?:y|e|con|\+|contra|frente\s+a)\s+/);
    if (parts.length >= 2) {
      const parseTuple = (s) => {
        return [...s.matchAll(/(-?\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));
      };
      let rawTuples = parts.map(parseTuple).filter(t => t.length > 0);

      const vCandidates = rawTuples.map(nums => {
        if (nums.length >= 3) return nums.slice(0, 3);
        if (nums.length === 2) return [nums[0], nums[1]]; // Conserva 2D sin agregar 0 al final
        if (nums.length === 1) return [nums[0]];
        return null;
      }).filter(Boolean);

      if (vCandidates.length >= 2) {
        return vCandidates.slice(0, 3);
      }
    }

    // 4. Tuplas secuenciales de números si se detectaron números en la frase
    let allNumbers = [...text.matchAll(/(-?\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));

    if (allNumbers.length === 6) {
      return [
        [allNumbers[0], allNumbers[1], allNumbers[2]],
        [allNumbers[3], allNumbers[4], allNumbers[5]]
      ];
    }
    if (allNumbers.length === 4) {
      // 2 vectores de 2 dimensiones cada uno en R^2
      return [
        [allNumbers[0], allNumbers[1]],
        [allNumbers[2], allNumbers[3]]
      ];
    }
    if (allNumbers.length === 2) {
      // 1 vector de 2 dimensiones
      return [[allNumbers[0], allNumbers[1]]];
    }
    if (allNumbers.length === 9) {
      return [
        [allNumbers[0], allNumbers[1], allNumbers[2]],
        [allNumbers[3], allNumbers[4], allNumbers[5]],
        [allNumbers[6], allNumbers[7], allNumbers[8]]
      ];
    }
    if (allNumbers.length === 3) {
      return [[allNumbers[0], allNumbers[1], allNumbers[2]]];
    }

    return vectors;
  }

  /**
   * Detecta la operación matemática requerida a partir de cualquier vocabulario
   */
  detectOperation(text) {
    if (!text || typeof text !== 'string') return 'desconocida';
    const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Producto Cruz / Vectorial
    if (
      norm.includes('producto cruz') ||
      norm.includes('producto vectorial') ||
      norm.includes('vectorial') ||
      norm.includes('rotacional') ||
      norm.includes('perpendicular a ambos') ||
      norm.includes('vector normal a ambos') ||
      /\bcruz\b/.test(norm) ||
      /\bcross\b/.test(norm) ||
      /\s+x\s+/.test(norm)
    ) {
      return 'producto_cruz';
    }

    // 2. Producto Punto / Escalar / Ortogonalidad
    if (
      norm.includes('producto punto') ||
      norm.includes('producto escalar') ||
      norm.includes('escalar') ||
      norm.includes('dot product') ||
      norm.includes('son ortogonales') ||
      norm.includes('ortogonal') ||
      norm.includes('perpendicular') ||
      norm.includes('forman 90')
    ) {
      return 'producto_punto';
    }

    // 3. Ángulo entre vectores
    if (
      norm.includes('angulo') ||
      norm.includes('inclinacion') ||
      norm.includes('grados forman') ||
      norm.includes('separacion angular') ||
      norm.includes('theta')
    ) {
      return 'angulo';
    }

    // 4. Proyección ortogonal
    if (
      norm.includes('proyeccion') ||
      norm.includes('proyectar') ||
      norm.includes('proyecta') ||
      norm.includes('sombra') ||
      norm.includes('componente vectorial')
    ) {
      return 'proyeccion';
    }

    // 5. Distancia entre dos puntos o vectores
    if (
      norm.includes('distancia') ||
      norm.includes('separacion entre') ||
      norm.includes('que tan lejos')
    ) {
      return 'distancia';
    }

    // 6. Punto medio
    if (
      norm.includes('punto medio') ||
      norm.includes('centro entre') ||
      norm.includes('mitad entre')
    ) {
      return 'punto_medio';
    }

    // 7. Cosenos y ángulos directores
    if (
      norm.includes('cosenos directores') ||
      norm.includes('angulos directores') ||
      norm.includes('orientacion espacial') ||
      norm.includes('coseno director')
    ) {
      return 'cosenos_directores';
    }

    // 8. Coordenadas esféricas o cilíndricas
    if (norm.includes('esferica') || norm.includes('coordenadas esfericas')) {
      return 'esfericas';
    }
    if (norm.includes('cilindrica') || norm.includes('coordenadas cilindricas')) {
      return 'cilindricas';
    }

    // 9. Triple producto vectorial
    if (
      norm.includes('triple producto vectorial') ||
      norm.includes('triple vectorial') ||
      norm.includes('bac cab') ||
      norm.includes('a x (b x c)')
    ) {
      return 'triple_vectorial';
    }

    // 10. Volumen / Paralelepípedo / Triple producto escalar
    if (
      norm.includes('volumen') ||
      norm.includes('paralelepipedo') ||
      norm.includes('caja') ||
      norm.includes('triple producto escalar') ||
      norm.includes('triple escalar')
    ) {
      return 'volumen';
    }

    // 11. Áreas
    if (norm.includes('paralelogramo')) {
      return 'area_paralelogramo';
    }
    if (norm.includes('triangulo')) {
      return 'area_triangulo';
    }

    // 12. Ecuaciones geométricas en R³ (antes de magnitud para evitar que "vector normal" active norma)
    if (norm.includes('recta') || norm.includes('ecuacion de la recta')) {
      return 'recta';
    }
    if (norm.includes('plano') || norm.includes('ecuacion del plano')) {
      return 'plano';
    }

    // 13. Magnitud / Norma / Módulo
    if (
      norm.includes('magnitud') ||
      /\b(?:modulo|modulos)\b/i.test(norm) ||
      /\b(?:norma|normas)\b/i.test(norm) ||
      norm.includes('longitud') ||
      norm.includes('tamano') ||
      norm.includes('cuanto mide') ||
      norm.includes('distancia al origen')
    ) {
      return 'magnitud';
    }

    // 14. Vector unitario / Normalización
    if (
      norm.includes('unitario') ||
      norm.includes('normalizar') ||
      norm.includes('normaliza') ||
      norm.includes('tamano uno') ||
      norm.includes('longitud uno') ||
      norm.includes('vector director')
    ) {
      return 'unitario';
    }

    // 15. Independencia lineal
    if (
      norm.includes('independencia lineal') ||
      norm.includes('linealmente independientes') ||
      norm.includes('linealmente dependientes') ||
      norm.includes('son independientes')
    ) {
      return 'independencia_lineal';
    }

    // Descartar "menos" o signos que preceden números
    const opText = norm
      .replace(/menos\s+\d+/g, '')
      .replace(/negativo\s+\d+/g, '')
      .replace(/-\s*\d+/g, '');

    // 16. Suma con todas sus variantes coloquiales
    if (
      /\bsum/i.test(opText) ||
      opText.includes('adicion') ||
      opText.includes(' + ') ||
      /\bmas\b/i.test(opText) ||
      opText.includes('combina') ||
      opText.includes('junta') ||
      opText.includes('anade') ||
      opText.includes('agrega') ||
      opText.includes('total de')
    ) {
      return 'suma';
    }

    // 17. Resta con todas sus variantes
    if (
      /\brest/i.test(opText) ||
      opText.includes('diferencia') ||
      opText.includes('sustra') ||
      opText.includes(' - ') ||
      /\bmenos\b/i.test(opText) ||
      opText.includes('quita')
    ) {
      return 'resta';
    }

    return 'desconocida';
  }
}

export const naturalVectorParser = new NaturalVectorParser();
