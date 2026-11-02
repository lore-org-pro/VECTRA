// ========================================================
// VECTRA // MATHEMATICAL STEP GENERATOR & LLM VERIFIER
// ========================================================
import { vectorEngine } from './vectorEngine.js';
import { naturalVectorParser } from './naturalParser.js';

/**
 * Formatea un vector bi o tridimensional en notación canónica perfecta para LaTeX:
 * Elimina signos redundantes como "+ -", suprime componentes nulas (+ 0k),
 * y gestiona coeficientes unitarios (1i -> i, -1j -> -j).
 */
export function formatCanonicalLatex(x, y, z) {
  const parts = [];
  if (x !== 0) {
    const coeff = x === 1 ? '' : x === -1 ? '-' : x;
    parts.push(`${coeff}\\hat{i}`);
  }
  if (y !== 0) {
    const absY = Math.abs(y);
    const coeff = absY === 1 ? '' : absY;
    if (parts.length === 0) {
      parts.push(`${y === -1 ? '-' : y === 1 ? '' : y}\\hat{j}`);
    } else {
      parts.push(y > 0 ? `+ ${coeff}\\hat{j}` : `- ${coeff}\\hat{j}`);
    }
  }
  if (z !== undefined && z !== null && z !== 0) {
    const absZ = Math.abs(z);
    const coeff = absZ === 1 ? '' : absZ;
    if (parts.length === 0) {
      parts.push(`${z === -1 ? '-' : z === 1 ? '' : z}\\hat{k}`);
    } else {
      parts.push(z > 0 ? `+ ${coeff}\\hat{k}` : `- ${coeff}\\hat{k}`);
    }
  }
  return parts.length > 0 ? parts.join(' ') : '0\\hat{i}';
}

/**
 * Genera explicaciones analíticas formales de cátedra universitaria nivel Harvard
 */
export function buildHarvardExplanation(op, vectors, res) {
  const v1 = vectors[0] || [0, 0];
  const v2 = vectors[1] || [0, 0];
  const is2D = (v1.length === 2 && v2.length === 2);

  if (op === 'suma') {
    const x = res[0] || 0;
    const y = res[1] || 0;
    const z = res[2];
    const magSq = is2D ? (x * x + y * y) : (x * x + y * y + (z || 0) * (z || 0));
    const mag = Math.round(Math.sqrt(magSq) * 100) / 100;
    const can = formatCanonicalLatex(x, y, z);
    const xDesc = x !== 0 ? `${x > 0 ? 'un avance positivo de ' + x : 'un retroceso de ' + Math.abs(x)} unidades en el eje X` : 'coordenada nula en X';
    const yDesc = y !== 0 ? `${y > 0 ? 'una elevación de ' + y : 'una deflexión descendente de ' + Math.abs(y)} unidades en el eje Y` : 'sin componente vertical en Y';
    const zDesc = (!is2D && z !== undefined && z !== 0) ? ` y ${z > 0 ? 'un desplazamiento cota de +' + z : 'un desplazamiento dorsal de ' + z} unidades en Z` : '';

    const espacioDesc = is2D ? 'en el plano euclidiano ℝ²' : 'en el espacio afín euclidiano ℝ³';
    return `Análisis formal de cátedra: la adición vectorial cumple con el principio de superposición lineal ${espacioDesc}. El vector resultante R = ${can} integra ambas trayectorias: presenta ${xDesc}, ${yDesc}${zDesc}. Su norma euclidiana o módulo invariante es ||R|| = √${magSq} ≈ ${mag} unidades. Su vector unitario normalizado û define con rigor absoluto su recta de acción, confirmando la ley geométrica del paralelogramo de Cauchy-Schwarz.`;
  }
  if (op === 'resta') {
    const x = res[0] || 0;
    const y = res[1] || 0;
    const z = res[2];
    const magSq = is2D ? (x * x + y * y) : (x * x + y * y + (z || 0) * (z || 0));
    const mag = Math.round(Math.sqrt(magSq) * 100) / 100;
    const can = formatCanonicalLatex(x, y, z);
    return `Análisis formal de cátedra: la diferencia de vectores cuantifica el vector de desplazamiento relativo que conecta el extremo del vector B con el extremo del vector A. El vector resultante D = ${can} posee una norma euclidiana ||D|| = √${magSq} ≈ ${mag} unidades, caracterizando analíticamente el tensor de separación posicional entre ambos estados.`;
  }
  if (op === 'producto_cruz') {
    const [x, y, z] = res;
    const can = formatCanonicalLatex(x, y, z);
    const magSq = x * x + y * y + z * z;
    const mag = Math.round(Math.sqrt(magSq) * 100) / 100;
    return `Análisis formal de cátedra: el producto vectorial A × B engendra un pseudovector rigurosamente ortogonal al subespacio bidimensional generado por A y B. El vector ortogonal resultante es ${can}, y su norma euclidiana ||A × B|| = √${magSq} ≈ ${mag} unidades cuadradas representa de forma exacta el área del paralelogramo sustentado por ambos vectores en ℝ³, con sentido validado por la regla de la mano derecha.`;
  }
  if (op === 'producto_punto') {
    const dot = typeof res === 'number' ? res : 0;
    const isOrth = Math.abs(dot) < 1e-6;
    return isOrth
      ? `Análisis formal de cátedra: al anularse idénticamente el producto escalar (A · B = 0), el ángulo diedro entre ambos vectores es de exactamente 90 grados (π/2 radianes), demostrando que ambos vectores son estrictamente ortogonales y forman una base ortogonal en su subespacio.`
      : `Análisis formal de cátedra: el producto escalar evalúa la proyección métrica y correlación direccional entre ambos vectores, obteniendo un escalar invariante de ${dot}. ${dot > 0 ? 'Indica una afinidad angular aguda (< 90°)' : 'Indica una dispersión angular obtusa (> 90°)'} bajo la métrica estándar euclidiana.`;
  }
  if (op === 'magnitud') {
    const mag = typeof res === 'number' ? res : 0;
    return `Análisis formal de cátedra: la norma euclidiana representa la métrica canónica inducida por el producto interno. El módulo ||v|| ≈ ${mag} define la longitud geométrica invariante ante cualquier transformación ortogonal del sistema de coordenadas.`;
  }
  return `Análisis formal de cátedra: la operación vectorial ha sido resuelta y verificada analíticamente con total rigor matemático, preservando las propiedades fundamentales del álgebra lineal euclidiana.`;
}

/**
 * Genera explicaciones didácticas cristalinas nivel niño de 5 años (ELI5 / Explain Like I'm 5)
 */
