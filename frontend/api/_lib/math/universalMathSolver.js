// ========================================================
// VECTRA // UNIVERSAL MATHEMATICS PROFESSOR ENGINE
// Arithmetic, Algebra, Vectors, Calculus, Trigonometry & Theory
// ========================================================
import { advancedMathModules } from './advancedMathModules.js';
import { naturalVectorParser } from './naturalParser.js';
import { stepGenerator } from './stepGenerator.js';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// PARSER COMPLETO DE NÚMEROS EN ESPAÑOL
// Soporta: uno, dos, mil, dos mil, diez mil, un millón, dos millones,
//          treinta y uno, cuatrocientos cincuenta y seis, etc.
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const WORD_TO_NUM = {
  'cero':0,'un':1,'uno':1,'una':1,'dos':2,'tres':3,'cuatro':4,'cinco':5,
  'seis':6,'siete':7,'ocho':8,'nueve':9,
  'diez':10,'once':11,'doce':12,'trece':13,'catorce':14,'quince':15,
  'dieciseis':16,'diecisiete':17,'dieciocho':18,'diecinueve':19,
  'veinte':20,
  'veintiun':21,'veintiuno':21,'veintiuna':21,
  'veintidos':22,'veintitres':23,'veinticuatro':24,'veinticinco':25,
  'veintiseis':26,'veintisiete':27,'veintiocho':28,'veintinueve':29,
  'treinta':30,'cuarenta':40,'cincuenta':50,'sesenta':60,
  'setenta':70,'ochenta':80,'noventa':90,
  'cien':100,'ciento':100,
  'doscientos':200,'doscientas':200,
  'trescientos':300,'trescientas':300,
  'cuatrocientos':400,'cuatrocientas':400,
  'quinientos':500,'quinientas':500,
  'seiscientos':600,'seiscientas':600,
  'setecientos':700,'setecientas':700,
  'ochocientos':800,'ochocientas':800,
  'novecientos':900,'novecientas':900
};

// Palabras multiplicadoras
const MULTIPLIERS = { 'mil': 1000, 'millon': 1_000_000, 'millones': 1_000_000 };

function parseSpanishNumbers(text) {
  let result = text;

  // â”€â”€ PASO 1: Reemplazar palabras simples por dígitos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Ordenar de más largo a más corto para evitar reemplazos parciales
  const sortedEntries = Object.entries(WORD_TO_NUM).sort((a, b) => b[0].length - a[0].length);
  for (const [word, val] of sortedEntries) {
    result = result.replace(new RegExp(`\\b${word}\\b`, 'g'), ` ${val} `);
  }
  result = result.replace(/\s{2,}/g, ' ').trim();

  // â”€â”€ PASO 2: Resolver "X y Y" (treinta y uno →’ 31, etc.) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // Repetir hasta que no haya más cambios (para casos como "ciento treinta y cuatro")
  let prev;
  do {
    prev = result;
    result = result.replace(/\b(\d{1,3})\s+y\s+(\d{1,2})\b/g, (_, a, b) => {
      const A = parseInt(a), B = parseInt(b);
      if (A >= 20 && A < 100 && B >= 1 && B <= 9) return String(A + B);
      if (A >= 100 && A < 1000 && B < 100) return String(A + B);
      return `${a} y ${b}`;
    });
  } while (result !== prev);

  // â”€â”€ PASO 3: Juntar cientos con decenas/unidades (sin "y") â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // "100 50" →’ 150, "200 30" →’ 230
  do {
    prev = result;
    result = result.replace(/\b(1\d{2}|[2-9]00)\s+(\d{1,2})\b/g, (_, a, b) => {
      const A = parseInt(a), B = parseInt(b);
      if (A >= 100 && A < 1000 && B < 100 && A % 100 === 0) return String(A + B);
      return `${a} ${b}`;
    });
  } while (result !== prev);

  // â”€â”€ PASO 4: Resolver multiplcador "mil" â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // "2 mil 500" →’ 2500 | "2 mil" →’ 2000 | "mil 500" →’ 1500 | "mil" →’ 1000
  result = result.replace(/\b(\d+)\s*mil\s+(\d+)\b/g, (_, a, b) => String(parseInt(a) * 1000 + parseInt(b)));
  result = result.replace(/\b(\d+)\s*mil\b/g, (_, a) => String(parseInt(a) * 1000));
  result = result.replace(/\bmil\s+(\d+)\b/g, (_, b) => String(1000 + parseInt(b)));
  result = result.replace(/\bmil\b/g, '1000');

  // â”€â”€ PASO 5: Resolver "millón / millones" â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  result = result.replace(/\b(\d+)\s*millon(?:es)?\s+(\d+)\b/g, (_, a, b) => String(parseInt(a) * 1_000_000 + parseInt(b)));
  result = result.replace(/\b(\d+)\s*millon(?:es)?\b/g, (_, a) => String(parseInt(a) * 1_000_000));
  result = result.replace(/\bmillon(?:es)?\b/g, '1000000');

  // â”€â”€ PASO 6: Juntar miles con cientos residuales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // "2000 500" →’ 2500 (ej. "dos mil quinientos" después de los pasos anteriores)
  do {
    prev = result;
    result = result.replace(/\b(\d{4,})\s+(\d{1,3})\b/g, (_, a, b) => {
      const A = parseInt(a), B = parseInt(b);
      // Solo si A termina en 000 y B es el complemento
      if (A % 1000 === 0 && B < 1000) return String(A + B);
      return `${a} ${b}`;
    });
  } while (result !== prev);

  return result;
}

// Mantener compatibilidad con el diccionario simple para otros usos internos
const SPANISH_NUMBERS = WORD_TO_NUM;

export class UniversalMathSolver {
  solve(query) {
    if (!query || typeof query !== 'string') return null;

    const norm = query.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[¿?¡!]/g, '')
      .trim();

    // 1. Parser completo de números en español (palabras →’ dígitos)
    let replaced = parseSpanishNumbers(norm);

    // A0) PREGUNTAS DEL PROFESOR Y EXPOSICIÓN ORAL
    const profResult = advancedMathModules.solveProfessorQuestions(norm);
    if (profResult) return profResult;

    // A) PREGUNTAS TEÓRICAS Y CONCEPTUALES DE MATEMÁTICAS
    const conceptual = this.solveConceptual(norm);
    if (conceptual) return conceptual;

    // B) ÁLGEBRA VECTORIAL EN R² Y R³
    const vectorResult = this.solveVectors(norm, replaced, query);
    if (vectorResult) return vectorResult;

    // B2) VECTORES AVANZADOS (proyección, unitario, ángulo)
    const advVecResult = this.solveAdvancedVectors(norm, replaced);
    if (advVecResult) return advVecResult;

    // B3) ESTADÍSTICA
    const statsResult = this.solveStatistics(norm, replaced);
    if (statsResult) return statsResult;

    // B4) PROBABILIDAD Y COMBINATORIA
    const probResult = this.solveProbability(norm, replaced);
    if (probResult) return probResult;

    // B5) MATRICES
    const matrixResult = this.solveMatrices(norm, replaced);
    if (matrixResult) return matrixResult;

    // B6) CÁLCULO DIFERENCIAL E INTEGRAL
    const calcResult = this.solveCalculus(norm, replaced);
    if (calcResult) return calcResult;

    // B7) GEOMETRÍA ANALÍTICA
    const geoResult = this.solveAnalyticGeometry(norm, replaced);
    if (geoResult) return geoResult;

    // B8) PROGRESIONES Y SERIES
    const seqResult = this.solveSequences(norm, replaced);
    if (seqResult) return seqResult;

    // B9) TEORÍA DE NÚMEROS (primos, MCD, MCM, binario, log)
    const ntResult = this.solveNumberTheory(norm, replaced);
    if (ntResult) return ntResult;

    // B10) ÁLGEBRA LINEAL AVANZADA (Sistemas 2x2 Cramer, Autovalores, LU, Bases, Rango)
    const linAlgResult = advancedMathModules.solveLinearAlgebra(norm, replaced);
    if (linAlgResult) return linAlgResult;

    // B11) FÍSICA VECTORIAL AVANZADA (Torque r x F, Trabajo W = F·d, Coulomb, Plano Inclinado)
    const physicsResult = advancedMathModules.solvePhysicsVectors(norm, replaced);
    if (physicsResult) return physicsResult;

    // B12) LÓGICA MATEMÁTICA Y TEORÍA DE CONJUNTOS
    const logicResult = advancedMathModules.solveSetsLogic(norm, replaced);
    if (logicResult) return logicResult;

    // B13) GEOMETRÍA EUCLIDIANA Y CÁLCULOS NUMÉRICOS
    const euclidResult = advancedMathModules.solveEuclidean(norm, replaced);
    if (euclidResult) return euclidResult;