export function buildELI5Explanation(op, vectors, res) {
  const v1 = vectors[0] || [0, 0];
  const v2 = vectors[1] || [0, 0];
  const is2D = (v1.length === 2 && v2.length === 2);

  if (op === 'suma') {
    const rx = res[0];
    const ry = res[1];
    const rz = res[2];
    const mag = Math.round(vectorEngine.magnitude(res) * 100) / 100;
    if (is2D) {
      return `¡Te lo explico como si tuvieras 5 años! Imagina que estás jugando en un patio de baldosas y estás parado en el centro (cero, cero). Cada flecha es un camino con pasos. La flecha azul te dice: camina ${v1[0]} pasos a los lados y ${v1[1]} pasos adelante o atrás. La flecha naranja es tu segundo camino: camina ${v2[0]} pasos a los lados y ${v2[1]} pasos. ¿Y ves esa gran flecha verde brillante? ¡Ese es el superatajo mágico! En vez de dar dos caminatas largas, la flecha verde te lleva directo en línea recta desde la salida hasta la meta final en (${rx}, ${ry}), midiendo exactamente ${mag} pasos de largo. ¡Sumar vectores es encontrar el atajo directo de las flechas!`;
    } else {
      return `¡Te lo explico como si tuvieras 5 años! Imagina que estás en una habitación flotando en el centro (cero, cero, cero). Las flechas son como caminos de luces en el aire. La flecha azul es tu primer salto en el espacio, y la flecha naranja es tu segundo salto. ¿Y ves la flecha verde brillante? ¡Es el cohete directo! En vez de seguir un camino y luego el otro, la flecha verde va en línea recta desde donde empezaste hasta la meta final en (${rx}, ${ry}, ${rz}), con un tamaño total de ${mag} pasos. ¡Sumar vectores es simplemente descubrir a dónde llegas si sigues las flechas una tras otra!`;
    }
  }

  if (op === 'resta') {
    const mag = Math.round(vectorEngine.magnitude(res) * 100) / 100;
    return `¡Te lo explico súper fácil! En la resta de vectores, imagina que dos amigos salieron del mismo punto: tu amigo A llegó a donde termina la flecha azul y tu amigo B llegó a donde termina la flecha naranja. La resta es el puente que los une: le dice a tu amigo B exactamente cuántos pasos y hacia dónde tiene que caminar para llegar directo hasta donde está su amigo A, ¡a una distancia de ${mag} pasos!`;
  }

  if (op === 'producto_cruz') {
    return `¡Mira qué divertido! Imagina que tienes dos flechas acostadas sobre una mesa plana, como dos lápices. El producto cruz inventa una flecha completamente nueva que sale disparada hacia arriba hacia el techo, como si fuera un cohete despegando de la mesa. Esa nueva flecha forma una esquina cuadrada perfecta de 90 grados con las dos flechas de la mesa, ¡igual que la esquina de una caja de zapatos!`;
  }

  if (op === 'producto_punto') {
    const dot = typeof res === 'number' ? res : 0;
    return `¡Te lo explico fácil! El producto punto te dice si dos flechas son amigas y van hacia el mismo lado. Como el resultado nos dio ${dot}, ${dot > 0 ? '¡las dos flechas están contentas y caminan en una dirección parecida hacia adelante!' : dot === 0 ? '¡las flechas son totalmente independientes y forman una esquina cuadrada perfecta de 90 grados!' : '¡las flechas apuntan en direcciones contrarias!'}`;
  }

  if (op === 'magnitud') {
    const mag = typeof res === 'number' ? res : 0;
    return `¡Es lo más sencillo del mundo! La magnitud es simplemente tomar una regla y medir qué tan larga es la flecha desde donde nace hasta su puntita. Esta flecha mide ${mag} pasos de largo. ¡Entre más larga la flecha, más lejos llega o más fuerza tiene!`;
  }

  return `¡Te lo explico fácil! Cada flecha que ves en la pantalla te enseña hacia dónde moverte y qué tan lejos llegar. ¡Es como un mapa de tesoro interactivo!`;
}