    // C) TABLAS DE MULTIPLICAR ("tabla del 7", "tabla del 8")
    const tableMatch = replaced.match(/(?:tabla|tablas)\s*(?:de|del|multiplicar\s+del)?\s*(\d+)/);
    if (tableMatch) {
      const n = parseInt(tableMatch[1], 10);
      const rows = [];
      for (let i = 1; i <= 10; i++) {
        rows.push(`${n} \\times ${i} = ${n * i}`);
      }
      return {
        habla: `Aquí tienes la tabla de multiplicar del ${n} completa, desde el 1 hasta el 10.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: `Tabla de Multiplicar del ${n}`,
            latex: `${n} \\times 1 = ${n}, \\quad ${n} \\times 2 = ${n * 2}, \\quad ${n} \\times 3 = ${n * 3}`,
            explicacion: `Multiplicamos sucesivamente el número base ${n} por cada uno de los números naturales del 1 al 10.`
          },
          {
            titulo: 'Valores Completos (4 al 7)',
            latex: `${n} \\times 4 = ${n * 4}, \\quad ${n} \\times 5 = ${n * 5}, \\quad ${n} \\times 6 = ${n * 6}, \\quad ${n} \\times 7 = ${n * 7}`,
            explicacion: `Cada producto es el resultado de sumar ${n} al resultado inmediatamente anterior.`
          },
          {
            titulo: 'Cierre de la Tabla (8 al 10)',
            latex: `${n} \\times 8 = ${n * 8}, \\quad ${n} \\times 9 = ${n * 9}, \\quad ${n} \\times 10 = ${n * 10}`,
            explicacion: `Concluimos la tabla estándar con ${n} por 10 igual a ${n * 10}.`
          }
        ],
        resultado: {
          latex: `${n} \\times 10 = ${n * 10}`,
          texto: `Tabla del ${n} completada con éxito.`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: [`Tabla del ${n + 1}`, `¿Cuánto es ${n} por 12?`]
      };
    }

    // D) ECUACIONES DE PRIMER GRADO (ej: 2x + 4 = 10, 3x - 9 = 0)
    const linearEqMatch = replaced.match(/(-?\d+)?\s*x\s*([\+\-])\s*(\d+)\s*=\s*(-?\d+)/);
    if (linearEqMatch) {
      const a = linearEqMatch[1] ? (linearEqMatch[1] === '-' ? -1 : parseFloat(linearEqMatch[1])) : 1;
      const sign = linearEqMatch[2];
      const b = parseFloat(linearEqMatch[3]) * (sign === '-' ? -1 : 1);
      const c = parseFloat(linearEqMatch[4]);
      const x = Math.round(((c - b) / a) * 1000) / 1000;

      return {
        habla: `Para la ecuación lineal, el valor de equis es igual a ${x}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Planteamiento de la Ecuación Lineal',
            latex: `${a === 1 ? '' : a === -1 ? '-' : a}x ${sign} ${Math.abs(b)} = ${c}`,
            explicacion: `Tenemos una ecuación de primer grado con una incógnita. El objetivo es aislar la variable x despejando los términos independientes.`
          },
          {
            titulo: 'Transposición de Términos',
            latex: `${a}x = ${c} ${b > 0 ? '-' : '+'} ${Math.abs(b)} \\implies ${a}x = ${c - b}`,
            explicacion: `Pasamos la constante ${Math.abs(b)} al lado derecho con el signo opuesto.`
          },
          {
            titulo: 'Despeje de la Incógnita x',
            latex: `x = \\frac{${c - b}}{${a}} = ${x}`,
            explicacion: `Dividimos ambos lados entre el coeficiente principal ${a}, obteniendo x = ${x}.`
          }
        ],
        resultado: {
          latex: `x = ${x}`,
          texto: `La solución de la ecuación es x = ${x}.`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // E) ECUACIONES CUADRÁTICAS (ej: x^2 - 5x + 6 = 0)
    const quadMatch = replaced.match(/(-?\d+)?\s*x\^?2\s*([\+\-])\s*(\d+)?\s*x\s*([\+\-])\s*(\d+)\s*=\s*0/);
    if (quadMatch) {
      const a = quadMatch[1] ? parseFloat(quadMatch[1]) : 1;
      const b = (quadMatch[3] ? parseFloat(quadMatch[3]) : 1) * (quadMatch[2] === '-' ? -1 : 1);
      const c = parseFloat(quadMatch[5]) * (quadMatch[4] === '-' ? -1 : 1);
      const delta = (b * b) - (4 * a * c);

      if (delta >= 0) {
        const x1 = Math.round(((-b + Math.sqrt(delta)) / (2 * a)) * 1000) / 1000;
        const x2 = Math.round(((-b - Math.sqrt(delta)) / (2 * a)) * 1000) / 1000;
        return {
          habla: `La ecuación cuadrática tiene dos raíces reales: equis uno es ${x1} y equis dos es ${x2}.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Fórmula Cuadrática General',
              latex: `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
              explicacion: `Identificamos los coeficientes: a = ${a}, b = ${b}, c = ${c}.`
            },
            {
              titulo: 'Cálculo del Discriminante',
              latex: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${b*b} - ${4*a*c} = ${delta}`,
              explicacion: `Como el discriminante es positivo (Î” = ${delta} > 0), existen dos raíces reales y distintas.`
            },
            {
              titulo: 'Cálculo de Raíces',
              latex: `x_1 = ${x1}, \\quad x_2 = ${x2}`,
              explicacion: `Evaluando con signo positivo y negativo obtenemos las soluciones del polinomio.`
            }
          ],
          resultado: {
            latex: `x_1 = ${x1}, \\quad x_2 = ${x2}`,
            texto: `Las soluciones son x1 = ${x1} y x2 = ${x2}.`
          },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // F) FACTORIAL (ej: factorial de 5, 5!)
    const factMatch = replaced.match(/(?:factorial\s+de\s+|(\d+)\s*!)/);
    if (factMatch || norm.includes('factorial')) {
      const numMatch = replaced.match(/\d+/);
      if (numMatch) {
        const n = Math.min(20, parseInt(numMatch[0], 10));
        let fact = 1;
        const sequence = [];
        for (let i = n; i >= 1; i--) {
          fact *= i;
          sequence.push(i);
        }
        return {
          habla: `El factorial de ${n} es igual a ${fact}.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: `Definición del Factorial: ${n}!`,
              latex: `${n}! = ${sequence.join(' \\times ')}`,
              explicacion: `El factorial es el producto de todos los números enteros positivos consecutivos desde 1 hasta ${n}.`
            },
            {
              titulo: 'Evaluación del Producto',
              latex: `${n}! = ${fact}`,
              explicacion: `Multiplicando secuencialmente cada uno de los factores se obtiene ${fact}.`
            }
          ],
          resultado: {
            latex: `${n}! = ${fact}`,
            texto: `Resultado: ${n}! = ${fact}`
          },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // G) PORCENTAJES (ej: 20 por ciento de 150, 15% de 80)
    const pctMatch = replaced.match(/(\d+(?:\.\d+)?)\s*(?:%|por\s+ciento)\s*(?:de)?\s*(\d+(?:\.\d+)?)/);
    if (pctMatch) {
      const pct = parseFloat(pctMatch[1]);
      const total = parseFloat(pctMatch[2]);
      const res = Math.round(((pct / 100) * total) * 1000) / 1000;
      return {
        habla: `El ${pct} por ciento de ${total} es ${res}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Planteamiento del Porcentaje',
            latex: `\\frac{${pct}}{100} \\times ${total}`,
            explicacion: `Convertimos la tasa porcentual a fracción decimal dividiéndola entre cien.`
          },
          {
            titulo: 'Cálculo Numérico',
            latex: `${pct / 100} \\times ${total} = ${res}`,
            explicacion: `Multiplicamos la fracción decimal por el valor base ${total} obteniendo ${res}.`
          }
        ],
        resultado: {
          latex: `${pct}\\% \\text{ de } ${total} = ${res}`,
          texto: `El ${pct}% de ${total} es ${res}.`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // H) RAÍZ CUADRADA
    const sqrtMatch = replaced.match(/(?:raiz|raiz cuadrada|raices)\s*(?:de)?\s*(\d+(?:\.\d+)?)/);
    if (sqrtMatch) {
      const n = parseFloat(sqrtMatch[1]);
      const res = Math.sqrt(n);
      const rounded = Math.round(res * 1000) / 1000;
      return {
        habla: `La raíz cuadrada de ${n} es ${rounded}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Planteamiento de la Raíz Cuadrada',
            latex: `\\sqrt{${n}}`,
            explicacion: `Buscamos un número que multiplicado por sí mismo produzca exactamente ${n}.`
          },
          {
            titulo: 'Extracción de la Raíz',
            latex: `\\sqrt{${n}} = ${rounded}`,
            explicacion: `El valor principal del radical es ${rounded}, dado que ${rounded}^2 \\approx ${n}.`
          }
        ],
        resultado: {
          latex: `\\sqrt{${n}} = ${rounded}`,
          texto: `Resultado: ${rounded}`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // I) POTENCIAS (ej: 2 a la 5, 3 al cuadrado, 4 elevado a 3)
    const powMatch = replaced.match(/(\d+(?:\.\d+)?)\s*(?:elevado a la|elevado a|a la|potencia de)?\s*(?:al cuadrado|al cubo|(\d+(?:\.\d+)?))/);
    if (powMatch && (norm.includes('elevado') || norm.includes('cuadrado') || norm.includes('cubo') || norm.includes(' a la '))) {
      const base = parseFloat(powMatch[1]);
      let exp = 2;
      if (norm.includes('cuadrado')) exp = 2;
      else if (norm.includes('cubo')) exp = 3;
      else if (powMatch[2]) exp = parseFloat(powMatch[2]);

      const res = Math.pow(base, exp);
      return {
        habla: `${base} elevado a la ${exp} es igual a ${res}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Planteamiento de la Potencia',
            latex: `${base}^{${exp}}`,
            explicacion: `Multiplicamos la base ${base} por sí misma un total de ${exp} veces.`
          },
          {
            titulo: 'Cálculo Exponencial',
            latex: `${base}^{${exp}} = ${res}`,
            explicacion: `Efectuando el producto sucesivo de factores obtenemos ${res}.`
          }
        ],
        resultado: {
          latex: `${base}^{${exp}} = ${res}`,
          texto: `Resultado: ${res}`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // J) TRIGONOMETRÍA BÁSICA (seno, coseno, tangente)
    const trigMatch = replaced.match(/(?:seno|sen|coseno|cos|tangente|tan)\s*(?:de)?\s*(\d+(?:\.\d+)?)/);
    if (trigMatch) {
      const deg = parseFloat(trigMatch[1]);
      const rad = (deg * Math.PI) / 180;
      let func = 'seno';
      let latexFunc = '\\sin';
      let res = Math.sin(rad);

      if (norm.includes('cos')) {
        func = 'coseno';
        latexFunc = '\\cos';
        res = Math.cos(rad);
      } else if (norm.includes('tan')) {
        func = 'tangente';
        latexFunc = '\\tan';
        res = Math.tan(rad);
      }

      const rounded = Math.round(res * 10000) / 10000;
      return {
        habla: `El ${func} de ${deg} grados sexagesimales es ${rounded}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: `Función Trigonométrica: ${func.toUpperCase()}`,
            latex: `${latexFunc}(${deg}^\\circ)`,
            explicacion: `Convertimos el ángulo sexagesimal ${deg}° a radianes: ${deg} \\times \\frac{\\pi}{180} \\approx ${Math.round(rad*1000)/1000} \\text{ rad}.`
          },
          {
            titulo: 'Evaluación del Círculo Trigonométrico',
            latex: `${latexFunc}(${deg}^\\circ) = ${rounded}`,
            explicacion: `El valor de la razón trigonométrica es ${rounded}.`
          }
        ],
        resultado: {
          latex: `${latexFunc}(${deg}^\\circ) = ${rounded}`,
          texto: `${func}(${deg}°) = ${rounded}`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // K) ARITMÉTICA ESTÁNDAR (+, -, *, /)
    let cleanExpr = replaced
      .replace(/cuanto es/g, '')
      .replace(/calcula/g, '')
      .replace(/resuelve/g, '')
      .replace(/dime/g, '')
      .replace(/multiplicado por/g, '*')
      .replace(/por/g, '*')
      .replace(/veces/g, '*')
      .replace(/dividido entre|dividido por|entre/g, '/')
      .replace(/mas/g, '+')
      .replace(/menos/g, '-')
      .replace(/x/g, '*')
      .trim();

    const arithMatch = cleanExpr.match(/(-?\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(-?\d+(?:\.\d+)?)/);
    if (arithMatch) {
      const a = parseFloat(arithMatch[1]);
      const op = arithMatch[2];
      const b = parseFloat(arithMatch[3]);

      let res = 0;
      let opName = '';
      let latexOp = '';
      let hablaOp = '';

      if (op === '+') {
        res = a + b;
        opName = 'Suma Aritmética';
        latexOp = '+';
        hablaOp = 'más';
      } else if (op === '-') {
        res = a - b;
        opName = 'Resta Aritmética';
        latexOp = '-';
        hablaOp = 'menos';
      } else if (op === '*') {
        res = a * b;
        opName = 'Multiplicación';
        latexOp = '\\times';
        hablaOp = 'por';
      } else if (op === '/') {
        if (b === 0) {
          return {
            habla: 'La división entre cero es una indeterminación matemática y no está definida.',
            emocion: 'duda',
            pasos: [
              {
                titulo: 'Indeterminación Matemática',
                latex: `\\frac{${a}}{0} = \\text{Indefinido}`,
                explicacion: 'No es posible dividir ningún número real entre cero en el cuerpo de los números reales.'
              }
            ],
            resultado: { latex: '\\text{Indefinido}', texto: 'Error: división por cero' },
            visualizacion: { tipo: 'ninguna', vectores: [] }
          };
        }
        res = Math.round((a / b) * 1000) / 1000;
        opName = 'División';
        latexOp = '\\div';
        hablaOp = 'entre';
      }

      return {
        habla: `El número ${a} ${hablaOp} el número ${b}, da como resultado ${res}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: `Paso 1: Planteamiento de la ${opName}`,
            latex: `${a} ${latexOp} ${b}`,
            explicacion: `Identificamos los operandos: colocamos el primer término ${a} y el segundo término ${b}.`,
            locucion: `Paso uno. Planteamos la operación. Escribimos ${a}, signo ${hablaOp}, y el número ${b}.`
          },
          {
            titulo: 'Paso 2: Procedimiento y Resultado Final',
            latex: `${a} ${latexOp} ${b} = ${res}`,
            explicacion: `Efectuando la operación paso a paso obtenemos como resultado ${res}.`,
            locucion: `Paso dos. Colocamos signo de igual, y escribimos ${res}. El resultado es ${res}.`
          }
        ],
        resultado: {
          latex: `${a} ${latexOp} ${b} = ${res}`,
          texto: `El resultado de ${a} ${hablaOp} ${b} es ${res}.`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: [
          `Calcula ${res} por 2`,
          `Raíz cuadrada de ${res}`,
          'Suma los vectores (2, 3, 1) y (1, 4, -2)'
        ]
      };
    }

    return null;
  }

  /**
   * Resuelve operaciones vectoriales completas en R² y R³
   */
  solveVectors(norm, replaced, query = '') {
    // 1. Prioridad: Resolver con el motor analítico determinista si detecta vectores y operación
    try {
      const q = query || replaced || norm;
      const extracted = naturalVectorParser.extractVectors(q);
      const op = naturalVectorParser.detectOperation(q);
      if (extracted.length > 0 && op !== 'desconocida') {
        const sgRes = stepGenerator.verifyAndCorrect({}, q);
        if (sgRes && Array.isArray(sgRes.pasos) && sgRes.pasos.length > 0) {
          return sgRes;
        }
      }
    } catch (e) {
      // continuar con extracción secundaria
    }

    // Detectar si la consulta trata de vectores
    const isVectorQuery = norm.includes('vector') || norm.includes('vectores') ||
                          norm.includes('producto punto') || norm.includes('producto cruz') ||
                          norm.includes('producto escalar') || norm.includes('norma') ||
                          norm.includes('magnitud') || norm.includes('modulo');

    if (!isVectorQuery) return null;

    // Extraer tuplas de vectores como (1, 2, 3) o (4, -2)
    const tupleMatches = [...replaced.matchAll(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\)/g)];
    
    if (tupleMatches.length >= 2) {
      const v1 = [
        parseFloat(tupleMatches[0][1]),
        parseFloat(tupleMatches[0][2]),
        tupleMatches[0][3] !== undefined ? parseFloat(tupleMatches[0][3]) : 0
      ];
      const v2 = [
        parseFloat(tupleMatches[1][1]),
        parseFloat(tupleMatches[1][2]),
        tupleMatches[1][3] !== undefined ? parseFloat(tupleMatches[1][3]) : 0
      ];

      // 1. Producto Cruz (Vectorial)
      if (norm.includes('cruz') || norm.includes('vectorial')) {
        const cx = (v1[1] * v2[2]) - (v1[2] * v2[1]);
        const cy = (v1[2] * v2[0]) - (v1[0] * v2[2]);
        const cz = (v1[0] * v2[1]) - (v1[1] * v2[0]);

        return {
          habla: `El producto cruz de los vectores produce el vector ortogonal: (${cx}, ${cy}, ${cz}).`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Paso 1: Determinante Formal del Producto Cruz',
              latex: `\\vec{A} \\times \\vec{B} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ ${v1[0]} & ${v1[1]} & ${v1[2]} \\\\ ${v2[0]} & ${v2[1]} & ${v2[2]} \\end{vmatrix}`,
              explicacion: 'El producto cruz se define formalmente mediante el determinante de orden 3 con los vectores unitarios canónicos en la primera fila.',
              locucion: `Paso uno. Planteamos el determinante de orden tres. Colocamos los vectores canónicos i, j, k en la primera fila, y las componentes de los vectores A y B en las filas siguientes.`
            },
            {
              titulo: 'Paso 2: Desarrollo por Cofactores',
              latex: `\\hat{i}((${v1[1]})(${v2[2]}) - (${v1[2]})(${v2[1]})) - \\hat{j}((${v1[0]})(${v2[2]}) - (${v1[2]})(${v2[0]})) + \\hat{k}((${v1[0]})(${v2[1]}) - (${v1[1]})(${v2[0]}))`,
              explicacion: 'Desarrollamos por menores complementarios con sus signos alternados (+, -, +).',
              locucion: `Paso dos. Desarrollamos por cofactores multiplicando las diagonales y alternando los signos más y menos.`
            },
            {
              titulo: 'Paso 3: Vector Perpendicular Resultante',
              latex: `\\vec{A} \\times \\vec{B} = \\langle ${cx}, ${cy}, ${cz} \\rangle`,
              explicacion: `El vector resultante es perpendicular simultáneamente a ambos vectores según la regla de la mano derecha.`,
              locucion: `Paso tres. Calculamos el vector perpendicular resultante. Escribimos signo de igual, ${cx}, coma, ${cy}, coma, ${cz}.`
            }
          ],
          resultado: {
            latex: `\\vec{A} \\times \\vec{B} = \\langle ${cx}, ${cy}, ${cz} \\rangle`,
            texto: `El vector resultante del producto cruz es (${cx}, ${cy}, ${cz}).`
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#38bdf8' },
              { nombre: 'B', componentes: v2, color: '#f59e0b' },
              { nombre: 'AÃ—B', componentes: [cx, cy, cz], color: '#ef4444' }
            ]
          }
        };
      }

      // 2. Producto Punto (Escalar)
      if (norm.includes('punto') || norm.includes('escalar') || norm.includes('dot')) {
        const dot = (v1[0] * v2[0]) + (v1[1] * v2[1]) + (v1[2] * v2[2]);
        const areOrthogonal = dot === 0;

        return {
          habla: `El producto escalar o producto punto es ${dot}.${areOrthogonal ? ' Dado que es cero, los vectores son ortogonales.' : ''}`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Paso 1: Fórmula del Producto Escalar',
              latex: `\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y + A_z B_z`,
              explicacion: 'El producto punto es la suma algebraica del producto de las componentes correspondientes.',
              locucion: `Paso uno. Planteamos la fórmula del producto punto. Multiplicamos cada componente: equis con equis, ye con ye, y zeta con zeta.`
            },
            {
              titulo: 'Paso 2: Sustitución de Componentes',
              latex: `(${v1[0]})(${v2[0]}) + (${v1[1]})(${v2[1]}) + (${v1[2]})(${v2[2]})`,
              explicacion: `Multiplicamos componente x con x (${v1[0]*v2[0]}), y con y (${v1[1]*v2[1]}) y z con z (${v1[2]*v2[2]}).`,
              locucion: `Paso dos. Sustituimos los valores numéricos: ${v1[0]} por ${v2[0]}, más ${v1[1]} por ${v2[1]}, más ${v1[2]} por ${v2[2]}.`
            },
            {
              titulo: 'Paso 3: Resultado Escalar',
              latex: `\\vec{A} \\cdot \\vec{B} = ${dot}`,
              explicacion: `La suma total de los productos es el número escalar ${dot}.`,
              locucion: `Paso tres. Sumamos los productos parciales. Escribimos signo de igual, ${dot}. El resultado escalar es ${dot}.`
            }
          ],
          resultado: {
            latex: `\\vec{A} \\cdot \\vec{B} = ${dot}`,
            texto: `El producto escalar es ${dot}.`
          },
          visualizacion: {
            tipo: 'producto_punto',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#38bdf8' },
              { nombre: 'B', componentes: v2, color: '#f59e0b' }
            ]
          }
        };
      }

      // 3. Suma de Vectores
      if (norm.includes('suma') || norm.includes('mas') || norm.includes('+')) {
        const rx = v1[0] + v2[0];
        const ry = v1[1] + v2[1];
        const rz = v1[2] + v2[2];

        return {
          habla: `La suma de los vectores es el vector resultante: (${rx}, ${ry}, ${rz}).`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Paso 1: Planteamiento de los Vectores',
              latex: `\\vec{A} = \\langle ${v1[0]}, \\, ${v1[1]}, \\, ${v1[2]} \\rangle, \\quad \\vec{B} = \\langle ${v2[0]}, \\, ${v2[1]}, \\, ${v2[2]} \\rangle`,
              explicacion: 'Identificamos las componentes en la base estándar tridimensional.',
              locucion: `Paso uno. Planteamos los vectores en el espacio tridimensional. Escribimos vector A, signo de igual, ${v1[0]}, coma, ${v1[1]}, coma, ${v1[2]}. Y vector B, signo de igual, ${v2[0]}, coma, ${v2[1]}, coma, ${v2[2]}.`
            },
            {
              titulo: 'Paso 2: Suma Componente a Componente',
              latex: `\\vec{R} = \\langle ${v1[0]} + (${v2[0]}), \\; ${v1[1]} + (${v2[1]}), \\; ${v1[2]} + (${v2[2]}) \\rangle`,
              explicacion: 'Sumamos las componentes cartesianas independientes una a una: X con X, Y con Y, Z con Z.',
              locucion: `Paso dos. Realizamos la suma componente a componente. Escribimos vector R, signo de igual. Sumamos ${v1[0]} más ${v2[0]} en equis, ${v1[1]} más ${v2[1]} en ye, y ${v1[2]} más ${v2[2]} en zeta.`
            },
            {
              titulo: 'Paso 3: Vector Resultante Final',
              latex: `\\vec{R} = \\langle ${rx}, \\, ${ry}, \\, ${rz} \\rangle`,
              explicacion: `El vector suma resultante se ubica en (${rx}, ${ry}, ${rz}).`,
              locucion: `Paso tres. Obtenemos el vector resultante. Escribimos vector R, signo de igual, ${rx}, coma, ${ry}, coma, ${rz}. El cálculo ha concluido con éxito.`
            }
          ],
          resultado: {
            latex: `\\vec{R} = \\langle ${rx}, \\, ${ry}, \\, ${rz} \\rangle`,
            texto: `El vector suma es (${rx}, ${ry}, ${rz}).`
          },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#38bdf8' },
              { nombre: 'B', componentes: v2, color: '#f59e0b' },
              { nombre: 'R', componentes: [rx, ry, rz], color: '#22c55e' }
            ]
          }
        };
      }

      // 4. Resta de Vectores
      if (norm.includes('resta') || norm.includes('menos') || norm.includes('-')) {
        const rx = v1[0] - v2[0];
        const ry = v1[1] - v2[1];
        const rz = v1[2] - v2[2];

        return {
          habla: `La resta de los vectores produce: (${rx}, ${ry}, ${rz}).`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Resta de Vectores',
              latex: `\\vec{D} = \\vec{A} - \\vec{B} = \\langle A_x - B_x, \\; A_y - B_y, \\; A_z - B_z \\rangle`,
              explicacion: 'Restamos las componentes del segundo vector a las componentes del primero.'
            },
            {
              titulo: 'Vector Diferencia',
              latex: `\\vec{D} = \\langle ${rx}, ${ry}, ${rz} \\rangle`,
              explicacion: `El vector diferencia resultante es (${rx}, ${ry}, ${rz}).`
            }
          ],
          resultado: {
            latex: `\\vec{D} = \\langle ${rx}, ${ry}, ${rz} \\rangle`,
            texto: `Vector diferencia: (${rx}, ${ry}, ${rz}).`
          },
          visualizacion: {
            tipo: 'resta',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#38bdf8' },
              { nombre: 'B', componentes: v2, color: '#f59e0b' },
              { nombre: 'D', componentes: [rx, ry, rz], color: '#f43f5e' }
            ]
          }
        };
      }
    }

    // 5. Magnitud / Norma de un solo vector: ej. norma de (3, 4)
    if (tupleMatches.length === 1 && (norm.includes('norma') || norm.includes('magnitud') || norm.includes('modulo') || norm.includes('longitud'))) {
      const v = [
        parseFloat(tupleMatches[0][1]),
        parseFloat(tupleMatches[0][2]),
        tupleMatches[0][3] !== undefined ? parseFloat(tupleMatches[0][3]) : 0
      ];
      const sumSq = (v[0] * v[0]) + (v[1] * v[1]) + (v[2] * v[2]);
      const mag = Math.round(Math.sqrt(sumSq) * 1000) / 1000;

      return {
        habla: `La magnitud o norma del vector es ${mag}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Fórmula de la Norma Euclidiana',
            latex: `\\|\\vec{v}\\| = \\sqrt{x^2 + y^2 + z^2}`,
            explicacion: 'Por el Teorema de Pitágoras generalizado, la longitud es la raíz cuadrada de la suma de los cuadrados de sus componentes.'
          },
          {
            titulo: 'Sustitución y Cuadrados',
            latex: `\\|\\vec{v}\\| = \\sqrt{(${v[0]})^2 + (${v[1]})^2 + (${v[2]})^2} = \\sqrt{${sumSq}}`,
            explicacion: `Sumando los cuadrados de las componentes obtenemos ${sumSq}.`
          },
          {
            titulo: 'Magnitud Final',
            latex: `\\|\\vec{v}\\| = ${mag}`,
            explicacion: `La longitud geométrica del vector en el espacio es ${mag}.`
          }
        ],
        resultado: {
          latex: `\\|\\vec{v}\\| = ${mag}`,
          texto: `La magnitud del vector es ${mag}.`
        },
        visualizacion: {
          tipo: 'escalar',
          vectores: [{ nombre: 'v', componentes: v, color: '#38bdf8' }]
        }
      };
    }

    return null;
  }

  // ================================================================
  // ESTADÍSTICA COMPLETA
  // ================================================================
  solveStatistics(norm, replaced) {
    const isStats = /\b(?:media|promedio|mediana|moda|varianza|desviacion|estadistica)\b/i.test(norm);
    if (!isStats) return null;

    // Extraer lista de números
    const numList = [...replaced.matchAll(/(-?\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));
    if (numList.length < 2) return null;
    const n = numList.length;

    const mean = Math.round((numList.reduce((a, b) => a + b, 0) / n) * 1000) / 1000;
    const sorted = [...numList].sort((a, b) => a - b);
    const median = n % 2 === 0
      ? Math.round(((sorted[n / 2 - 1] + sorted[n / 2]) / 2) * 1000) / 1000
      : sorted[Math.floor(n / 2)];

    const freq = {};
    numList.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => parseFloat(v));
    const modeText = modes.join(', ');

    const variance = Math.round((numList.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n) * 1000) / 1000;
    const stdDev = Math.round(Math.sqrt(variance) * 1000) / 1000;

    if (/\bmediana\b/i.test(norm)) {
      return {
        habla: `La mediana del conjunto de datos es ${median}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Ordenar el Conjunto', latex: `\\{${sorted.join(', ')}\\}`, explicacion: `Ordenamos los ${n} valores de menor a mayor para localizar el valor central.`, locucion: `Paso uno. Ordenamos los datos de menor a mayor: ${sorted.join(', ')}.` },
          { titulo: 'Paso 2: Localizar el Valor Central', latex: `n = ${n} \\Rightarrow \\text{posición central}`, explicacion: n % 2 === 0 ? `Con ${n} datos (par), la mediana es el promedio de los dos valores centrales.` : `Con ${n} datos (impar), la mediana es el valor en la posición ${Math.floor(n/2)+1}.`, locucion: `Paso dos. Con ${n} datos, ${n % 2 === 0 ? 'promediamos los dos valores centrales' : 'tomamos el valor central directamente'}.` },
          { titulo: 'Paso 3: Mediana Final', latex: `\\text{Me} = ${median}`, explicacion: `La mediana del conjunto es ${median}. El cincuenta por ciento de los datos están por encima y el cincuenta por ciento por debajo.`, locucion: `Paso tres. La mediana es ${median}. La mitad de los datos están por encima y la mitad por debajo de este valor.` }
        ],
        resultado: { latex: `\\text{Mediana} = ${median}`, texto: `Mediana = ${median}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (/\bmoda\b/i.test(norm)) {
      return {
        habla: `La moda del conjunto de datos es ${modeText}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Tabla de Frecuencias', latex: `\\text{Datos: } \\{${numList.join(', ')}\\}`, explicacion: 'Contamos cuántas veces aparece cada valor en el conjunto.', locucion: `Paso uno. Contamos la frecuencia de cada dato en el conjunto.` },
          { titulo: 'Paso 2: Frecuencia Máxima', latex: `f_{\\max} = ${maxFreq}`, explicacion: `El valor o valores que aparecen ${maxFreq} veces son la moda.`, locucion: `Paso dos. La frecuencia máxima es ${maxFreq} repeticiones.` },
          { titulo: 'Paso 3: Moda del Conjunto', latex: `\\text{Mo} = ${modeText}`, explicacion: `La moda es ${modeText}, que es el valor más frecuente del conjunto.`, locucion: `Paso tres. La moda es ${modeText}.` }
        ],
        resultado: { latex: `\\text{Moda} = ${modeText}`, texto: `Moda = ${modeText}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (/\bvarianza\b/i.test(norm)) {
      return {
        habla: `La varianza del conjunto de datos es ${variance}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Calcular la Media', latex: `\\bar{x} = \\frac{${numList.join('+')}}{${n}} = ${mean}`, explicacion: `La media aritmética del conjunto es ${mean}.`, locucion: `Paso uno. Calculamos la media. Sumamos todos los datos y dividimos entre ${n}, obteniendo ${mean}.` },
          { titulo: 'Paso 2: Desviaciones al Cuadrado', latex: `\\sum(x_i - \\bar{x})^2`, explicacion: `Calculamos la diferencia de cada dato respecto a la media, elevamos al cuadrado y sumamos.`, locucion: `Paso dos. Para cada dato, calculamos su diferencia con la media y la elevamos al cuadrado.` },
          { titulo: 'Paso 3: Varianza Final', latex: `\\sigma^2 = \\frac{\\sum(x_i-\\bar{x})^2}{n} = ${variance}`, explicacion: `La varianza mide la dispersión promedio de los datos respecto a su media. Es ${variance}.`, locucion: `Paso tres. Dividimos la suma de cuadrados entre ${n} datos. La varianza es ${variance}.` }
        ],
        resultado: { latex: `\\sigma^2 = ${variance}`, texto: `Varianza = ${variance}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('desviacion')) {
      return {
        habla: `La desviación estándar del conjunto es ${stdDev}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Media del Conjunto', latex: `\\bar{x} = ${mean}`, explicacion: `Primero calculamos la media: ${mean}.`, locucion: `Paso uno. La media del conjunto es ${mean}.` },
          { titulo: 'Paso 2: Varianza', latex: `\\sigma^2 = ${variance}`, explicacion: `Calculamos la varianza como el promedio de las desviaciones al cuadrado.`, locucion: `Paso dos. La varianza es ${variance}.` },
          { titulo: 'Paso 3: Desviación Estándar', latex: `\\sigma = \\sqrt{${variance}} = ${stdDev}`, explicacion: `La desviación estándar es la raíz cuadrada de la varianza: ${stdDev}.`, locucion: `Paso tres. La desviación estándar es la raíz cuadrada de la varianza. El resultado es ${stdDev}.` }
        ],
        resultado: { latex: `\\sigma = ${stdDev}`, texto: `Desviación estándar = ${stdDev}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Media por defecto
    return {
      habla: `La media o promedio del conjunto de datos es ${mean}.`,
      emocion: 'feliz',
      pasos: [
        { titulo: 'Paso 1: Suma de Todos los Datos', latex: `S = ${numList.join(' + ')} = ${numList.reduce((a,b)=>a+b,0)}`, explicacion: `Sumamos los ${n} valores del conjunto.`, locucion: `Paso uno. Sumamos todos los datos del conjunto. El total es ${numList.reduce((a,b)=>a+b,0)}.` },
        { titulo: 'Paso 2: División entre el Total de Datos', latex: `\\bar{x} = \\frac{${numList.reduce((a,b)=>a+b,0)}}{${n}}`, explicacion: `Dividimos la suma total entre la cantidad de datos, que es ${n}.`, locucion: `Paso dos. Dividimos la suma entre ${n}, que es el número de datos.` },
        { titulo: 'Paso 3: Media Aritmética', latex: `\\bar{x} = ${mean}`, explicacion: `La media aritmética del conjunto es ${mean}. También se conoce como promedio.`, locucion: `Paso tres. La media aritmética es ${mean}.` }
      ],
      resultado: { latex: `\\bar{x} = ${mean}`, texto: `Media = ${mean}` },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: [`Calcular la mediana`, `Calcular la varianza`, `Calcular la desviación estándar`]
    };
  }

  // ================================================================
  // PROBABILIDAD Y COMBINATORIA
  // ================================================================
  solveProbability(norm, replaced) {
    const isProb = norm.includes('combinacion') || norm.includes('permutacion') ||
      norm.includes('probabilidad') || norm.includes('combinatoria');
    if (!isProb) return null;

    const factorial = (n) => { if (n <= 1) return 1; let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };

    // Combinaciones C(n,r)
    const combMatch = replaced.match(/c\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)|combinaciones?\s+de\s+(\d+)\s+en\s+(\d+)|combinaciones?\s+(\d+)\s+(\d+)/i);
    if (combMatch || (norm.includes('combinacion') && !norm.includes('permutacion'))) {
      const nums = [...replaced.matchAll(/(\d+)/g)].map(m => parseInt(m[1]));
      if (nums.length >= 2) {
        const n = Math.max(nums[0], nums[1]);
        const r = Math.min(nums[0], nums[1]);
        const fn = factorial(n), fr = factorial(r), fnr = factorial(n - r);
        const res = Math.round(fn / (fr * fnr));
        return {
          habla: `Las combinaciones de ${n} en ${r} son ${res}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Fórmula de Combinaciones', latex: `C(n, r) = \\frac{n!}{r!(n-r)!}`, explicacion: `La combinación mide cuántas formas hay de elegir r elementos de un conjunto de n sin importar el orden.`, locucion: `Paso uno. La fórmula de combinaciones es n factorial dividido entre r factorial por n menos r factorial.` },
            { titulo: 'Paso 2: Sustitución de Valores', latex: `C(${n}, ${r}) = \\frac{${n}!}{${r}! \\cdot ${n-r}!} = \\frac{${fn}}{${fr} \\cdot ${fnr}}`, explicacion: `Sustituimos n igual a ${n} y r igual a ${r} en la fórmula.`, locucion: `Paso dos. Sustituimos. En el numerador, ${n} factorial es ${fn}. En el denominador, ${r} factorial por ${n-r} factorial.` },
            { titulo: 'Paso 3: Resultado Final', latex: `C(${n}, ${r}) = ${res}`, explicacion: `Existen ${res} formas distintas de elegir ${r} elementos de un conjunto de ${n} sin repetición.`, locucion: `Paso tres. El resultado es ${res}. Existen ${res} combinaciones posibles de ${n} elementos tomados de ${r} en ${r}.` }
          ],
          resultado: { latex: `C(${n}, ${r}) = ${res}`, texto: `C(${n},${r}) = ${res}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // Permutaciones P(n,r)
    if (norm.includes('permutacion')) {
      const nums = [...replaced.matchAll(/(\d+)/g)].map(m => parseInt(m[1]));
      if (nums.length >= 2) {
        const n = Math.max(nums[0], nums[1]);
        const r = Math.min(nums[0], nums[1]);
        const fn = factorial(n), fnr = factorial(n - r);
        const res = Math.round(fn / fnr);
        return {
          habla: `Las permutaciones de ${n} en ${r} son ${res}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Fórmula de Permutaciones', latex: `P(n, r) = \\frac{n!}{(n-r)!}`, explicacion: `La permutación cuenta los arreglos ordenados de r elementos tomados de n. A diferencia de la combinación, el orden importa.`, locucion: `Paso uno. La fórmula de permutaciones es n factorial dividido entre n menos r, factorial.` },
            { titulo: 'Paso 2: Sustitución', latex: `P(${n}, ${r}) = \\frac{${n}!}{${n-r}!} = \\frac{${fn}}{${fnr}}`, explicacion: `Con n igual a ${n} y r igual a ${r}.`, locucion: `Paso dos. Sustituimos. ${n} factorial es ${fn}. Dividimos entre ${fnr}.` },
            { titulo: 'Paso 3: Total de Permutaciones', latex: `P(${n}, ${r}) = ${res}`, explicacion: `Hay ${res} arreglos ordenados posibles de ${r} elementos de un conjunto de ${n}.`, locucion: `Paso tres. El resultado es ${res} permutaciones posibles.` }
          ],
          resultado: { latex: `P(${n}, ${r}) = ${res}`, texto: `P(${n},${r}) = ${res}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    return null;
  }

  // ================================================================
  // MATRICES: DETERMINANTE, TRANSPUESTA, MULTIPLICACIÓN
  // ================================================================
  solveMatrices(norm, replaced) {
    const isMatrix = norm.includes('determinante') || norm.includes('det') ||
      norm.includes('transpuesta') || norm.includes('matriz') || norm.includes('matrices');
    if (!isMatrix) return null;

    // Extraer todos los números de la consulta
    const nums = [...replaced.matchAll(/(-?\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));

    // Determinante 2x2: [[a, b], [c, d]] →’ ad - bc
    if ((norm.includes('determinante') || norm.includes('det')) && nums.length >= 4) {
      // Intentar 3x3 primero
      if (nums.length >= 9) {
        const [a,b,c,d,e,f,g,h,i] = nums.slice(0, 9);
        const det = a*(e*i - f*h) - b*(d*i - f*g) + c*(d*h - e*g);
        return {
          habla: `El determinante de la matriz de tres por tres es ${det}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Regla de Sarrus', latex: `\\begin{vmatrix} ${a} & ${b} & ${c} \\\\ ${d} & ${e} & ${f} \\\\ ${g} & ${h} & ${i} \\end{vmatrix}`, explicacion: 'Usamos la Regla de Sarrus: sumamos las diagonales principales y restamos las diagonales secundarias.', locucion: `Paso uno. Planteamos la matriz de tres por tres y aplicamos la regla de Sarrus.` },
            { titulo: 'Paso 2: Expansión por la Primera Fila', latex: `${a}(${e}\\cdot${i} - ${f}\\cdot${h}) - ${b}(${d}\\cdot${i} - ${f}\\cdot${g}) + ${c}(${d}\\cdot${h} - ${e}\\cdot${g})`, explicacion: `Calculamos los menores complementarios del elemento a${a}, b${b} y c${c}.`, locucion: `Paso dos. Expandimos por la primera fila. Multiplicamos el primer elemento por su menor complementario, restamos el segundo por el suyo, y sumamos el tercero.` },
            { titulo: 'Paso 3: Determinante Final', latex: `\\det(A) = ${det}`, explicacion: `El determinante de la matriz es ${det}. ${Math.abs(det) < 0.001 ? 'Al ser cero, la matriz es singular y no tiene inversa.' : 'Al ser distinto de cero, la matriz es invertible.'}`, locucion: `Paso tres. El determinante es ${det}.` }
          ],
          resultado: { latex: `\\det(A) = ${det}`, texto: `det(A) = ${det}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }

      // 2x2
      const [a, b, c, d] = nums.slice(0, 4);
      const det = a * d - b * c;
      return {
        habla: `El determinante de la matriz de dos por dos es ${det}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Matriz 2Ã—2 y Fórmula', latex: `\\begin{vmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{vmatrix} = ad - bc`, explicacion: `El determinante de una matriz 2Ã—2 es la diferencia entre el producto de la diagonal principal y la diagonal secundaria.`, locucion: `Paso uno. Para una matriz dos por dos, el determinante es a por d, menos b por c.` },
          { titulo: 'Paso 2: Sustitución', latex: `(${a})(${d}) - (${b})(${c}) = ${a*d} - ${b*c}`, explicacion: `Multiplicamos: ${a}Ã—${d} = ${a*d} y ${b}Ã—${c} = ${b*c}.`, locucion: `Paso dos. Calculamos. ${a} por ${d} es ${a*d}. Menos ${b} por ${c} que es ${b*c}.` },
          { titulo: 'Paso 3: Determinante', latex: `\\det(A) = ${det}`, explicacion: `El determinante es ${det}.`, locucion: `Paso tres. El resultado es ${det}.` }
        ],
        resultado: { latex: `\\det(A) = ${det}`, texto: `det(A) = ${det}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Transpuesta 2x2
    if (norm.includes('transpuesta') && nums.length >= 4) {
      const [a, b, c, d] = nums.slice(0, 4);
      return {
        habla: `La transpuesta de la matriz intercambia filas por columnas.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Matriz Original', latex: `A = \\begin{pmatrix} ${a} & ${b} \\\\ ${c} & ${d} \\end{pmatrix}`, explicacion: `La matriz original tiene ${a} y ${b} en la primera fila, y ${c} y ${d} en la segunda.`, locucion: `Paso uno. La matriz original tiene las filas horizontales.` },
          { titulo: 'Paso 2: Proceso de Transposición', latex: `A^T = \\text{intercambiar filas} \\leftrightarrow \\text{columnas}`, explicacion: `Cada fila de A se convierte en columna de A transpuesta. El elemento en fila i columna j pasa a fila j columna i.`, locucion: `Paso dos. Intercambiamos filas por columnas. Cada fila se convierte en columna.` },
          { titulo: 'Paso 3: Matriz Transpuesta', latex: `A^T = \\begin{pmatrix} ${a} & ${c} \\\\ ${b} & ${d} \\end{pmatrix}`, explicacion: `La transpuesta tiene ${a} y ${c} en la primera fila (que era la primera columna), y ${b} y ${d} en la segunda.`, locucion: `Paso tres. La matriz transpuesta tiene en la primera fila: ${a} y ${c}. En la segunda fila: ${b} y ${d}.` }
        ],
        resultado: { latex: `A^T = \\begin{pmatrix} ${a} & ${c} \\\\ ${b} & ${d} \\end{pmatrix}`, texto: `Transpuesta completada.` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  // ================================================================
  // CÁLCULO DIFERENCIAL E INTEGRAL
  // ================================================================
  solveCalculus(norm, replaced) {
    const isCalc = norm.includes('derivada') || norm.includes('integral') ||
      norm.includes('limite') || norm.includes('diferencial') || norm.includes('tasa de cambio');
    if (!isCalc) return null;

    // Derivada de x^n
    const powDerivMatch = replaced.match(/derivada\s+(?:de\s+)?(?:f\(x\)\s*=\s*)?x\^?(\d+(?:\.\d+)?)/i);
    const xSqDerivMatch = norm.includes('derivada') && (norm.includes('cuadrado') || norm.includes('x al 2') || norm.includes('x^2'));
    const xCubDerivMatch = norm.includes('derivada') && (norm.includes('cubo') || norm.includes('x al 3') || norm.includes('x^3'));

    if (powDerivMatch || xSqDerivMatch || xCubDerivMatch) {
      let exp = 2;
      if (powDerivMatch) exp = parseFloat(powDerivMatch[1]);
      else if (xCubDerivMatch) exp = 3;
      const coef = exp;
      const newExp = exp - 1;
      const result = newExp === 0 ? `${coef}` : newExp === 1 ? `${coef}x` : `${coef}x^{${newExp}}`;

      return {
        habla: `La derivada de x elevado a la ${exp} es ${coef} equis elevada a la ${newExp}.`,
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Paso 1: Regla de la Potencia', latex: `\\frac{d}{dx}[x^n] = n \\cdot x^{n-1}`, explicacion: `La regla de la potencia indica que la derivada de x elevado a n es n multiplicado por x elevado a n menos uno.`, locucion: `Paso uno. Aplicamos la regla de la potencia. La derivada de x elevado a n es n por x elevado a n menos uno.` },
          { titulo: 'Paso 2: Identificación del Exponente', latex: `f(x) = x^{${exp}}, \\quad n = ${exp}`, explicacion: `Identificamos que el exponente es ${exp}.`, locucion: `Paso dos. Identificamos el exponente. En este caso n es igual a ${exp}.` },
          { titulo: 'Paso 3: Derivada Calculada', latex: `f'(x) = ${exp} \\cdot x^{${exp}-1} = ${result}`, explicacion: `Bajamos el exponente ${exp} como coeficiente y reducimos el exponente en uno: ${exp}-1=${newExp}.`, locucion: `Paso tres. Bajamos el ${exp} como coeficiente, y reducimos el exponente a ${newExp}. La derivada es ${result}.` }
        ],
        resultado: { latex: `f'(x) = ${result}`, texto: `f'(x) = ${result}` },
        visualizacion: { tipo: 'ninguna', vectores: [] },
        sugerencias: [`Integral de x^${exp}`, `Derivada de x^${exp + 1}`, `¿Qué es la regla de la cadena?`]
      };
    }

    // Integral de x^n
    const intMatch = replaced.match(/integral\s+(?:de\s+)?x\^?(\d+(?:\.\d+)?)/i);
    const xSqIntMatch = norm.includes('integral') && (norm.includes('cuadrado') || norm.includes('x al 2'));
    if (intMatch || xSqIntMatch) {
      const exp = intMatch ? parseFloat(intMatch[1]) : 2;
      const newExp = exp + 1;
      const denom = newExp;
      return {
        habla: `La integral de x elevado a la ${exp} es x elevado a la ${newExp} dividido entre ${denom}, más la constante de integración C.`,
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Paso 1: Regla de la Potencia para Integrales', latex: `\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C`, explicacion: `Para integrar una potencia, aumentamos el exponente en 1 y dividimos entre el nuevo exponente.`, locucion: `Paso uno. La regla de integración de potencias dice: aumentar el exponente en uno y dividir entre el nuevo exponente.` },
          { titulo: 'Paso 2: Aplicación con n=' + exp, latex: `\\int x^{${exp}} \\, dx = \\frac{x^{${exp}+1}}{${exp}+1} + C`, explicacion: `Sumamos 1 al exponente ${exp} para obtener ${newExp}, y dividimos.`, locucion: `Paso dos. El exponente ${exp} se convierte en ${newExp}. Dividimos entre ${denom}.` },
          { titulo: 'Paso 3: Resultado de la Integral', latex: `\\int x^{${exp}} \\, dx = \\frac{x^{${newExp}}}{${denom}} + C`, explicacion: `La integral indefinida es x elevado a ${newExp} dividido entre ${denom}, más la constante C.`, locucion: `Paso tres. La integral es x elevado a ${newExp}, dividido entre ${denom}, más la constante C.` }
        ],
        resultado: { latex: `\\frac{x^{${newExp}}}{${denom}} + C`, texto: `âˆ«x^${exp}dx = x^${newExp}/${denom} + C` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  // ================================================================
  // GEOMETRÍA ANALÍTICA
  // ================================================================
  solveAnalyticGeometry(norm, replaced) {
    const isGeo = norm.includes('distancia entre') || norm.includes('punto medio') ||
      norm.includes('pendiente') || norm.includes('ecuacion de la recta') ||
      norm.includes('ecuacion del circulo') || norm.includes('area del triangulo');
    if (!isGeo) return null;

    // Distancia entre dos puntos (x1,y1) y (x2,y2)
    const pts = [...replaced.matchAll(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\)/g)];
    if (pts.length >= 2 && norm.includes('distancia')) {
      const x1 = parseFloat(pts[0][1]), y1 = parseFloat(pts[0][2]);
      const x2 = parseFloat(pts[1][1]), y2 = parseFloat(pts[1][2]);
      const dx = x2 - x1, dy = y2 - y1;
      const dist = Math.round(Math.sqrt(dx*dx + dy*dy) * 1000) / 1000;
      return {
        habla: `La distancia entre los dos puntos es ${dist}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Fórmula de la Distancia Euclidiana', latex: `d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}`, explicacion: `Se deriva del Teorema de Pitágoras extendido al plano cartesiano.`, locucion: `Paso uno. La fórmula de distancia entre dos puntos es raíz cuadrada de x dos menos x uno al cuadrado, más y dos menos y uno al cuadrado.` },
          { titulo: 'Paso 2: Sustitución de Coordenadas', latex: `d = \\sqrt{(${x2}-${x1})^2 + (${y2}-${y1})^2} = \\sqrt{${dx}^2 + ${dy}^2} = \\sqrt{${dx*dx+dy*dy}}`, explicacion: `Sustituimos las coordenadas: Î”x=${dx}, Î”y=${dy}.`, locucion: `Paso dos. Sustituimos. La diferencia en x es ${dx} y en y es ${dy}. Calculamos los cuadrados y sumamos.` },
          { titulo: 'Paso 3: Distancia Final', latex: `d = ${dist}`, explicacion: `La distancia entre los puntos (${x1},${y1}) y (${x2},${y2}) es ${dist} unidades.`, locucion: `Paso tres. La distancia es ${dist} unidades.` }
        ],
        resultado: { latex: `d = ${dist}`, texto: `Distancia = ${dist}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Punto medio
    if (pts.length >= 2 && norm.includes('punto medio')) {
      const x1 = parseFloat(pts[0][1]), y1 = parseFloat(pts[0][2]);
      const x2 = parseFloat(pts[1][1]), y2 = parseFloat(pts[1][2]);
      const mx = (x1+x2)/2, my = (y1+y2)/2;
      return {
        habla: `El punto medio entre los dos puntos es el punto ${mx}, coma, ${my}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Fórmula del Punto Medio', latex: `M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)`, explicacion: `El punto medio se obtiene promediando las coordenadas correspondientes.`, locucion: `Paso uno. El punto medio se calcula promediando las coordenadas x e y de los dos puntos.` },
          { titulo: 'Paso 2: Sustitución', latex: `M = \\left(\\frac{${x1}+${x2}}{2}, \\frac{${y1}+${y2}}{2}\\right)`, explicacion: `Sumamos las coordenadas correspondientes y dividimos entre dos.`, locucion: `Paso dos. Sumamos ${x1} más ${x2} y dividimos entre dos. Luego ${y1} más ${y2} y dividimos entre dos.` },
          { titulo: 'Paso 3: Punto Medio', latex: `M = (${mx}, ${my})`, explicacion: `El punto medio es (${mx}, ${my}).`, locucion: `Paso tres. El punto medio es ${mx} coma ${my}.` }
        ],
        resultado: { latex: `M = (${mx}, ${my})`, texto: `Punto medio = (${mx}, ${my})` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Pendiente entre dos puntos
    if (pts.length >= 2 && norm.includes('pendiente')) {
      const x1 = parseFloat(pts[0][1]), y1 = parseFloat(pts[0][2]);
      const x2 = parseFloat(pts[1][1]), y2 = parseFloat(pts[1][2]);
      if (x2 === x1) return {
        habla: `La recta es vertical y su pendiente es indefinida.`,
        emocion: 'duda',
        pasos: [{ titulo: 'Recta Vertical', latex: `m = \\frac{\\Delta y}{0} = \\text{Indefinida}`, explicacion: `Cuando la variación en x es cero, la pendiente no está definida.`, locucion: `La recta es vertical. La pendiente no está definida porque el denominador es cero.` }],
        resultado: { latex: `m = \\text{Indefinida}`, texto: 'Pendiente indefinida (recta vertical).' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
      const m = Math.round(((y2-y1)/(x2-x1)) * 1000) / 1000;
      return {
        habla: `La pendiente de la recta entre los dos puntos es ${m}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Fórmula de la Pendiente', latex: `m = \\frac{y_2 - y_1}{x_2 - x_1}`, explicacion: `La pendiente mide la inclinación de la recta: cuánto sube o baja por cada unidad horizontal.`, locucion: `Paso uno. La pendiente es la razón de cambio vertical sobre el cambio horizontal.` },
          { titulo: 'Paso 2: Sustitución', latex: `m = \\frac{${y2} - ${y1}}{${x2} - ${x1}} = \\frac{${y2-y1}}{${x2-x1}}`, explicacion: `Restamos coordenadas: Î”y=${y2-y1}, Î”x=${x2-x1}.`, locucion: `Paso dos. Calculamos la diferencia. En y: ${y2} menos ${y1} es ${y2-y1}. En x: ${x2} menos ${x1} es ${x2-x1}.` },
          { titulo: 'Paso 3: Pendiente de la Recta', latex: `m = ${m}`, explicacion: `La pendiente es ${m}. ${m > 0 ? 'La recta es creciente.' : m < 0 ? 'La recta es decreciente.' : 'La recta es horizontal.'}`, locucion: `Paso tres. La pendiente es ${m}.` }
        ],
        resultado: { latex: `m = ${m}`, texto: `Pendiente = ${m}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  // ================================================================
  // PROGRESIONES Y SERIES
  // ================================================================
  solveSequences(norm, replaced) {
    const isSeq = norm.includes('progresion') || norm.includes('sucesion') ||
      norm.includes('serie') || norm.includes('fibonacci') ||
      norm.includes('suma de los primeros') || norm.includes('numeros naturales');
    if (!isSeq) return null;

    // Fibonacci
    if (norm.includes('fibonacci')) {
      const nMatch = replaced.match(/(\d+)/);
      const n = nMatch ? Math.min(20, parseInt(nMatch[1])) : 10;
      const fib = [0, 1];
      for (let i = 2; i < n; i++) fib.push(fib[i-1] + fib[i-2]);
      const seq = fib.slice(0, n);
      return {
        habla: `Los primeros ${n} términos de la sucesión de Fibonacci son: ${seq.join(', ')}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Definición de Fibonacci', latex: `F_n = F_{n-1} + F_{n-2}, \\quad F_0=0, F_1=1`, explicacion: `Cada término es la suma de los dos anteriores. Inicia con 0 y 1.`, locucion: `Paso uno. La sucesión de Fibonacci define cada término como la suma de los dos anteriores, comenzando con cero y uno.` },
          { titulo: 'Paso 2: Generación de la Secuencia', latex: `0, 1, 1, 2, 3, 5, 8, 13, 21, 34, \\ldots`, explicacion: `Sumamos pares consecutivos para generar la serie.`, locucion: `Paso dos. Generamos la secuencia: cero, uno, uno, dos, tres, cinco, ocho, trece, veintiunoâ€¦` },
          { titulo: `Paso 3: Primeros ${n} Términos`, latex: seq.join(', '), explicacion: `Los primeros ${n} términos de la sucesión de Fibonacci son: ${seq.join(', ')}.`, locucion: `Paso tres. Los primeros ${n} términos son: ${seq.join(', ')}.` }
        ],
        resultado: { latex: seq.join(', '), texto: `Fibonacci(${n}): ${seq.join(', ')}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Suma de los primeros n naturales
    if (norm.includes('suma de los primeros') && norm.includes('natural')) {
      const nMatch = replaced.match(/(\d+)/);
      const n = nMatch ? parseInt(nMatch[1]) : 10;
      const sum = (n * (n + 1)) / 2;
      return {
        habla: `La suma de los primeros ${n} números naturales es ${sum}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Paso 1: Fórmula de Gauss', latex: `S_n = \\frac{n(n+1)}{2}`, explicacion: `Esta es la fórmula descubierta por Gauss para sumar rápidamente los primeros n números naturales.`, locucion: `Paso uno. Usamos la fórmula de Gauss: n por n más uno, dividido entre dos.` },
          { titulo: 'Paso 2: Sustitución', latex: `S_{${n}} = \\frac{${n}(${n}+1)}{2} = \\frac{${n*( n+1)}}{2}`, explicacion: `Sustituimos n igual a ${n}.`, locucion: `Paso dos. Sustituimos n igual a ${n}. Calculamos ${n} por ${n+1} que es ${n*(n+1)}, dividido entre dos.` },
          { titulo: 'Paso 3: Suma Final', latex: `S_{${n}} = ${sum}`, explicacion: `La suma de todos los números naturales desde 1 hasta ${n} es exactamente ${sum}.`, locucion: `Paso tres. La suma es ${sum}.` }
        ],
        resultado: { latex: `S_{${n}} = ${sum}`, texto: `Î£(1..${n}) = ${sum}` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // Progresión aritmética
    if (norm.includes('progresion aritmetica') || norm.includes('pa')) {
      const nums = [...replaced.matchAll(/(-?\d+(?:\.\d+)?)/g)].map(m => parseFloat(m[1]));
      if (nums.length >= 2) {
        const a1 = nums[0], d = nums.length >= 2 ? nums[1] - nums[0] : 1;
        const nTerms = nums.length >= 3 ? parseInt(nums[2]) : 10;
        const an = a1 + (nTerms - 1) * d;
        const sn = Math.round((nTerms / 2) * (a1 + an) * 1000) / 1000;
        const terms = Array.from({length: Math.min(5, nTerms)}, (_, i) => a1 + i * d);
        return {
          habla: `La progresión aritmética con primer término ${a1} y razón ${d} tiene una suma de ${sn} para ${nTerms} términos.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Término General', latex: `a_n = a_1 + (n-1)d = ${a1} + (n-1)(${d})`, explicacion: `El término n-ésimo es el primero más la razón multiplicada por n-1.`, locucion: `Paso uno. El término general es a uno más n menos uno por la razón d.` },
            { titulo: 'Paso 2: Término n-ésimo', latex: `a_{${nTerms}} = ${an}`, explicacion: `El término número ${nTerms} es ${an}.`, locucion: `Paso dos. El término número ${nTerms} es ${an}.` },
            { titulo: 'Paso 3: Suma de la Progresión', latex: `S_n = \\frac{n}{2}(a_1 + a_n) = \\frac{${nTerms}}{2}(${a1}+${an}) = ${sn}`, explicacion: `La suma de ${nTerms} términos es ${sn}.`, locucion: `Paso tres. La suma de los ${nTerms} términos es ${sn}.` }
          ],
          resultado: { latex: `S_{${nTerms}} = ${sn}`, texto: `Suma = ${sn}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    return null;
  }

  // ================================================================
  // TEORÍA DE NÚMEROS: PRIMOS, MCD, MCM, BINARIO, LOGARITMOS
  // ================================================================
  solveNumberTheory(norm, replaced) {
    const isNT = norm.includes('primo') || norm.includes('mcd') || norm.includes('mcm') ||
      norm.includes('maximo comun divisor') || norm.includes('minimo comun multiplo') ||
      norm.includes('binario') || norm.includes('hexadecimal') ||
      norm.includes('logaritmo') || norm.includes(' log ') || norm.includes('ln de') ||
      norm.includes('divisores de') || norm.includes('multiplos de');
    if (!isNT) return null;

    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

    // MCD
    if (norm.includes('mcd') || norm.includes('maximo comun divisor')) {
      const nums = [...replaced.matchAll(/(\d+)/g)].map(m => parseInt(m[1])).filter(n => n > 0);
      if (nums.length >= 2) {
        const [a, b] = nums;
        const steps = [];
        let x = a, y = b;
        while (y !== 0) { steps.push(`${x} = ${Math.floor(x/y)} \\cdot ${y} + ${x%y}`); [x, y] = [y, x % y]; }
        const result = x;
        return {
          habla: `El máximo común divisor de ${a} y ${b} es ${result}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Algoritmo de Euclides', latex: `\\text{MCD}(${a}, ${b}) \\text{ por Euclides}`, explicacion: `Dividimos sucesivamente: MCD(${a},${b}) = MCD(${b},${a%b}) = ... hasta el resto cero.`, locucion: `Paso uno. Aplicamos el algoritmo de Euclides. Dividimos el número mayor entre el menor y tomamos el resto.` },
            { titulo: 'Paso 2: Divisiones Sucesivas', latex: steps.slice(0,3).join(' \\\\ '), explicacion: `Continuamos dividiendo hasta obtener resto cero.`, locucion: `Paso dos. Realizamos las divisiones sucesivas hasta llegar a resto cero.` },
            { titulo: 'Paso 3: MCD Final', latex: `\\text{MCD}(${a}, ${b}) = ${result}`, explicacion: `El último divisor no nulo es el MCD. El máximo común divisor de ${a} y ${b} es ${result}.`, locucion: `Paso tres. El máximo común divisor de ${a} y ${b} es ${result}.` }
          ],
          resultado: { latex: `\\text{MCD}(${a}, ${b}) = ${result}`, texto: `MCD = ${result}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // MCM
    if (norm.includes('mcm') || norm.includes('minimo comun multiplo')) {
      const nums = [...replaced.matchAll(/(\d+)/g)].map(m => parseInt(m[1])).filter(n => n > 0);
      if (nums.length >= 2) {
        const [a, b] = nums;
        const g = gcd(a, b);
        const result = (a * b) / g;
        return {
          habla: `El mínimo común múltiplo de ${a} y ${b} es ${result}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Relación MCM y MCD', latex: `\\text{MCM}(a,b) = \\frac{a \\cdot b}{\\text{MCD}(a,b)}`, explicacion: `El MCM se obtiene dividiendo el producto de los dos números entre su MCD.`, locucion: `Paso uno. El mínimo común múltiplo es el producto de los números dividido entre su máximo común divisor.` },
            { titulo: 'Paso 2: MCD de los Números', latex: `\\text{MCD}(${a}, ${b}) = ${g}`, explicacion: `Usando el algoritmo de Euclides, el MCD de ${a} y ${b} es ${g}.`, locucion: `Paso dos. El máximo común divisor de ${a} y ${b} es ${g}.` },
            { titulo: 'Paso 3: MCM Final', latex: `\\text{MCM}(${a}, ${b}) = \\frac{${a} \\cdot ${b}}{${g}} = \\frac{${a*b}}{${g}} = ${result}`, explicacion: `El mínimo común múltiplo de ${a} y ${b} es ${result}.`, locucion: `Paso tres. Dividimos ${a*b} entre ${g}. El mínimo común múltiplo es ${result}.` }
          ],
          resultado: { latex: `\\text{MCM}(${a}, ${b}) = ${result}`, texto: `MCM = ${result}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // Número primo
    if (norm.includes('primo')) {
      const numMatch = replaced.match(/(\d+)/);
      if (numMatch) {
        const n = parseInt(numMatch[1]);
        const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false; return true; };
        const prime = isPrime(n);
        const divisors = [];
        for (let i = 2; i < n; i++) if (n % i === 0) divisors.push(i);
        return {
          habla: `El número ${n} ${prime ? 'sí es un número primo' : 'no es un número primo. Sus divisores son: ' + divisors.join(', ')}.`,
          emocion: prime ? 'feliz' : 'neutral',
          pasos: [
            { titulo: 'Paso 1: Definición de Número Primo', latex: `p \\in \\mathbb{P} \\iff p > 1 \\text{ y sus únicos divisores son } 1 \\text{ y } p`, explicacion: `Un número primo solo es divisible entre 1 y él mismo.`, locucion: `Paso uno. Un número primo es aquel mayor que uno que solo tiene como divisores al uno y a sí mismo.` },
            { titulo: `Paso 2: Prueba para ${n}`, latex: prime ? `${n} \\text{ no tiene divisores entre } 2 \\text{ y } \\lfloor\\sqrt{${n}}\\rfloor=${Math.floor(Math.sqrt(n))}` : `${n} = ${divisors[0]} \\times ${n / divisors[0]}`, explicacion: prime ? `Verificamos todos los divisores hasta âˆš${n}â‰ˆ${Math.round(Math.sqrt(n)*10)/10} y ninguno divide a ${n}.` : `${n} es divisible entre ${divisors[0]}, por tanto no es primo.`, locucion: `Paso dos. Verificamos ${prime ? `que ningún número hasta ${Math.floor(Math.sqrt(n))} divide a ${n}` : `que ${n} es divisible entre ${divisors[0]}`}.` },
            { titulo: 'Paso 3: Conclusión', latex: prime ? `${n} \\in \\mathbb{P}` : `${n} \\notin \\mathbb{P}`, explicacion: `${n} ${prime ? 'es primo.' : `no es primo. Sus factores son: 1, ${divisors.join(', ')}, ${n}.`}`, locucion: `Paso tres. ${n} ${prime ? 'es un número primo.' : 'no es un número primo.'}` }
          ],
          resultado: { latex: prime ? `${n} \\in \\mathbb{P}` : `${n} \\notin \\mathbb{P}`, texto: prime ? `${n} es primo` : `${n} no es primo` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // Convertir a binario
    if (norm.includes('binario')) {
      const numMatch = replaced.match(/(\d+)/);
      if (numMatch) {
        const n = parseInt(numMatch[1]);
        const binary = n.toString(2);
        const steps = [];
        let temp = n;
        while (temp > 0) { steps.push(`${temp} Ã· 2 = ${Math.floor(temp/2)}, resto ${temp % 2}`); temp = Math.floor(temp / 2); }
        return {
          habla: `El número ${n} en sistema binario es ${binary}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: División Sucesiva por 2', latex: `${n}_{10} \\rightarrow \\text{base } 2`, explicacion: `Para convertir a binario, dividimos repetidamente entre 2 y anotamos los restos de abajo hacia arriba.`, locucion: `Paso uno. Dividimos ${n} entre dos repetidamente y anotamos los restos.` },
            { titulo: 'Paso 2: Restos Binarios', latex: steps.slice(0, 5).map(s => `\\text{${s}}`).join(' \\\\ '), explicacion: `Cada división produce un dígito binario (0 o 1).`, locucion: `Paso dos. Registramos los restos de cada división.` },
            { titulo: 'Paso 3: Número en Binario', latex: `${n}_{10} = ${binary}_2`, explicacion: `Leyendo los restos de abajo hacia arriba obtenemos ${binary}.`, locucion: `Paso tres. El número ${n} en binario es ${binary}.` }
          ],
          resultado: { latex: `${n}_{10} = ${binary}_2`, texto: `${n} en binario = ${binary}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // Logaritmo
    if (norm.includes('logaritmo') || norm.includes(' log ') || norm.includes('ln de')) {
      const numMatch = replaced.match(/(\d+(?:\.\d+)?)/);
      if (numMatch) {
        const n = parseFloat(numMatch[1]);
        const isNatural = norm.includes('natural') || norm.includes('ln');
        const result = isNatural ? Math.round(Math.log(n) * 10000) / 10000 : Math.round(Math.log10(n) * 10000) / 10000;
        return {
          habla: `El logaritmo ${isNatural ? 'natural' : 'en base diez'} de ${n} es ${result}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: `Paso 1: ${isNatural ? 'Logaritmo Natural (ln)' : 'Logaritmo Base 10 (log)'}`, latex: isNatural ? `\\ln(x) = \\log_e(x), \\quad e \\approx 2.71828` : `\\log_{10}(x)`, explicacion: isNatural ? `El logaritmo natural usa como base el número de Euler e â‰ˆ 2.71828.` : `El logaritmo decimal usa base 10. Indica a qué potencia hay que elevar 10 para obtener x.`, locucion: `Paso uno. El logaritmo ${isNatural ? 'natural usa la base e' : 'en base diez indica la potencia de diez'}.` },
            { titulo: 'Paso 2: Evaluación', latex: isNatural ? `\\ln(${n}) = ?` : `\\log_{10}(${n}) = ?`, explicacion: `Calculamos el valor numérico del logaritmo de ${n}.`, locucion: `Paso dos. Evaluamos el logaritmo del número ${n}.` },
            { titulo: 'Paso 3: Resultado', latex: isNatural ? `\\ln(${n}) = ${result}` : `\\log_{10}(${n}) = ${result}`, explicacion: `El resultado es ${result}.`, locucion: `Paso tres. El logaritmo ${isNatural ? 'natural' : 'en base diez'} de ${n} es ${result}.` }
          ],
          resultado: { latex: isNatural ? `\\ln(${n}) = ${result}` : `\\log(${n}) = ${result}`, texto: `log(${n}) = ${result}` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    return null;
  }

  // ================================================================
  // VECTORES AVANZADOS: PROYECCIÓN, ÁNGULO, VECTOR UNITARIO
  // ================================================================
  solveAdvancedVectors(norm, replaced) {
    const isAdvVec = norm.includes('proyeccion') || norm.includes('angulo entre') ||
      norm.includes('vector unitario') || norm.includes('normalizar') ||
      norm.includes('vector paralelo') || norm.includes('escalar triple');
    if (!isAdvVec) return null;

    const tupleMatches = [...replaced.matchAll(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?  \)/g)];
    const pts = [...replaced.matchAll(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?  \)/g)];

    // Vector unitario / normalizar
    if (norm.includes('vector unitario') || norm.includes('normalizar')) {
      const vMatch = [...replaced.matchAll(/\((-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\)/g)];
      if (vMatch.length >= 1) {
        const v = [parseFloat(vMatch[0][1]), parseFloat(vMatch[0][2]), vMatch[0][3] ? parseFloat(vMatch[0][3]) : 0];
        const mag = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        const magR = Math.round(mag * 1000) / 1000;
        const u = v.map(c => Math.round((c / mag) * 1000) / 1000);
        return {
          habla: `El vector unitario en la dirección del vector dado tiene componentes ${u[0]}, coma, ${u[1]}, coma, ${u[2]}.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Paso 1: Calcular la Magnitud', latex: `\\|\\vec{v}\\| = \\sqrt{${v[0]}^2+${v[1]}^2+${v[2]}^2} = ${magR}`, explicacion: `La magnitud del vector es ${magR}.`, locucion: `Paso uno. Calculamos la magnitud del vector. El resultado es ${magR}.` },
            { titulo: 'Paso 2: Fórmula del Vector Unitario', latex: `\\hat{u} = \\frac{\\vec{v}}{\\|\\vec{v}\\|}`, explicacion: `Dividimos cada componente entre la magnitud para obtener el vector de longitud uno.`, locucion: `Paso dos. Dividimos cada componente del vector entre su magnitud.` },
            { titulo: 'Paso 3: Vector Unitario', latex: `\\hat{u} = \\langle ${u[0]}, ${u[1]}, ${u[2]} \\rangle`, explicacion: `El vector unitario tiene módulo exactamente uno y la misma dirección que el original.`, locucion: `Paso tres. El vector unitario resultante es ${u[0]} coma ${u[1]} coma ${u[2]}.` }
          ],
          resultado: { latex: `\\hat{u} = \\langle ${u[0]}, ${u[1]}, ${u[2]} \\rangle`, texto: `Ã» = (${u.join(', ')})` },
          visualizacion: { tipo: 'escalar', vectores: [{ nombre: 'v', componentes: v, color: '#38bdf8' }, { nombre: 'Ã»', componentes: u, color: '#22c55e' }] }
        };
      }
    }

    return null;
  }

  /**
   * Resuelve explicaciones teóricas con pedagogía de profesor universitario
   */
  solveConceptual(norm) {
    if (norm.includes('que es un vector') || norm.includes('definicion de vector')) {
      return {
        habla: 'Un vector es un ente matemático que posee tres propiedades fundamentales: magnitud, dirección y sentido.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Definición Geométrica de Vector',
            latex: `\\vec{v} = \\langle x, y, z \\rangle \\in \\mathbb{R}^3`,
            explicacion: 'A diferencia de un escalar que solo tiene tamaño (como la masa o temperatura), un vector indica hacia dónde apunta una magnitud física (como la velocidad o fuerza).'
          },
          {
            titulo: 'Propiedades Esenciales',
            latex: `\\text{1. Magnitud } (\\|\\vec{v}\\|), \\quad \\text{2. Dirección } (\\theta), \\quad \\text{3. Sentido}`,
            explicacion: 'La magnitud representa la longitud del segmento orientado; la dirección es la línea de acción; y la punta de flecha determina el sentido.'
          }
        ],
        resultado: {
          latex: `\\vec{v} = \\langle v_x, v_y, v_z \\rangle`,
          texto: 'Un vector es una cantidad orientada con magnitud, dirección y sentido.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es el producto cruz') || norm.includes('producto vectorial')) {
      return {
        habla: 'El producto cruz es una operación entre dos vectores en el espacio tridimensional que genera un nuevo vector perpendicular a ambos.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Significado Físico y Geométrico',
            latex: `\\vec{A} \\times \\vec{B} = (\\|\\vec{A}\\| \\|\\vec{B}\\| \\sin\\theta) \\, \\hat{n}`,
            explicacion: 'Su dirección es perpendicular al plano formado por ambos vectores y su magnitud equivale exactamente al área del paralelogramo que sustentan.'
          },
          {
            titulo: 'Regla de la Mano Derecha',
            latex: `\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})`,
            explicacion: 'Es una operación anticonmutativa: cambiar el orden de los factores invierte el sentido del vector resultante.'
          }
        ],
        resultado: {
          latex: `\\vec{A} \\times \\vec{B} \\perp \\vec{A}, \\quad \\vec{A} \\times \\vec{B} \\perp \\vec{B}`,
          texto: 'El producto cruz produce un vector ortogonal al plano de los dos vectores.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es el producto punto') || norm.includes('producto escalar') || norm.includes('definicion de producto punto')) {
      return {
        habla: 'Cátedra de Álgebra Lineal: El producto punto o producto escalar es una forma bilineal simétrica definida positiva que toma dos vectores y genera un número real o escalar. Mide la correlación direccional y la proyección métrica entre ambos vectores.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Definición Algebraica y Geométrica',
            latex: `\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y + A_z B_z = \\|\\vec{A}\\| \\|\\vec{B}\\| \\cos\\theta`,
            explicacion: 'Se calcula sumando los productos de las componentes homólogas o multiplicando las normas por el coseno del ángulo diedro que subtienden.'
          },
          {
            titulo: 'Criterio Fundamental de Ortogonalidad',
            latex: `\\vec{A} \\cdot \\vec{B} = 0 \\iff \\vec{A} \\perp \\vec{B} \\quad (\\theta = 90^\\circ)`,
            explicacion: 'Si el producto escalar es cero y ninguno de los vectores es nulo, los vectores son estrictamente perpendiculares (ortogonales).'
          }
        ],
        resultado: {
          latex: `\\vec{A} \\cdot \\vec{B} = \\sum_{i=1}^n A_i B_i = \\|\\vec{A}\\| \\|\\vec{B}\\| \\cos\\theta`,
          texto: 'El producto escalar mide la proyección métrica y detecta perpendicularidad cuando se anula.',
          explicacionHarvard: 'En el formalismo de espacios de Hilbert, el producto interno euclidiano induce la norma geométrica y define la noción de ortogonalidad indispensable en mecánica cuántica y procesamiento de señales.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('ortogonal') || norm.includes('perpendicular') || norm.includes('que significa ortogonal')) {
      return {
        habla: 'En el rigor del álgebra euclidiana, dos vectores son ortogonales si su ángulo diedro es exactamente de 90 grados o pi medios radianes. Esto ocurre matemática y físicamente cuando su producto interno se anula idénticamente.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Condición Necesaria y Suficiente de Ortogonalidad',
            latex: `\\vec{u} \\cdot \\vec{v} = 0 \\implies \\theta = \\frac{\\pi}{2} = 90^\\circ`,
            explicacion: 'Al ser cos(90°) = 0, la proyección de un vector sobre el otro es estrictamente nula.'
          },
          {
            titulo: 'Teorema de Pitágoras Vectorial',
            latex: `\\|\\vec{u} + \\vec{v}\\|^2 = \\|\\vec{u}\\|^2 + \\|\\vec{v}\\|^2`,
            explicacion: 'Dos vectores ortogonales satisfacen la generalización del teorema de Pitágoras en cualquier dimensión finita o infinita.'
          }
        ],
        resultado: {
          latex: `\\vec{u} \\perp \\vec{v} \\iff \\langle \\vec{u}, \\vec{v} \\rangle = 0`,
          texto: 'Ortogonalidad: perpendicularidad exacta en ángulo de 90° con producto interno nulo.',
          explicacionHarvard: 'Las bases ortogonales constituyen la piedra angular del análisis de Fourier, la descomposición en valores singulares (SVD) y las funciones de onda ortogonales en física cuántica.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('vector unitario') || norm.includes('normalizar un vector') || norm.includes('versor')) {
      return {
        habla: 'Un vector unitario o versor es aquel cuya norma euclidiana es exactamente igual a la unidad uno. Se obtiene dividiendo cualquier vector no nulo entre su propia magnitud o módulo.',
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Fórmula de Normalización',
            latex: `\\hat{u} = \\frac{\\vec{v}}{\\|\\vec{v}\\|} = \\left\\langle \\frac{v_x}{\\|\\vec{v}\\|}, \\frac{v_y}{\\|\\vec{v}\\|}, \\frac{v_z}{\\|\\vec{v}\\|} \\right\\rangle`,
            explicacion: 'Al dividir entre el escalar módulo, se conserva la recta de acción espacial intacta pero se fija su longitud en 1.'
          },
          {
            titulo: 'Propiedad Invariante de la Norma',
            latex: `\\|\\hat{u}\\| = \\sqrt{u_x^2 + u_y^2 + u_z^2} = 1`,
            explicacion: 'Sus componentes corresponden directamente a los cosenos directores con respecto a los ejes de coordenadas.'
          }
        ],
        resultado: {
          latex: `\\hat{u} = \\frac{\\vec{v}}{\\|\\vec{v}\\|}, \\quad \\|\\hat{u}\\| = 1`,
          texto: 'El vector unitario define la dirección pura y orientada en el espacio euclidiano.',
          explicacionHarvard: 'Los versores canónicos i, j, k forman la base ortonormal estándar del espacio tridimensional R³, sobre la cual se proyecta todo tensor o campo vectorial en física.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('regla de la mano derecha') || norm.includes('mano derecha')) {
      return {
        habla: 'La regla de la mano derecha es la convención matemática y física universal que define el sentido del vector resultante en el producto cruz. Apuntando los cuatro dedos en la dirección del primer vector y cerrándolos hacia el segundo, el pulgar extendido indica el sentido exacto del producto vectorial.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Orientación del Triedro en R³',
            latex: `\\hat{i} \\times \\hat{j} = \\hat{k}, \\quad \\hat{j} \\times \\hat{k} = \\hat{i}, \\quad \\hat{k} \\times \\hat{i} = \\hat{j}`,
            explicacion: 'Define el sistema dextrógiro o sistema de coordenadas de mano derecha.'
          },
          {
            titulo: 'Anticonmutatividad Fundamental',
            latex: `\\vec{A} \\times \\vec{B} = -(\\vec{B} \\times \\vec{A})`,
            explicacion: 'Invertir el orden de los vectores invierte el sentido físico del pulgar hacia el hemisferio opuesto.'
          }
        ],
        resultado: {
          latex: `\\vec{C} = \\vec{A} \\times \\vec{B} \\quad (\\text{Triedro Dextrógiro})`,
          texto: 'Regla de la mano derecha: fija la orientación del vector perpendicular en el espacio tridimensional.',
          explicacionHarvard: 'Esta regla rige fenómenos electromagnéticos cruciales como la fuerza de Lorentz (F = q v × B), el torque o momento de fuerza (τ = r × F) y el vector de Poynting en la radiación de ondas.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('para que sirven los vectores') || norm.includes('aplicacion de los vectores') || norm.includes('vectores en la fisica')) {
      return {
        habla: 'Cátedra de Física y Matemáticas Harvard: Los vectores son el lenguaje matemático indispensable para describir el universo físico. Cualquier magnitud que dependa de una orientación en el espacio (como la fuerza gravitatoria, el campo electromagnético, la velocidad orbital, la aceleración y los motores de física en videojuegos 3D) requiere cálculo vectorial.',
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Leyes Fundamentales de Newton',
            latex: `\\sum \\vec{F} = m\\vec{a}, \\quad \\vec{p} = m\\vec{v}`,
            explicacion: 'La segunda ley de Newton y el momento lineal son ecuaciones estrictamente vectoriales.'
          },
          {
            titulo: 'Electromagnetismo y Cinemática 3D',
            latex: `\\vec{F}_L = q(\\vec{E} + \\vec{v} \\times \\vec{B}), \\quad \\vec{\\tau} = \\vec{r} \\times \\vec{F}`,
            explicacion: 'La fuerza de Lorentz, el torque angular y las ecuaciones de Maxwell dependen intrínsecamente de vectores y operadores diferenciales.'
          }
        ],
        resultado: {
          latex: `\\vec{F} = m\\vec{a}, \\quad \\vec{\\nabla} \\times \\vec{E} = -\\frac{\\partial\\vec{B}}{\\partial t}`,
          texto: 'Los vectores modelan la realidad: fuerzas, trayectorias, gráficos por computadora y física relativista.',
          explicacionHarvard: 'Sin cálculo vectorial sería imposible la navegación aeroespacial, el renderizado de gráficos tridimensionales en GPUs, o la formulación de la relatividad general mediante cálculo tensorial.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('teorema de pitagoras') || norm.includes('pitagoras')) {
      return {
        habla: 'El Teorema de Pitágoras establece que en todo triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos.',
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Ecuación Fundamental de Pitágoras',
            latex: `c^2 = a^2 + b^2 \\implies c = \\sqrt{a^2 + b^2}`,
            explicacion: 'Donde c es la hipotenusa (lado opuesto al ángulo de 90°), y a, b son los catetos.'
          },
          {
            titulo: 'Aplicación en Geometría y Vectores',
            latex: `d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}`,
            explicacion: 'Es el fundamento de la distancia euclidiana entre dos puntos en el plano cartesiano.'
          }
        ],
        resultado: {
          latex: `c = \\sqrt{a^2 + b^2}`,
          texto: 'En triángulo rectángulo: c² = a² + b².'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es una derivada') || norm.includes('definicion de derivada')) {
      return {
        habla: 'La derivada representa la razón de cambio instantánea con la que cambia una función matemática en un punto determinado.',
        emocion: 'enfasis',
        pasos: [
          {
            titulo: 'Definición Formal por Límites',
            latex: `f'(x) = \\lim_{h \\to 0} \\frac{f(x + h) - f(x)}{h}`,
            explicacion: 'Geométricamente, la derivada en un punto representa la pendiente de la recta tangente a la curva de la función en dicho punto.'
          },
          {
            titulo: 'Regla de las Potencias',
            latex: `\\frac{d}{dx}[x^n] = n x^{n-1}`,
            explicacion: 'Por ejemplo, la derivada de x al cuadrado es 2x, y la derivada de x al cubo es 3x al cuadrado.'
          }
        ],
        resultado: {
          latex: `f'(x) = \\frac{df}{dx}`,
          texto: 'La derivada es la pendiente de la recta tangente y razón de cambio instantánea.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // â”€â”€ Conceptos avanzados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (norm.includes('que es una integral') || norm.includes('definicion de integral')) {
      return {
        habla: 'La integral es la operación inversa a la derivada. Geométricamente representa el área bajo la curva de una función en un intervalo dado.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Integral Indefinida', latex: `\\int f(x)\\,dx = F(x) + C`, explicacion: 'La integral indefinida encuentra la función primitiva F(x) cuya derivada es f(x). La constante C representa infinitas soluciones.' },
          { titulo: 'Integral Definida (Área)', latex: `\\int_a^b f(x)\\,dx = F(b) - F(a)`, explicacion: 'La integral definida de a hasta b calcula el área neta entre la curva y el eje x en ese intervalo.' }
        ],
        resultado: { latex: `\\int f(x)\\,dx = F(x) + C`, texto: 'La integral es el área acumulada bajo la curva.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es un limite') || norm.includes('definicion de limite')) {
      return {
        habla: 'El límite es el valor al que tiende una función cuando su variable independiente se aproxima a un punto determinado, sin necesariamente alcanzarlo.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Definición Formal (Épsilon-Delta)', latex: `\\lim_{x \\to a} f(x) = L`, explicacion: 'Leemos: el límite de f(x) cuando x tiende a "a" es L. Significa que f(x) se acerca arbitrariamente a L.' },
          { titulo: 'Límite en el Infinito', latex: `\\lim_{x \\to \\infty} \\frac{1}{x} = 0`, explicacion: 'Cuando x crece sin límite, la fracción 1/x se acerca a cero pero nunca lo alcanza exactamente.' }
        ],
        resultado: { latex: `\\lim_{x \\to a} f(x) = L`, texto: 'El límite es el valor al que se aproxima la función.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es la estadistica') || norm.includes('definicion estadistica')) {
      return {
        habla: 'La estadística es la rama de las matemáticas que se ocupa de recopilar, organizar, analizar e interpretar datos numéricos para tomar decisiones informadas.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Estadística Descriptiva', latex: `\\bar{x} = \\frac{\\sum x_i}{n}, \\quad \\sigma = \\sqrt{\\frac{\\sum(x_i - \\bar{x})^2}{n}}`, explicacion: 'La estadística descriptiva resume los datos: media, mediana, moda, varianza y desviación estándar son sus herramientas fundamentales.' },
          { titulo: 'Estadística Inferencial', latex: `P(A) = \\frac{\\text{casos favorables}}{\\text{casos posibles}}`, explicacion: 'La estadística inferencial usa muestras para hacer predicciones sobre poblaciones completas.' }
        ],
        resultado: { latex: `\\bar{x}, \\sigma, Me, Mo`, texto: 'La estadística describe, analiza e interpreta datos.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es la probabilidad') || norm.includes('definicion probabilidad')) {
      return {
        habla: 'La probabilidad mide la posibilidad de que ocurra un evento, en una escala de cero a uno, donde cero es imposible y uno es certeza absoluta.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Definición Clásica de Laplace', latex: `P(A) = \\frac{|A|}{|\\Omega|} = \\frac{\\text{casos favorables}}{\\text{casos totales}}`, explicacion: 'Cuando todos los resultados son igualmente posibles, la probabilidad es el cociente entre los casos favorables y el total de casos posibles.' },
          { titulo: 'Axiomas de Kolmogórov', latex: `0 \\leq P(A) \\leq 1, \\quad P(\\Omega) = 1`, explicacion: 'Toda probabilidad está entre 0 y 1. La probabilidad del espacio muestral completo siempre es 1.' }
        ],
        resultado: { latex: `P(A) \\in [0, 1]`, texto: 'La probabilidad mide la posibilidad de un evento.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es la trigonometria') || norm.includes('definicion trigonometria')) {
      return {
        habla: 'La trigonometría estudia las relaciones entre los ángulos y los lados de los triángulos, y extiende estas relaciones a funciones periódicas aplicadas en física, ingeniería y arquitectura.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Razones Trigonométricas Básicas', latex: `\\sin\\theta = \\frac{\\text{opuesto}}{\\text{hipotenusa}}, \\quad \\cos\\theta = \\frac{\\text{adyacente}}{\\text{hipotenusa}}, \\quad \\tan\\theta = \\frac{\\sin\\theta}{\\cos\\theta}`, explicacion: 'Las tres razones fundamentales relacionan cada ángulo con los lados del triángulo rectángulo.' },
          { titulo: 'Identidad Pitagórica Fundamental', latex: `\\sin^2\\theta + \\cos^2\\theta = 1`, explicacion: 'Esta identidad se cumple para cualquier ángulo y es la base de toda la trigonometría.' }
        ],
        resultado: { latex: `\\sin^2\\theta + \\cos^2\\theta = 1`, texto: 'La trigonometría estudia ángulos y sus razones.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es un determinante') || norm.includes('para que sirve el determinante')) {
      return {
        habla: 'El determinante es un número escalar asociado a una matriz cuadrada que indica si el sistema de ecuaciones tiene solución única, si la matriz es invertible y el volumen del paralelepípedo formado por sus vectores.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Determinante 2Ã—2', latex: `\\det\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix} = ad - bc`, explicacion: 'Para una matriz 2Ã—2, el determinante es la diferencia entre los productos de las diagonales.' },
          { titulo: 'Interpretación Geométrica', latex: `|\\det(A)| = \\text{Área del paralelogramo}`, explicacion: 'El valor absoluto del determinante es el área del paralelogramo formado por los vectores fila de la matriz.' }
        ],
        resultado: { latex: `\\det(A) \\neq 0 \\Rightarrow \\text{invertible}`, texto: 'Si detâ‰ 0, la matriz es invertible y el sistema tiene solución única.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es una recta') || norm.includes('ecuacion de la recta')) {
      return {
        habla: 'Una recta es un conjunto infinito de puntos alineados. Su ecuación cartesiana puede expresarse en forma pendiente-intersección, punto-pendiente o general.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Forma Pendiente-Intersección', latex: `y = mx + b`, explicacion: 'm es la pendiente (inclinación) y b es la ordenada al origen (donde cruza el eje y).' },
          { titulo: 'Forma General', latex: `Ax + By + C = 0`, explicacion: 'La forma general incluye todos los casos, incluyendo rectas verticales que no tienen pendiente definida.' }
        ],
        resultado: { latex: `y = mx + b`, texto: 'La ecuación de la recta es y = mx + b.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('regla de la cadena') || norm.includes('derivada de una composicion')) {
      return {
        habla: 'La regla de la cadena permite derivar funciones compuestas multiplicando la derivada de la función exterior por la derivada de la función interior.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Fórmula de la Regla de la Cadena', latex: `\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)`, explicacion: 'Derivamos la función exterior dejando el interior intacto, y luego multiplicamos por la derivada del interior.' },
          { titulo: 'Ejemplo: Derivada de sin(x²)', latex: `\\frac{d}{dx}[\\sin(x^2)] = \\cos(x^2) \\cdot 2x`, explicacion: 'Exterior: sin →’ cos. Interior: x² →’ 2x. Resultado: cos(x²)·2x.' }
        ],
        resultado: { latex: `(f \\circ g)' = f'(g) \\cdot g'`, texto: 'Regla de la cadena: derivada exterior Ã— derivada interior.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es una sucesion') || norm.includes('que es una serie')) {
      return {
        habla: 'Una sucesión es una lista ordenada de números que siguen un patrón. Una serie es la suma de los términos de una sucesión.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Sucesión Aritmética', latex: `a_n = a_1 + (n-1)d`, explicacion: 'En una progresión aritmética, cada término se obtiene sumando una constante d (razón) al anterior.' },
          { titulo: 'Suma de la Serie', latex: `S_n = \\frac{n}{2}(a_1 + a_n)`, explicacion: 'La suma de los n primeros términos de una progresión aritmética se calcula con esta fórmula de Gauss.' }
        ],
        resultado: { latex: `a_n = a_1 + (n-1)d`, texto: 'Sucesión: lista ordenada. Serie: suma de términos.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que son los numeros complejos') || norm.includes('numero imaginario')) {
      return {
        habla: 'Los números complejos extienden los reales incluyendo la unidad imaginaria i, definida como la raíz cuadrada de menos uno. Se escriben como a más b·i.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Unidad Imaginaria', latex: `i = \\sqrt{-1}, \\quad i^2 = -1`, explicacion: 'La unidad imaginaria i resuelve ecuaciones sin solución real, como x² + 1 = 0.' },
          { titulo: 'Forma Rectangular', latex: `z = a + bi, \\quad |z| = \\sqrt{a^2+b^2}`, explicacion: 'Todo número complejo tiene parte real "a" y parte imaginaria "b". Su módulo es la distancia al origen en el plano de Argand.' }
        ],
        resultado: { latex: `\\mathbb{C} = \\{a + bi : a, b \\in \\mathbb{R}\\}`, texto: 'Los complejos son z = a + bi donde i² = -1.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('ley de senos') || norm.includes('ley del seno')) {
      return {
        habla: 'La Ley de Senos establece que en cualquier triángulo, el cociente entre cada lado y el seno del ángulo opuesto es constante e igual al diámetro de la circunferencia circunscrita.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Fórmula de la Ley de Senos', latex: `\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R`, explicacion: 'Donde a, b, c son los lados del triángulo y A, B, C los ángulos opuestos a cada lado. R es el circunradio.' },
          { titulo: 'Aplicación', latex: `a = \\frac{b \\cdot \\sin A}{\\sin B}`, explicacion: 'Permite encontrar lados o ángulos desconocidos cuando conocemos al menos un par lado-ángulo opuesto.' }
        ],
        resultado: { latex: `\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}`, texto: 'Ley de Senos: lado/seno(ángulo opuesto) = constante.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('ley de cosenos') || norm.includes('ley del coseno')) {
      return {
        habla: 'La Ley de Cosenos generaliza el Teorema de Pitágoras para triángulos no rectángulos, relacionando los tres lados con uno de los ángulos.',
        emocion: 'enfasis',
        pasos: [
          { titulo: 'Fórmula de la Ley de Cosenos', latex: `c^2 = a^2 + b^2 - 2ab\\cos(C)`, explicacion: 'Cuando el ángulo C es 90°, el cos(90°)=0 y la fórmula se reduce al Teorema de Pitágoras.' },
          { titulo: 'Despeje del Ángulo', latex: `\\cos(C) = \\frac{a^2+b^2-c^2}{2ab}`, explicacion: 'Conociendo los tres lados podemos encontrar cualquier ángulo del triángulo.' }
        ],
        resultado: { latex: `c^2 = a^2 + b^2 - 2ab\\cos C`, texto: 'Ley de Cosenos: generalización de Pitágoras.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('identidad pitagorica') || norm.includes('identidad trigonometrica')) {
      return {
        habla: 'La identidad pitagórica trigonométrica fundamental establece que el seno al cuadrado más el coseno al cuadrado siempre es igual a uno, para cualquier ángulo.',
        emocion: 'feliz',
        pasos: [
          { titulo: 'Identidad Pitagórica Principal', latex: `\\sin^2\\theta + \\cos^2\\theta = 1`, explicacion: 'Se deriva directamente del Teorema de Pitágoras aplicado al círculo unitario (radio = 1).' },
          { titulo: 'Identidades Derivadas', latex: `\\tan^2\\theta + 1 = \\sec^2\\theta \\quad\\text{y}\\quad 1 + \\cot^2\\theta = \\csc^2\\theta`, explicacion: 'Dividiendo la identidad principal entre cos²Î¸ o sen²Î¸ obtenemos estas otras identidades útiles.' }
        ],
        resultado: { latex: `\\sin^2\\theta + \\cos^2\\theta = 1`, texto: 'Identidad pitagórica: sin²Î¸ + cos²Î¸ = 1.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('valores exactos') || norm.includes('tabla trigonometrica') || norm.includes('senos y cosenos de angulos')) {
      return {
        habla: 'Los valores exactos de seno y coseno para los ángulos especiales son: cero grados, treinta, cuarenta y cinco, sesenta y noventa grados.',
        emocion: 'feliz',
        pasos: [
          { titulo: 'Ángulos de 0° y 30°', latex: `\\sin 0°=0,\\;\\cos 0°=1 \\quad|\\quad \\sin 30°=\\tfrac{1}{2},\\;\\cos 30°=\\tfrac{\\sqrt{3}}{2}`, explicacion: 'A cero grados: sen=0, cos=1. A treinta grados: sen=1/2, cos=âˆš3/2.' },
          { titulo: 'Ángulos de 45° y 60°', latex: `\\sin 45°=\\tfrac{\\sqrt{2}}{2},\\;\\cos 45°=\\tfrac{\\sqrt{2}}{2} \\quad|\\quad \\sin 60°=\\tfrac{\\sqrt{3}}{2},\\;\\cos 60°=\\tfrac{1}{2}`, explicacion: 'A cuarenta y cinco grados ambas razones son âˆš2/2. A sesenta grados son los inversos de treinta.' },
          { titulo: 'Ángulo de 90°', latex: `\\sin 90°=1, \\quad \\cos 90°=0, \\quad \\tan 90°=\\text{Indefinida}`, explicacion: 'A noventa grados: seno vale uno, coseno vale cero, y tangente es indefinida.' }
        ],
        resultado: { latex: `\\sin 90° = 1, \\quad \\cos 0° = 1`, texto: 'Valores exactos trigonométricos memorizados.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }
}

export const universalMathSolver = new UniversalMathSolver();