export class StepGenerator {
  /**
   * Verifica la respuesta del LLM contra el motor determinista.
   * Si el LLM se equivoca en cálculos, el motor sobreescribe los números
   * y los pasos para garantizar 100% de rigor en vivo.
   */
  verifyAndCorrect(llmResponse, userQuestion) {
    const vectors = naturalVectorParser.extractVectors(userQuestion);
    const op = naturalVectorParser.detectOperation(userQuestion);

    // Si no logramos extraer al menos un vector o la operación no es de las básicas,
    // confiamos en la respuesta estructurada del LLM con validación de tipos
    if (vectors.length === 0 || op === 'desconocida') {
      return this.ensureFormat(llmResponse);
    }

    try {
      const v1 = vectors[0] || [0, 0];
      const v2 = vectors[1] || [0, 0];
      const v3 = vectors[2] || [0, 0];
      const is2D = (v1.length === 2 && v2.length === 2);

      let verifiedData = null;

      if (op === 'suma' && vectors.length >= 2) {
        const R = vectorEngine.add(v1, v2);
        const harvardLecture = buildHarvardExplanation('suma', [v1, v2], R);
        const eli5Lecture = buildELI5Explanation('suma', [v1, v2], R);

        const latexStep1 = is2D
          ? `\\vec{A} = \\langle ${v1[0]}, \\; ${v1[1]} \\rangle, \\quad \\vec{B} = \\langle ${v2[0]}, \\; ${v2[1]} \\rangle`
          : `\\vec{A} = \\langle ${v1[0]}, \\; ${v1[1]}, \\; ${v1[2]} \\rangle, \\quad \\vec{B} = \\langle ${v2[0]}, \\; ${v2[1]}, \\; ${v2[2]} \\rangle`;

        const expStep1 = is2D
          ? `Vector A = (${v1[0]}, ${v1[1]}) y Vector B = (${v2[0]}, ${v2[1]}).`
          : `Vector A = (${v1[0]}, ${v1[1]}, ${v1[2]}) y Vector B = (${v2[0]}, ${v2[1]}, ${v2[2]}).`;

        const locStep1 = is2D
          ? `Primer paso. Observa en la pizarra la identificación de los dos vectores en el plano cartesiano. El vector A tiene componentes ${v1[0]} en el eje horizontal X y ${v1[1]} en el eje vertical Y. El vector B se define con ${v2[0]} en X y ${v2[1]} en Y.`
          : `Primer paso. Observa en la pizarra la identificación de los dos vectores en el espacio. El vector A tiene componentes ${v1[0]} en X, ${v1[1]} en Y y ${v1[2]} en Z. El vector B se define con ${v2[0]} en X, ${v2[1]} en Y y ${v2[2]} en Z.`;

        const latexStep2 = is2D
          ? `\\vec{R} = \\langle ${v1[0]} + (${v2[0]}), \\; ${v1[1]} + (${v2[1]}) \\rangle`
          : `\\vec{R} = \\langle ${v1[0]} + (${v2[0]}), \\; ${v1[1]} + (${v2[1]}), \\; ${v1[2]} + (${v2[2]}) \\rangle`;

        const expStep2 = is2D
          ? `Sumamos las coordenadas homólogas: (${v1[0]} + ${v2[0]}) en X, (${v1[1]} + ${v2[1]}) en Y.`
          : `Sumamos las coordenadas homólogas: (${v1[0]} + ${v2[0]}) en X, (${v1[1]} + ${v2[1]}) en Y, (${v1[2]} + ${v2[2]}) en Z.`;

        const locStep2 = is2D
          ? `Segundo paso. Sumamos componente a componente: en el eje X sumamos ${v1[0]} con ${v2[0]}, y en el eje Y sumamos ${v1[1]} con ${v2[1]}. Al respetar los signos negativos obtenemos las nuevas coordenadas directamente.`
          : `Segundo paso. Aplicamos el principio de superposición lineal sumando las componentes correspondientes en X, Y y Z.`;

        const latexStep3 = is2D
          ? `\\vec{R} = \\langle ${R[0]}, \\; ${R[1]} \\rangle`
          : `\\vec{R} = \\langle ${R[0]}, \\; ${R[1]}, \\; ${R[2]} \\rangle`;

        const expStep3 = is2D
          ? `Vector resultante simplificado: (${R[0]}, ${R[1]}) con módulo ||R|| ≈ ${Math.round(vectorEngine.magnitude(R) * 100) / 100}.`
          : `Vector resultante simplificado: (${R[0]}, ${R[1]}, ${R[2]}) con módulo ||R|| ≈ ${Math.round(vectorEngine.magnitude(R) * 100) / 100}.`;

        const locStep3 = is2D
          ? `Tercer paso. Obtenemos el vector resultante: ${R[0]} unidades en X y ${R[1]} unidades en Y. Su longitud total o módulo euclidiano es de aproximadamente ${Math.round(vectorEngine.magnitude(R) * 100) / 100} unidades.`
          : `Tercer paso. Obtenemos el vector resultante con componentes ${R[0]} en i, ${R[1]} en j y ${R[2]} en k. Su longitud total o módulo es de aproximadamente ${Math.round(vectorEngine.magnitude(R) * 100) / 100} unidades.`;

        verifiedData = {
          habla: `Resolvamos la suma de vectores paso a paso en el pizarrón. Presta atención al desarrollo cartesiano.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: is2D ? 'Identificación de Vectores en el Plano' : 'Identificación de Vectores en el Espacio',
              latex: latexStep1,
              explicacion: expStep1,
              locucion: locStep1
            },
            {
              titulo: 'Suma Analítica Componente a Componente',
              latex: latexStep2,
              explicacion: expStep2,
              locucion: locStep2
            },
            {
              titulo: 'Vector Resultante Simplificado',
              latex: latexStep3,
              explicacion: expStep3,
              locucion: locStep3
            }
          ],
          resultado: {
            latex: is2D ? `\\vec{R} = ${formatCanonicalLatex(R[0], R[1])}` : `\\vec{R} = ${formatCanonicalLatex(R[0], R[1], R[2])}`,
            texto: is2D ? `El vector suma es (${R[0]}, ${R[1]}).` : `El vector suma es (${R[0]}, ${R[1]}, ${R[2]}).`,
            explicacionHarvard: harvardLecture,
            explicacionFacil: eli5Lecture
          },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'R', componentes: R, color: '#00ff88' }
            ]
          }
        };
      } else if (op === 'resta' && vectors.length >= 2) {
        const D = vectorEngine.subtract(v1, v2);
        const harvardLecture = buildHarvardExplanation('resta', [v1, v2], D);
        const eli5Lecture = buildELI5Explanation('resta', [v1, v2], D);
        verifiedData = {
          habla: `Analicemos la resta de vectores término a término en el pizarrón.`,
          emocion: 'neutral',
          pasos: [
            {
              titulo: is2D ? 'Identificación de Minuendo y Sustraendo en el Plano' : 'Identificación de Minuendo y Sustraendo en el Espacio',
              latex: is2D
                ? `\\vec{A} = \\langle ${v1[0]}, \\; ${v1[1]} \\rangle, \\quad \\vec{B} = \\langle ${v2[0]}, \\; ${v2[1]} \\rangle`
                : `\\vec{A} = \\langle ${v1[0]}, \\; ${v1[1]}, \\; ${v1[2]} \\rangle, \\quad \\vec{B} = \\langle ${v2[0]}, \\; ${v2[1]}, \\; ${v2[2]} \\rangle`,
              explicacion: is2D
                ? `Minuendo A = (${v1[0]}, ${v1[1]}) y Sustraendo B = (${v2[0]}, ${v2[1]}).`
                : `Minuendo A = (${v1[0]}, ${v1[1]}, ${v1[2]}) y Sustraendo B = (${v2[0]}, ${v2[1]}, ${v2[2]}).`,
              locucion: is2D
                ? `Primer paso. Identificamos en el pizarrón el vector A como minuendo con componentes (${v1[0]}, ${v1[1]}), y el vector B como sustraendo con componentes (${v2[0]}, ${v2[1]}).`
                : `Primer paso. Identificamos en el pizarrón el vector A como minuendo con componentes (${v1[0]}, ${v1[1]}${v1[2] ? ', ' + v1[2] : ''}), y el vector B como sustraendo con componentes (${v2[0]}, ${v2[1]}${v2[2] ? ', ' + v2[2] : ''}).`
            },
            {
              titulo: 'Diferencia Algebraica de Coordenadas',
              latex: is2D
                ? `\\vec{D} = \\vec{A} - \\vec{B} = \\langle ${v1[0]} - (${v2[0]}), \\; ${v1[1]} - (${v2[1]}) \\rangle`
                : `\\vec{D} = \\vec{A} - \\vec{B} = \\langle ${v1[0]} - (${v2[0]}), \\; ${v1[1]} - (${v2[1]}), \\; ${v1[2]} - (${v2[2]}) \\rangle`,
              explicacion: is2D
                ? `Restamos cada componente de B respecto a A: (${v1[0]} - ${v2[0]}) en X, (${v1[1]} - ${v2[1]}) en Y.`
                : `Restamos cada componente de B respecto a A: (${v1[0]} - ${v2[0]}) en X, (${v1[1]} - ${v2[1]}) en Y, (${v1[2]} - ${v2[2]}) en Z.`,
              locucion: `Segundo paso. Planteamos la diferencia algebraica. A cada coordenada del primer vector le restamos la coordenada correspondiente del segundo vector.`
            },
            {
              titulo: 'Vector Diferencia Simplificado',
              latex: is2D
                ? `\\vec{D} = \\langle ${D[0]}, \\; ${D[1]} \\rangle`
                : `\\vec{D} = \\langle ${D[0]}, \\; ${D[1]}, \\; ${D[2]} \\rangle`,
              explicacion: is2D
                ? `Vector desplazamiento D = (${D[0]}, ${D[1]}) con módulo ||D|| ≈ ${Math.round(vectorEngine.magnitude(D) * 100) / 100}.`
                : `Vector desplazamiento D = (${D[0]}, ${D[1]}, ${D[2]}) con módulo ||D|| ≈ ${Math.round(vectorEngine.magnitude(D) * 100) / 100}.`,
              locucion: is2D
                ? `Tercer paso. Tras realizar las restas obtenemos el vector diferencia final: ${D[0]} unidades en X y ${D[1]} unidades en Y.`
                : `Tercer paso. Tras realizar las restas obtenemos el vector diferencia final: ${D[0]} unidades en X y ${D[1]} unidades en Y${D[2] ? ' con ' + D[2] + ' en Z' : ''}.`
            }
          ],
          resultado: {
            latex: is2D ? `\\vec{D} = ${formatCanonicalLatex(D[0], D[1])}` : `\\vec{D} = ${formatCanonicalLatex(D[0], D[1], D[2])}`,
            texto: is2D ? `El vector resta es (${D[0]}, ${D[1]}).` : `El vector resta es (${D[0]}, ${D[1]}, ${D[2]}).`,
            explicacionHarvard: harvardLecture,
            explicacionFacil: eli5Lecture
          },
          visualizacion: {
            tipo: 'resta',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'D', componentes: D, color: '#ff3366' }
            ]
          }
        };
      } else if (op === 'producto_cruz' && vectors.length >= 2) {
        const cross = vectorEngine.crossProduct(v1, v2);
        const harvardLecture = buildHarvardExplanation('producto_cruz', [v1, v2], cross);
        verifiedData = {
          habla: `Desarrollemos el producto cruz y su determinante en el pizarrón.`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Determinante del Producto Vectorial',
              latex: `\\vec{A} \\times \\vec{B} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ ${v1[0]} & ${v1[1]} & ${v1[2]} \\\\ ${v2[0]} & ${v2[1]} & ${v2[2]} \\end{vmatrix}`,
              explicacion: 'Construimos la matriz de orden 3 con la base canónica i, j, k en la primera fila.',
              locucion: `Primer paso. Planteamos en la pizarra el determinante formal de orden 3. En la primera fila situamos los versores ortogonales i, j, k. En la segunda fila las componentes del vector A (${v1[0]}, ${v1[1]}, ${v1[2]}), y en la tercera fila las componentes de B (${v2[0]}, ${v2[1]}, ${v2[2]}).`
            },
            {
              titulo: 'Cálculo por Menores y Cofactores',
              latex: `\\hat{i}((${v1[1]})(${v2[2]}) - (${v1[2]})(${v2[1]})) - \\hat{j}((${v1[0]})(${v2[2]}) - (${v1[2]})(${v2[0]})) + \\hat{k}((${v1[0]})(${v2[1]}) - (${v1[1]})(${v2[0]}))`,
              explicacion: 'Multiplicamos las diagonales cruzadas respetando los signos alternados (+i, -j, +k).',
              locucion: `Segundo paso. Desarrollamos por cofactores. Multiplicamos las diagonales en cruz: para i calculamos ${v1[1]} por ${v2[2]} menos ${v1[2]} por ${v2[1]}. Para j alternamos con signo negativo, y para k sumamos el menor restante. Esta alternancia de signos es la que garantiza la perpendicularidad exacta.`
            },
            {
              titulo: 'Vector Perpendicular Resultante',
              latex: `\\vec{A} \\times \\vec{B} = \\langle ${cross[0]}, ${cross[1]}, ${cross[2]} \\rangle`,
              explicacion: `El vector resultante es perpendicular a ambos vectores originales formando 90°.`,
              locucion: `Tercer paso. Resolviendo los productos aritméticos obtenemos el vector ortogonal: ${cross[0]} en i, ${cross[1]} en j y ${cross[2]} en k. Este nuevo vector es rigurosamente perpendicular tanto a A como a B según la regla de la mano derecha.`
            }
          ],
          resultado: {
            latex: `\\vec{A} \\times \\vec{B} = ${formatCanonicalLatex(cross[0], cross[1], cross[2])}`,
            texto: `El producto cruz es (${cross[0]}, ${cross[1]}, ${cross[2]}).`,
            explicacionHarvard: harvardLecture
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'AxB', componentes: cross, color: '#ff0077' }
            ]
          }
        };
      } else if (op === 'producto_punto' && vectors.length >= 2) {
        const dot = vectorEngine.dotProduct(v1, v2);
        const isOrth = vectorEngine.isOrthogonal(v1, v2);
        const harvardLecture = buildHarvardExplanation('producto_punto', [v1, v2], dot);
        const eli5Lecture = buildELI5Explanation('producto_punto', [v1, v2], dot);
        verifiedData = {
          habla: `Evaluemos el producto escalar y su ortogonalidad paso a paso.`,
          emocion: isOrth ? 'feliz' : 'neutral',
          pasos: [
            {
              titulo: is2D ? 'Definición del Producto Punto en el Plano' : 'Definición del Producto Punto',
              latex: is2D 
                ? `\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y`
                : `\\vec{A} \\cdot \\vec{B} = A_x B_x + A_y B_y + A_z B_z`,
              explicacion: 'Multiplicamos las componentes correspondientes y sumamos los productos.',
              locucion: is2D
                ? `Primer paso. Observa en la pizarra la definición del producto escalar en el plano. Multiplicamos cada componente: X con X, y Y con Y.`
                : `Primer paso. Observa en la pizarra la definición del producto escalar. Multiplicamos cada componente del vector A por su correspondiente en B: X con X, Y con Y, y Z con Z.`
            },
            {
              titulo: 'Evaluación Numérica y Ortogonalidad',
              latex: is2D
                ? `(${v1[0]})(${v2[0]}) + (${v1[1]})(${v2[1]}) = ${dot}`
                : `(${v1[0]})(${v2[0]}) + (${v1[1]})(${v2[1]}) + (${v1[2]})(${v2[2]}) = ${dot}`,
              explicacion: isOrth ? 'La suma de los productos da exactamente 0: vectores estrictamente ortogonales (90°).' : `El valor escalar resultante es ${dot}. Al ser diferente de cero, los vectores no forman 90°.`,
              locucion: isOrth
                ? `Segundo paso. La suma da cero, lo que demuestra matemáticamente que ambos vectores forman un ángulo recto de 90 grados y son ortogonales.`
                : `Segundo paso. Efectuamos las multiplicaciones y la adición, obteniendo un valor escalar final de ${dot}. Al ser distinto de cero, los vectores no forman 90 grados entre sí.`
            }
          ],
          resultado: {
            latex: `\\vec{A} \\cdot \\vec{B} = ${dot} \\quad ${isOrth ? '(\\vec{A} \\perp \\vec{B})' : ''}`,
            texto: `El producto punto es ${dot}.`,
            explicacionHarvard: harvardLecture,
            explicacionFacil: eli5Lecture
          },
          visualizacion: {
            tipo: 'producto_punto',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' }
            ]
          }
        };
      } else if (op === 'magnitud' && vectors.length >= 1) {
        const mag = Math.round(vectorEngine.magnitude(v1) * 1000) / 1000;
        const harvardLecture = buildHarvardExplanation('magnitud', [v1], mag);
        const eli5Lecture = buildELI5Explanation('magnitud', [v1], mag);
        const sumSq = is2D ? (v1[0] * v1[0] + v1[1] * v1[1]) : (v1[0] * v1[0] + v1[1] * v1[1] + (v1[2] || 0) * (v1[2] || 0));
        verifiedData = {
          habla: `Calculemos la norma euclidiana del vector paso a paso en el pizarrón.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: is2D ? 'Fórmula de la Norma en el Plano' : 'Fórmula de la Norma Euclídea',
              latex: is2D ? `\\|\\vec{v}\\| = \\sqrt{x^2 + y^2}` : `\\|\\vec{v}\\| = \\sqrt{x^2 + y^2 + z^2}`,
              explicacion: is2D ? 'Aplicamos el teorema de Pitágoras en el plano cartesiano.' : 'Aplicamos el teorema de Pitágoras tridimensional.',
              locucion: is2D
                ? `Primer paso. Para calcular el módulo del vector en el plano, aplicamos el teorema de Pitágoras: la raíz cuadrada de la suma de los cuadrados de X y Y.`
                : `Primer paso. Para calcular el módulo o tamaño del vector, aplicamos en la pizarra la generalización del teorema de Pitágoras: la raíz cuadrada de la suma de los cuadrados de cada una de sus coordenadas.`
            },
            {
              titulo: 'Sustitución y Radicación',
              latex: is2D
                ? `\\sqrt{(${v1[0]})^2 + (${v1[1]})^2} = \\sqrt{${sumSq}} = ${mag}`
                : `\\sqrt{(${v1[0]})^2 + (${v1[1]})^2 + (${v1[2] || 0})^2} = \\sqrt{${sumSq}} = ${mag}`,
              explicacion: `Suma de cuadrados = ${sumSq}, cuya raíz cuadrada es ${mag}.`,
              locucion: `Segundo paso. Elevamos al cuadrado cada componente, sumamos los valores obtenidos resultando en ${sumSq}, y extrayendo la raíz cuadrada principal obtenemos una longitud exacta de ${mag} unidades.`
            }
          ],
          resultado: {
            latex: `\\|\\vec{v}\\| = ${mag}`,
            texto: `La magnitud es ${mag}.`,
            explicacionHarvard: harvardLecture,
            explicacionFacil: eli5Lecture
          },
          visualizacion: {
            tipo: 'escalar',
            vectores: [{ nombre: 'v', componentes: v1, color: '#00ff88' }]
          }
        };
      } else if (op === 'angulo' && vectors.length >= 2) {
        const ang = vectorEngine.angleBetween(v1, v2);
        const dot = vectorEngine.dotProduct(v1, v2);
        const mag1 = Math.round(vectorEngine.magnitude(v1) * 100) / 100;
        const mag2 = Math.round(vectorEngine.magnitude(v2) * 100) / 100;
        const harvardLecture = `Análisis formal de cátedra: el ángulo diedro entre ambos vectores se deduce del producto interno euclidiano normalizado por el producto de sus normas. Con un ángulo de ${ang.degrees} grados (${Math.round(ang.radians * 100) / 100} radianes), los vectores forman una configuración ${ang.degrees < 90 ? 'aguda de convergencia direccional' : ang.degrees === 90 ? 'estrictamente ortogonal en cuadratura' : 'obtusa de dispersión direccional'}, verificando el postulado del coseno en espacios prehilbertianos.`;
        verifiedData = {
          habla: `Determinemos el ángulo diedro entre ambos vectores paso a paso.`,
          emocion: 'neutral',
          pasos: [
            {
              titulo: 'Fórmula del Coseno del Ángulo',
              latex: `\\cos(\\theta) = \\frac{\\vec{A} \\cdot \\vec{B}}{\\|\\vec{A}\\| \\|\\vec{B}\\|}`,
              explicacion: 'El ángulo se obtiene despejando el coseno a partir del producto escalar.',
              locucion: `Primer paso. Como observas en la pizarra, el coseno del ángulo formado por dos vectores equivale al cociente entre su producto escalar y la multiplicación de sus respectivas normas euclidianas.`
            },
            {
              titulo: 'Cálculo de Numerador y Denominador',
              latex: `\\vec{A} \\cdot \\vec{B} = ${dot}, \\quad \\|\\vec{A}\\| = ${mag1}, \\quad \\|\\vec{B}\\| = ${mag2}`,
              explicacion: `Numerador = ${dot}. Denominador = ${Math.round(mag1 * mag2 * 100) / 100}.`,
              locucion: `Segundo paso. Evaluamos las operaciones: el producto punto en el numerador resulta en ${dot}, y multiplicando las magnitudes obtenemos ${Math.round(mag1 * mag2 * 100) / 100} en el denominador.`
            },
            {
              titulo: 'Aplicación del Arcocoseno',
              latex: `\\theta = \\arccos\\left(\\frac{${dot}}{${Math.round(mag1 * mag2 * 100) / 100}}\\right) \\approx ${ang.degrees}^\\circ \\; (${Math.round(ang.radians * 100) / 100} \\text{ rad})`,
              explicacion: `El ángulo resultante es de ${ang.degrees} grados sexagesimales.`,
              locucion: `Tercer paso. Aplicamos la función inversa del arcocoseno al cociente obtenido, concluyendo que ambos vectores forman un ángulo diedro de aproximadamente ${ang.degrees} grados sexagesimales.`
            }
          ],
          resultado: {
            latex: `\\theta = ${ang.degrees}^\\circ`,
            texto: `El ángulo entre los vectores es ${ang.degrees}°.`,
            explicacionHarvard: harvardLecture
          },
          visualizacion: {
            tipo: 'angulo',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' }
            ]
          }
        };
      } else if (op === 'unitario' && vectors.length >= 1) {
        const mag = Math.round(vectorEngine.magnitude(v1) * 1000) / 1000;
        const u = vectorEngine.unitVector(v1).map(c => Math.round(c * 1000) / 1000);
        verifiedData = {
          habla: `El vector unitario en la misma dirección tiene componentes (${u[0]}, ${u[1]}, ${u[2]}) con magnitud exactamente igual a uno.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Definición de Normalización',
              latex: `\\hat{u} = \\frac{\\vec{v}}{\\|\\vec{v}\\|} = \\frac{1}{\\|\\vec{v}\\|}\\vec{v}`,
              explicacion: 'Dividimos cada componente cartesiana entre la longitud o norma del vector original.'
            },
            {
              titulo: 'Sustitución con la Magnitud',
              latex: `\\hat{u} = \\frac{1}{${mag}} \\langle ${v1[0]}, ${v1[1]}, ${v1[2]} \\rangle = \\langle ${u[0]}, ${u[1]}, ${u[2]} \\rangle`,
              explicacion: 'Cada componente normalizada tiene un valor entre -1 y 1.'
            }
          ],
          resultado: {
            latex: `\\hat{u} = \\langle ${u[0]}, ${u[1]}, ${u[2]} \\rangle, \\quad \\|\\hat{u}\\| = 1`,
            texto: `Vector unitario: (${u[0]}, ${u[1]}, ${u[2]}).`
          },
          visualizacion: {
            tipo: 'escalar',
            vectores: [
              { nombre: 'v', componentes: v1, color: '#00f0ff' },
              { nombre: 'u', componentes: u, color: '#00ff88' }
            ]
          }
        };
      } else if (op === 'proyeccion' && vectors.length >= 2) {
        const proj = vectorEngine.projection(v1, v2);
        verifiedData = {
          habla: `La proyección ortogonal del vector A sobre el vector B es el vector (${proj.vectorProj[0]}, ${proj.vectorProj[1]}, ${proj.vectorProj[2]}).`,
          emocion: 'neutral',
          pasos: [
            {
              titulo: 'Fórmula de Proyección Vectorial',
              latex: `\\text{proy}_{\\vec{B}}(\\vec{A}) = \\left(\\frac{\\vec{A} \\cdot \\vec{B}}{\\|\\vec{B}\\|^2}\\right) \\vec{B}`,
              explicacion: 'Proyecta la sombra geométrica de A directamente a lo largo de la dirección de B.'
            },
            {
              titulo: 'Componentes del Vector Proyección',
              latex: `\\text{proy}_{\\vec{B}}(\\vec{A}) = \\langle ${proj.vectorProj[0]}, ${proj.vectorProj[1]}, ${proj.vectorProj[2]} \\rangle`,
              explicacion: `La proyección escalar (longitud orientada) es ${proj.scalarProj}.`
            }
          ],
          resultado: {
            latex: `\\text{proy}_{\\vec{B}}(\\vec{A}) = \\langle ${proj.vectorProj[0]}, ${proj.vectorProj[1]}, ${proj.vectorProj[2]} \\rangle`,
            texto: `Vector proyección: (${proj.vectorProj[0]}, ${proj.vectorProj[1]}, ${proj.vectorProj[2]}).`
          },
          visualizacion: {
            tipo: 'proyeccion',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'proy', componentes: proj.vectorProj, color: '#ff0077' }
            ]
          }
        };
      } else if (op === 'area_paralelogramo' && vectors.length >= 2) {
        const cross = vectorEngine.crossProduct(v1, v2);
        const area = Math.round(vectorEngine.magnitude(cross) * 1000) / 1000;
        verifiedData = {
          habla: `El área del paralelogramo formado por los dos vectores es de ${area} unidades cuadradas.`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Relación Área-Producto Cruz',
              latex: `A = \\|\\vec{A} \\times \\vec{B}\\|`,
              explicacion: 'El área del paralelogramo es la magnitud del producto vectorial de sus lados.'
            },
            {
              titulo: 'Cálculo del Producto Cruz',
              latex: `\\vec{A} \\times \\vec{B} = \\langle ${cross[0]}, ${cross[1]}, ${cross[2]} \\rangle`,
              explicacion: 'El vector resultante es perpendicular al plano del paralelogramo.'
            },
            {
              titulo: 'Área Final',
              latex: `A = \\sqrt{${cross[0]}^2 + ${cross[1]}^2 + ${cross[2]}^2} = ${area} \\text{ u}^2`,
              explicacion: `La magnitud del producto vectorial da directamente el área buscada.`
            }
          ],
          resultado: {
            latex: `A_{\\text{paralelogramo}} = ${area} \\text{ u}^2`,
            texto: `Área del paralelogramo: ${area} unidades².`
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'AxB', componentes: cross, color: '#00ff88' }
            ]
          }
        };
      } else if (op === 'area_triangulo' && vectors.length >= 2) {
        const cross = vectorEngine.crossProduct(v1, v2);
        const area = Math.round(vectorEngine.magnitude(cross) / 2 * 1000) / 1000;
        verifiedData = {
          habla: `El área del triángulo cuyos lados son esos vectores es ${area} unidades cuadradas.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Fórmula del Área Triangular',
              latex: `A_{\\triangle} = \\frac{1}{2} \\|\\vec{A} \\times \\vec{B}\\|`,
              explicacion: 'El triángulo es la mitad del paralelogramo que forman los mismos vectores.'
            },
            {
              titulo: 'Resultado',
              latex: `A_{\\triangle} = \\frac{1}{2} \\cdot ${Math.round(vectorEngine.magnitude(cross) * 1000) / 1000} = ${area} \\text{ u}^2`,
              explicacion: `El área del triángulo es la mitad del paralelogramo.`
            }
          ],
          resultado: {
            latex: `A_{\\triangle} = ${area} \\text{ u}^2`,
            texto: `Área del triángulo: ${area} unidades².`
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' }
            ]
          }
        };
      } else if (op === 'volumen' && vectors.length >= 3) {
        const tsp = vectorEngine.tripleScalarProduct(v1, v2, v3);
        verifiedData = {
          habla: `El volumen del paralelepípedo definido por los tres vectores es de ${tsp.volume} unidades cúbicas.`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Producto Triple Escalar',
              latex: `V = |\\vec{A} \\cdot (\\vec{B} \\times \\vec{C})|`,
              explicacion: 'El volumen es el valor absoluto del triple producto escalar de los tres vectores.'
            },
            {
              titulo: 'Determinante 3×3',
              latex: `V = \\left|\\det\\begin{pmatrix} ${v1[0]} & ${v1[1]} & ${v1[2]} \\\\ ${v2[0]} & ${v2[1]} & ${v2[2]} \\\\ ${v3[0]} & ${v3[1]} & ${v3[2]} \\end{pmatrix}\\right| = ${tsp.volume}`,
              explicacion: `El determinante de la matriz formada por las componentes de los tres vectores.`
            }
          ],
          resultado: {
            latex: `V = ${tsp.volume} \\text{ u}^3`,
            texto: `Volumen del paralelepípedo: ${tsp.volume} unidades³.`
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'C', componentes: v3, color: '#00ff88' }
            ]
          }
        };
      } else if (op === 'distancia' && vectors.length >= 2) {
        const d = Math.round(vectorEngine.distance(v1, v2) * 1000) / 1000;
        const dx = v2[0] - v1[0];
        const dy = v2[1] - v1[1];
        const dz = v2[2] - v1[2];
        verifiedData = {
          habla: `La distancia euclidiana entre los dos puntos es de ${d} unidades.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Fórmula de Distancia Euclidiana en R³',
              latex: `d(A, B) = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}`,
              explicacion: 'Mide la longitud de la geodésica rectilínea que separa ambos puntos en el espacio tridimensional.'
            },
            {
              titulo: 'Diferencias por Eje Cartesiano',
              latex: `\\Delta x = ${v2[0]} - (${v1[0]}) = ${dx}, \\quad \\Delta y = ${v2[1]} - (${v1[1]}) = ${dy}, \\quad \\Delta z = ${v2[2]} - (${v1[2]}) = ${dz}`,
              explicacion: 'Proyecciones ortogonales de la distancia en cada dimensión.'
            },
            {
              titulo: 'Cálculo de la Magnitud Total',
              latex: `d = \\sqrt{(${dx})^2 + (${dy})^2 + (${dz})^2} = \\sqrt{${dx*dx + dy*dy + dz*dz}} = ${d}`,
              explicacion: `Suma de cuadrados de los catetos tridimensionales: ${dx*dx + dy*dy + dz*dz}.`
            }
          ],
          resultado: {
            latex: `d(A, B) = ${d}`,
            texto: `Distancia euclidiana: ${d} unidades.`
          },
          visualizacion: {
            tipo: 'resta',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' }
            ]
          }
        };
      } else if (op === 'punto_medio' && vectors.length >= 2) {
        const m = vectorEngine.midpoint(v1, v2);
        verifiedData = {
          habla: `El punto medio entre ambos vectores se ubica exactamente en (${m[0]}, ${m[1]}, ${m[2]}).`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Fórmula del Punto Medio',
              latex: `M = \\left( \\frac{x_1 + x_2}{2}, \\; \\frac{y_1 + y_2}{2}, \\; \\frac{z_1 + z_2}{2} \\right)`,
              explicacion: 'Promedio de las coordenadas homólogas de ambos puntos.'
            },
            {
              titulo: 'Evaluación Numérica',
              latex: `M = \\left( \\frac{${v1[0]} + (${v2[0]})}{2}, \\; \\frac{${v1[1]} + (${v2[1]})}{2}, \\; \\frac{${v1[2]} + (${v2[2]})}{2} \\right) = (${m[0]}, \\; ${m[1]}, \\; ${m[2]})`,
              explicacion: 'Punto que divide el segmento en dos partes exactamente iguales.'
            }
          ],
          resultado: {
            latex: `M = (${m[0]}, ${m[1]}, ${m[2]})`,
            texto: `Punto medio: (${m[0]}, ${m[1]}, ${m[2]}).`
          },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'M', componentes: m, color: '#10b981' }
            ]
          }
        };
      } else if (op === 'cosenos_directores' && vectors.length >= 1) {
        const cd = vectorEngine.directionCosines(v1);
        const mag = Math.round(vectorEngine.magnitude(v1) * 1000) / 1000;
        verifiedData = {
          habla: `Los cosenos directores son (${cd.cosAlpha}, ${cd.cosBeta}, ${cd.cosGamma}), con ángulos directores de ${cd.alphaDeg} grados con X, ${cd.betaDeg} grados con Y y ${cd.gammaDeg} grados con Z.`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Definición de Cosenos Directores',
              latex: `\\cos\\alpha = \\frac{x}{\\|\\vec{v}\\|}, \\quad \\cos\\beta = \\frac{y}{\\|\\vec{v}\\|}, \\quad \\cos\\gamma = \\frac{z}{\\|\\vec{v}\\|}`,
              explicacion: 'Representan la orientación angular del vector respecto a los tres semiejes cartesianos.'
            },
            {
              titulo: 'Evaluación de Ángulos',
              latex: `\\alpha = \\arccos(${cd.cosAlpha}) = ${cd.alphaDeg}^\\circ, \\; \\beta = ${cd.betaDeg}^\\circ, \\; \\gamma = ${cd.gammaDeg}^\\circ`,
              explicacion: 'Verificación de la relación fundamental: cos²(α) + cos²(β) + cos²(γ) = 1.'
            }
          ],
          resultado: {
            latex: `(\\cos\\alpha, \\cos\\beta, \\cos\\gamma) = (${cd.cosAlpha}, ${cd.cosBeta}, ${cd.cosGamma})`,
            texto: `Ángulos directores: α = ${cd.alphaDeg}°, β = ${cd.betaDeg}°, γ = ${cd.gammaDeg}°.`
          },
          visualizacion: {
            tipo: 'escalar',
            vectores: [{ nombre: 'v', componentes: v1, color: '#00f0ff' }]
          }
        };
      } else if (op === 'recta' && vectors.length >= 2) {
        const line = vectorEngine.lineEquations(v1, v2);
        verifiedData = {
          habla: `La recta en el espacio que pasa por el punto inicial con el vector director tiene ecuación vectorial paramétrica r de t.`,
          emocion: 'explicando',
          pasos: [
            {
              titulo: 'Ecuación Vectorial Continua',
              latex: line.vectorial,
              explicacion: 'Ecuación que traza la recta completa conforme el parámetro t recorre los números reales.'
            },
            {
              titulo: 'Forma Simétrica',
              latex: line.symmetric,
              explicacion: 'Ecuaciones continuas de la recta en coordenadas cartesianas.'
            }
          ],
          resultado: {
            latex: line.vectorial,
            texto: `Recta en R³: pasa por (${v1.join(', ')}) con dirección (${v2.join(', ')}).`
          },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'P0', componentes: v1, color: '#00f0ff' },
              { nombre: 'v', componentes: v2, color: '#ffaa00' }
            ]
          }
        };
      } else if (op === 'plano' && vectors.length >= 2) {
        const plane = vectorEngine.planeEquation(v1, v2);
        verifiedData = {
          habla: `El plano en el espacio ortogonal al vector normal dado tiene ecuación general: ${plane.equationLatex}.`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Ecuación Punto-Normal del Plano',
              latex: `\\vec{n} \\cdot (\\vec{r} - \\vec{r}_0) = 0 \\implies A(x - x_0) + B(y - y_0) + C(z - z_0) = 0`,
              explicacion: 'Todo vector en el plano es rigurosamente perpendicular a su vector normal.'
            },
            {
              titulo: 'Forma Cartesiana General',
              latex: plane.equationLatex,
              explicacion: 'Ecuación canónica Ax + By + Cz + D = 0 del plano en tres dimensiones.'
            }
          ],
          resultado: {
            latex: plane.equationLatex,
            texto: `Ecuación del plano: ${plane.equationLatex}.`
          },
          visualizacion: {
            tipo: 'producto_cruz',
            vectores: [
              { nombre: 'P0', componentes: v1, color: '#00f0ff' },
              { nombre: 'n', componentes: v2, color: '#ff0077' }
            ]
          }
        };
      } else if (op === 'triple_vectorial' && vectors.length >= 3) {
        const tvp = vectorEngine.tripleVectorProduct(v1, v2, v3);
        verifiedData = {
          habla: `Por la identidad BAC-CAB, el triple producto vectorial da el vector (${tvp.result[0]}, ${tvp.result[1]}, ${tvp.result[2]}).`,
          emocion: 'enfasis',
          pasos: [
            {
              titulo: 'Identidad de Lagrange (Regla BAC-CAB)',
              latex: `\\vec{A} \\times (\\vec{B} \\times \\vec{C}) = (\\vec{A} \\cdot \\vec{C})\\vec{B} - (\\vec{A} \\cdot \\vec{B})\\vec{C}`,
              explicacion: 'El vector resultante reside estrictamente en el plano formado por los vectores B y C.'
            },
            {
              titulo: 'Vector Resultante Final',
              latex: `\\vec{R} = \\langle ${tvp.result[0]}, ${tvp.result[1]}, ${tvp.result[2]} \\rangle`,
              explicacion: 'Resultado analítico simplificado.'
            }
          ],
          resultado: {
            latex: `\\vec{A} \\times (\\vec{B} \\times \\vec{C}) = \\langle ${tvp.result[0]}, ${tvp.result[1]}, ${tvp.result[2]} \\rangle`,
            texto: `Triple producto vectorial: (${tvp.result[0]}, ${tvp.result[1]}, ${tvp.result[2]}).`
          },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'A', componentes: v1, color: '#00f0ff' },
              { nombre: 'B', componentes: v2, color: '#ffaa00' },
              { nombre: 'C', componentes: v3, color: '#10b981' }
            ]
          }
        };
      } else if (op === 'esfericas' && vectors.length >= 1) {
        const sph = vectorEngine.spherical(v1);
        verifiedData = {
          habla: `En coordenadas esféricas: radio rho ${sph.rho}, ángulo azimutal theta ${sph.thetaDeg} grados y polar phi ${sph.phiDeg} grados.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Conversión a Coordenadas Esféricas',
              latex: `\\rho = \\sqrt{x^2 + y^2 + z^2}, \\quad \\theta = \\arctan(y/x), \\quad \\phi = \\arccos(z/\\rho)`,
              explicacion: 'Transformación del sistema euclidiano rectangular al sistema esférico.'
            },
            {
              titulo: 'Coordenadas Calculadas',
              latex: `\\rho = ${sph.rho}, \\quad \\theta = ${sph.thetaDeg}^\\circ, \\quad \\phi = ${sph.phiDeg}^\\circ`,
              explicacion: 'Terna ordenada esférica (ρ, θ, φ).'
            }
          ],
          resultado: {
            latex: `(\\rho, \\theta, \\phi) = (${sph.rho}, ${sph.thetaDeg}^\\circ, ${sph.phiDeg}^\\circ)`,
            texto: `Esféricas: ρ = ${sph.rho}, θ = ${sph.thetaDeg}°, φ = ${sph.phiDeg}°.`
          },
          visualizacion: {
            tipo: 'escalar',
            vectores: [{ nombre: 'P', componentes: v1, color: '#00f0ff' }]
          }
        };
      } else if (op === 'cilindricas' && vectors.length >= 1) {
        const cyl = vectorEngine.cylindrical(v1);
        verifiedData = {
          habla: `En coordenadas cilíndricas: radio r ${cyl.r}, ángulo theta ${cyl.thetaDeg} grados y cota vertical z ${cyl.z}.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Conversión a Coordenadas Cilíndricas',
              latex: `r = \\sqrt{x^2 + y^2}, \\quad \\theta = \\arctan(y/x), \\quad z = z`,
              explicacion: 'Transformación polar en el plano XY conservando la cota vertical Z.'
            },
            {
              titulo: 'Coordenadas Calculadas',
              latex: `r = ${cyl.r}, \\quad \\theta = ${cyl.thetaDeg}^\\circ, \\quad z = ${cyl.z}`,
              explicacion: 'Terna ordenada cilíndrica (r, θ, z).'
            }
          ],
          resultado: {
            latex: `(r, \\theta, z) = (${cyl.r}, ${cyl.thetaDeg}^\\circ, ${cyl.z})`,
            texto: `Cilíndricas: r = ${cyl.r}, θ = ${cyl.thetaDeg}°, z = ${cyl.z}.`
          },
          visualizacion: {
            tipo: 'escalar',
            vectores: [{ nombre: 'P', componentes: v1, color: '#00f0ff' }]
          }
        };
      }

      if (verifiedData) {
        return {
          ...verifiedData,
          sugerencias: llmResponse?.sugerencias || ['¿Cómo calcular el vector unitario?', '¿Cuál es su ángulo?'],
          _meta: {
            ...llmResponse?._meta,
            verifiedByMathEngine: true
          }
        };
      }
    } catch (err) {
      console.warn('Advertencia en el motor matemático:', err.message);
    }

    return this.ensureFormat(llmResponse);
  }

  ensureFormat(resp) {
    if (!resp) return {};
    return {
      habla: resp.habla || 'Procedimiento completado.',
      emocion: resp.emocion || 'neutral',
      pasos: Array.isArray(resp.pasos) ? resp.pasos : [],
      resultado: resp.resultado || { latex: '', texto: '' },
      visualizacion: resp.visualizacion || { tipo: 'ninguna', vectores: [] },
      sugerencias: Array.isArray(resp.sugerencias) ? resp.sugerencias : [],
      _meta: resp._meta || {}
    };
  }
}

export const stepGenerator = new StepGenerator();
