// ========================================================
// VECTRA // ADVANCED UNIVERSITY & ORAL EXAM MATHEMATICS MODULE
// Linear Algebra, Physics Vectors, Sets & Logic, Euclidean Geometry,
// and Professor Oral Examination Concepts
// ========================================================

export class AdvancedMathModules {
  /**
   * 1. ÁLGEBRA LINEAL AVANZADA (Sistemas 2x2 Cramer, Autovalores, Rango, Bases)
   */
  solveLinearAlgebra(norm, replaced) {
    // A) SISTEMAS DE ECUACIONES LINEALES 2x2 POR REGLA DE CRAMER
    // Patrones: "sistema 2x + 3y = 7 y 4x - y = 5", "resolver sistema de ecuaciones..."
    const sysMatch = replaced.match(/(-?\d+)?\s*x\s*([\+\-])\s*(\d+)?\s*y\s*=\s*(-?\d+)[\s,yentonces]+(-?\d+)?\s*x\s*([\+\-])\s*(\d+)?\s*y\s*=\s*(-?\d+)/i);
    if (sysMatch) {
      const a1 = sysMatch[1] ? (sysMatch[1] === '-' ? -1 : parseFloat(sysMatch[1])) : 1;
      const s1 = sysMatch[2];
      const b1 = (sysMatch[3] ? parseFloat(sysMatch[3]) : 1) * (s1 === '-' ? -1 : 1);
      const c1 = parseFloat(sysMatch[4]);

      const a2 = sysMatch[5] ? (sysMatch[5] === '-' ? -1 : parseFloat(sysMatch[5])) : 1;
      const s2 = sysMatch[6];
      const b2 = (sysMatch[7] ? parseFloat(sysMatch[7]) : 1) * (s2 === '-' ? -1 : 1);
      const c2 = parseFloat(sysMatch[8]);

      const det = a1 * b2 - a2 * b1;
      if (Math.abs(det) < 0.0001) {
        return {
          habla: 'El determinante del sistema es igual a cero, lo que significa que el sistema no tiene solución única; puede ser incompatible o indeterminado.',
          emocion: 'duda',
          pasos: [
            {
              titulo: 'Determinante Principal',
              latex: `\\Delta = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = (${a1})(${b2}) - (${a2})(${b1}) = 0`,
              explicacion: 'Cuando el determinante principal vale cero, las rectas asociadas son paralelas o coincidentes.'
            }
          ],
          resultado: { latex: `\\Delta = 0`, texto: 'Sistema sin solución única (det = 0).' },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }

      const detX = c1 * b2 - c2 * b1;
      const detY = a1 * c2 - a2 * c1;
      const x = Math.round((detX / det) * 1000) / 1000;
      const y = Math.round((detY / det) * 1000) / 1000;

      return {
        habla: `Resolviendo el sistema lineal dos por dos por la Regla de Cramer, el valor de x es ${x} y el valor de y es ${y}.`,
        emocion: 'feliz',
        pasos: [
          {
            titulo: 'Paso 1: Matriz del Sistema y Determinante Principal (Δ)',
            latex: `\\begin{cases} ${a1}x ${b1 >= 0 ? '+' : ''}${b1}y = ${c1} \\\\ ${a2}x ${b2 >= 0 ? '+' : ''}${b2}y = ${c2} \\end{cases} \\implies \\Delta = \\begin{vmatrix} ${a1} & ${b1} \\\\ ${a2} & ${b2} \\end{vmatrix} = ${det}`,
            explicacion: `Multiplicamos la diagonal principal menos la diagonal secundaria: (${a1})(${b2}) - (${a2})(${b1}) = ${det}.`
          },
          {
            titulo: 'Paso 2: Determinante de X (Δx) y Cálculo de x',
            latex: `\\Delta_x = \\begin{vmatrix} ${c1} & ${b1} \\\\ ${c2} & ${b2} \\end{vmatrix} = ${detX} \\implies x = \\frac{\\Delta_x}{\\Delta} = \\frac{${detX}}{${det}} = ${x}`,
            explicacion: `Sustituimos la columna de las x por los términos independientes y dividimos entre el determinante principal.`
          },
          {
            titulo: 'Paso 3: Determinante de Y (Δy) y Cálculo de y',
            latex: `\\Delta_y = \\begin{vmatrix} ${a1} & ${c1} \\\\ ${a2} & ${c2} \\end{vmatrix} = ${detY} \\implies y = \\frac{\\Delta_y}{\\Delta} = \\frac{${detY}}{${det}} = ${y}`,
            explicacion: `Sustituimos la columna de las y por los términos independientes y dividimos entre el determinante principal.`
          }
        ],
        resultado: {
          latex: `x = ${x}, \\quad y = ${y}`,
          texto: `Punto de intersección único: (${x}, ${y}).`
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // B) AUTOVALORES / VALORES PROPIOS (EIGENVALUES)
    if (norm.includes('valor propio') || norm.includes('valores propios') || norm.includes('eigenvalor') || norm.includes('autovalor')) {
      return {
        habla: 'Los valores propios o autovalores de una matriz cuadrada son escalares lambda que satisfacen la ecuación característica: determinante de A menos lambda por la matriz identidad igual a cero.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Ecuación Fundamental de Autovalores',
            latex: `A \\vec{v} = \\lambda \\vec{v} \\iff (A - \\lambda I)\\vec{v} = \\vec{0}`,
            explicacion: 'Indica que la transformación lineal A solo escala al vector v sin cambiar su dirección de acción.'
          },
          {
            titulo: 'Polinomio Característico',
            latex: `p(\\lambda) = \\det(A - \\lambda I) = 0`,
            explicacion: 'Para una matriz 2x2 con traza tr(A) y determinante det(A), el polinomio es: λ² - tr(A)·λ + det(A) = 0.'
          },
          {
            titulo: 'Espacios Propios y Autovectores',
            latex: `E_\\lambda = \\ker(A - \\lambda I)`,
            explicacion: 'Cada autovalor tiene asociado al menos un autovector no nulo que genera el subespacio propio correspondiente.'
          }
        ],
        resultado: {
          latex: `\\det(A - \\lambda I) = 0`,
          texto: 'Los autovalores son las raíces del polinomio característico de la matriz.'
        },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // C) DESCOMPOSICIÓN LU
    if (norm.includes('descomposicion lu') || norm.includes('factorizacion lu')) {
      return {
        habla: 'La descomposición LU factoriza una matriz cuadrada A como el producto de una matriz triangular inferior L con unos en la diagonal, y una matriz triangular superior U.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Estructura de la Factorización',
            latex: `A = L \\cdot U = \\begin{pmatrix} 1 & 0 \\\\ l_{21} & 1 \\end{pmatrix} \\begin{pmatrix} u_{11} & u_{12} \\\\ 0 & u_{22} \\end{pmatrix}`,
            explicacion: 'L contiene los multiplicadores de la eliminación de Gauss y U es la matriz resultante en forma escalonada.'
          },
          {
            titulo: 'Resolución Rápida de Sistemas Ax = b',
            latex: `L \\vec{y} = \\vec{b} \\quad \\text{y luego} \\quad U \\vec{x} = \\vec{y}`,
            explicacion: 'Permite resolver múltiples sistemas con la misma matriz de coeficientes en tiempo lineal por sustitución progresiva y regresiva.'
          }
        ],
        resultado: { latex: `A = L \\cdot U`, texto: 'Factorización LU: A = L · U con L triangular inferior y U triangular superior.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // D) INDEPENDENCIA LINEAL
    if (norm.includes('independencia lineal') || norm.includes('linealmente independientes') || norm.includes('linealmente dependientes')) {
      return {
        habla: 'Un conjunto de vectores es linealmente independiente si la única combinación lineal que da como resultado el vector nulo es aquella en la que todos los coeficientes escalares son iguales a cero.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Condición de Independencia Lineal',
            latex: `c_1 \\vec{v}_1 + c_2 \\vec{v}_2 + \\dots + c_k \\vec{v}_k = \\vec{0} \\implies c_1 = c_2 = \\dots = c_k = 0`,
            explicacion: 'Si existe alguna solución donde al menos un escalar no sea cero, los vectores son linealmente dependientes (uno se puede escribir en términos de los otros).'
          },
          {
            titulo: 'Criterio por Determinante',
            latex: `\\det\\begin{pmatrix} | & | & | \\\\ \\vec{v}_1 & \\vec{v}_2 & \\dots \\\\ | & | & | \\end{pmatrix} \\neq 0 \\iff \\text{Independientes}`,
            explicacion: 'En R^n, n vectores son independientes si y sólo si el determinante formado por sus columnas es distinto de cero.'
          }
        ],
        resultado: { latex: `\\sum c_i \\vec{v}_i = \\vec{0} \\implies c_i = 0`, texto: 'Vectores linealmente independientes no tienen redundancia espacial.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // E) ESPACIO VECTORIAL Y SUBESPACIOS
    if (norm.includes('espacio vectorial') || norm.includes('subespacio vectorial') || norm.includes('axiomas de espacio vectorial')) {
      return {
        habla: 'Un espacio vectorial es una estructura algebraica formada por un conjunto de elementos llamados vectores, sobre los que se definen dos operaciones: suma vectorial y multiplicación por escalar, satisfaciendo diez axiomas fundamentales.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Propiedades de Cerradura',
            latex: `\\vec{u}, \\vec{v} \\in V \\implies \\vec{u} + \\vec{v} \\in V \\quad \\text{y} \\quad c \\in \\mathbb{K}, \\vec{u} \\in V \\implies c\\vec{u} \\in V`,
            explicacion: 'La suma de vectores y la multiplicación por cualquier escalar deben permanecer dentro del mismo espacio.'
          },
          {
            titulo: 'Criterio para Subespacio Vectorial',
            latex: `1)\\; \\vec{0} \\in W, \\quad 2)\\; \\vec{u}+\\vec{v} \\in W, \\quad 3)\\; c\\vec{u} \\in W`,
            explicacion: 'Un subconjunto W es un subespacio si contiene al vector nulo y es cerrado bajo sumas y combinaciones lineales.'
          }
        ],
        resultado: { latex: `V = (V, +, \\cdot, \\mathbb{K})`, texto: 'Estructura algebraica con 10 axiomas de suma y producto escalar.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // F) BASE Y DIMENSIÓN
    if (norm.includes('base de un espacio') || norm.includes('base canonica') || norm.includes('dimension de un espacio')) {
      return {
        habla: 'Una base de un espacio vectorial es un conjunto de vectores que es simultáneamente linealmente independiente y capaz de generar todo el espacio. La dimensión es el número de vectores que componen cualquier base.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Definición de Base',
            latex: `B = \\{\\vec{v}_1, \\vec{v}_2, \\dots, \\vec{v}_n\\}: \\quad \\text{1. } \\text{Span}(B) = V, \\quad \\text{2. } B \\text{ es L.I.}`,
            explicacion: 'Todo vector del espacio se puede escribir como combinación lineal única de los vectores de la base.'
          },
          {
            titulo: 'Base Canónica de R³',
            latex: `\\hat{i} = \\begin{pmatrix} 1 \\\\ 0 \\\\ 0 \\end{pmatrix}, \\quad \\hat{j} = \\begin{pmatrix} 0 \\\\ 1 \\\\ 0 \\end{pmatrix}, \\quad \\hat{k} = \\begin{pmatrix} 0 \\\\ 0 \\\\ 1 \\end{pmatrix} \\implies \\dim(\\mathbb{R}^3) = 3`,
            explicacion: 'Los vectores unitarios directores forman la base canónica ortonormal estándar de R³.'
          }
        ],
        resultado: { latex: `\\dim(V) = |B|`, texto: 'Base = conjunto generador mínimo e independiente. Dimensión = número de vectores.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // G) RANGO Y NÚCLEO (TEOREMA DE LA DIMENSIÓN)
    if (norm.includes('rango de una matriz') || norm.includes('nucleo de una') || norm.includes('teorema de dimension') || norm.includes('nulidad')) {
      return {
        habla: 'El rango de una matriz es el número máximo de filas o columnas linealmente independientes. El Teorema de la Dimensión establece que el rango más la nulidad de una matriz es igual al número total de columnas.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Teorema del Rango-Nulidad',
            latex: `\\text{rango}(A) + \\text{nulidad}(A) = n \\quad (\\text{columnas de } A)`,
            explicacion: 'La nulidad es la dimensión del núcleo o kernel (conjunto de soluciones a Ax = 0).'
          },
          {
            titulo: 'Definición del Núcleo (Kernel)',
            latex: `\\ker(A) = \\{\\vec{x} \\in \\mathbb{R}^n : A\\vec{x} = \\vec{0}\\}`,
            explicacion: 'El núcleo siempre contiene al menos al vector cero. Si solo contiene al vector cero, la matriz es inyectiva y tiene rango completo.'
          }
        ],
        resultado: { latex: `\\text{rank}(A) + \\dim(\\ker(A)) = n`, texto: 'Rango + Nulidad = número de columnas de la matriz.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // H) PROCESO DE GRAM-SCHMIDT
    if (norm.includes('gram schmidt') || norm.includes('ortonormalizacion') || norm.includes('base ortonormal')) {
      return {
        habla: 'El proceso de ortogonalización de Gram-Schmidt toma una base arbitraria de vectores y construye secuencialmente una base ortogonal u ortonormal que genera el mismo espacio.',
        emocion: 'explicando',
        pasos: [
          {
            titulo: 'Algoritmo de Gram-Schmidt',
            latex: `\\vec{u}_1 = \\vec{v}_1, \\quad \\vec{u}_2 = \\vec{v}_2 - \\frac{\\vec{v}_2 \\cdot \\vec{u}_1}{\\|\\vec{u}_1\\|^2}\\vec{u}_1`,
            explicacion: 'A cada nuevo vector le restamos su proyección sobre todos los vectores ortogonales calculados previamente.'
          },
          {
            titulo: 'Normalización a Vectores Unitarios',
            latex: `\\vec{e}_k = \\frac{\\vec{u}_k}{\\|\\vec{u}_k\\|} \\implies \\vec{e}_i \\cdot \\vec{e}_j = \\delta_{ij}`,
            explicacion: 'Dividiendo cada vector entre su magnitud obtenemos una base ortonormal donde los vectores tienen longitud uno y ángulo de 90 grados entre sí.'
          }
        ],
        resultado: { latex: `\\vec{e}_i \\cdot \\vec{e}_j = \\begin{cases} 1 & i = j \\\\ 0 & i \\neq j \\end{cases}`, texto: 'Gram-Schmidt transforma una base cualquiera en una base ortonormal.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  /**
   * 2. FÍSICA VECTORIAL AVANZADA (Torque r x F, Ley de Newton, Coulomb, Plano Inclinado)
   */
  solvePhysicsVectors(norm, replaced) {
    // A) MOMENTO DE UNA FUERZA O TORQUE (r x F)
    if (norm.includes('torque') || norm.includes('momento de una fuerza') || norm.includes('momento de fuerza')) {
      // Detección de números en la pregunta: ej "fuerza 10 distancia 2 angulo 90"
      const fMatch = replaced.match(/fuerza\s*(?:de)?\s*(\d+)/);
      const rMatch = replaced.match(/(?:brazo|distancia|radio|posicion)\s*(?:de)?\s*(\d+)/);
      const angMatch = replaced.match(/(?:angulo|grados)\s*(?:de)?\s*(\d+)/);

      if (fMatch && rMatch) {
        const F = parseFloat(fMatch[1]);
        const r = parseFloat(rMatch[1]);
        const angDeg = angMatch ? parseFloat(angMatch[1]) : 90;
        const angRad = (angDeg * Math.PI) / 180;
        const torque = Math.round(r * F * Math.sin(angRad) * 100) / 100;

        return {
          habla: `El momento de torsión o torque resultante es de ${torque} Newtons por metro.`,
          emocion: 'feliz',
          pasos: [
            {
              titulo: 'Definición Vectorial del Torque',
              latex: `\\vec{\\tau} = \\vec{r} \\times \\vec{F}`,
              explicacion: 'El torque es el producto vectorial entre el vector de posición del punto de aplicación y el vector fuerza.'
            },
            {
              titulo: 'Cálculo de la Magnitud Escalar',
              latex: `\\|\\vec{\\tau}\\| = r \\cdot F \\cdot \\sin\\theta = (${r}\\,\\text{m})(${F}\\,\\text{N})\\sin(${angDeg}^\\circ) = ${torque}\\,\\text{N}\\cdot\\text{m}`,
              explicacion: `Multiplicamos el brazo de palanca ${r} m por la fuerza ${F} N por el seno del ángulo (${angDeg}°).`
            }
          ],
          resultado: { latex: `\\tau = ${torque}\\,\\text{N}\\cdot\\text{m}`, texto: `Torque calculado: ${torque} N·m.` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }

      return {
        habla: 'El momento de una fuerza o torque mide la tendencia de una fuerza a producir una rotación alrededor de un eje. Vectorialmente es el producto cruz del vector posición por el vector fuerza.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Definición Vectorial', latex: `\\vec{\\tau} = \\vec{r} \\times \\vec{F}`, explicacion: 'Su dirección es perpendicular al plano de giro, siguiendo la regla de la mano derecha.' },
          { titulo: 'Módulo Escalar', latex: `\\tau = r F \\sin\\theta`, explicacion: 'El torque es máximo cuando la fuerza es perpendicular al brazo (90 grados) y es cero si la fuerza pasa por el eje de giro.' }
        ],
        resultado: { latex: `\\vec{\\tau} = \\vec{r} \\times \\vec{F}`, texto: 'Torque: medida de rotación vectorial en Newtons por metro.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // B) TRABAJO MECÁNICO (W = F · d)
    if (norm.includes('trabajo mecanico') || norm.includes('calcular trabajo') || (norm.includes('trabajo') && norm.includes('fuerza'))) {
      const fMatch = replaced.match(/fuerza\s*(?:de)?\s*(\d+)/);
      const dMatch = replaced.match(/(?:distancia|desplazamiento)\s*(?:de)?\s*(\d+)/);
      if (fMatch && dMatch) {
        const F = parseFloat(fMatch[1]);
        const d = parseFloat(dMatch[1]);
        const W = F * d;
        return {
          habla: `El trabajo mecánico realizado por la fuerza es de ${W} Joules.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Producto Escalar de Trabajo', latex: `W = \\vec{F} \\cdot \\vec{d} = F \\cdot d \\cdot \\cos\\theta`, explicacion: 'El trabajo es una magnitud escalar calculada como el producto punto de la fuerza y el desplazamiento.' },
            { titulo: 'Cálculo Numérico', latex: `W = (${F}\\,\\text{N})(${d}\\,\\text{m}) = ${W}\\,\\text{J}`, explicacion: `Multiplicamos la fuerza de ${F} N por el desplazamiento de ${d} metros.` }
          ],
          resultado: { latex: `W = ${W}\\,\\text{Joules}`, texto: `Trabajo: ${W} J.` },
          visualizacion: { tipo: 'ninguna', vectores: [] }
        };
      }
    }

    // C) DESCOMPOSICIÓN DE FUERZAS EN COMPONENTES (Fx = F cos θ, Fy = F sin θ)
    if (norm.includes('componentes de una fuerza') || norm.includes('descomponer fuerza') || (norm.includes('fuerza') && norm.includes('angulo'))) {
      const fMatch = replaced.match(/fuerza\s*(?:de)?\s*(\d+)/);
      const angMatch = replaced.match(/(?:angulo|inclinacion)\s*(?:de)?\s*(\d+)/);
      if (fMatch && angMatch) {
        const F = parseFloat(fMatch[1]);
        const ang = parseFloat(angMatch[1]);
        const rad = (ang * Math.PI) / 180;
        const fx = Math.round(F * Math.cos(rad) * 100) / 100;
        const fy = Math.round(F * Math.sin(rad) * 100) / 100;
        return {
          habla: `La fuerza de ${F} Newtons descompuesta tiene componente horizontal Fx de ${fx} Newtons y vertical Fy de ${fy} Newtons.`,
          emocion: 'feliz',
          pasos: [
            { titulo: 'Componente Horizontal (Fx)', latex: `F_x = F \\cos\\theta = ${F} \\cos(${ang}^\\circ) = ${fx}\\,\\text{N}`, explicacion: 'Proyección sobre el eje horizontal o de las abscisas.' },
            { titulo: 'Componente Vertical (Fy)', latex: `F_y = F \\sin\\theta = ${F} \\sin(${ang}^\\circ) = ${fy}\\,\\text{N}`, explicacion: 'Proyección sobre el eje vertical o de las ordenadas.' },
            { titulo: 'Forma Vectorial', latex: `\\vec{F} = ${fx}\\hat{i} + ${fy}\\hat{j}\\,\\text{N}`, explicacion: 'La fuerza expresada en la base canónica estándar.' }
          ],
          resultado: { latex: `\\vec{F} = (${fx}, ${fy})\\,\\text{N}`, texto: `Componentes: Fx = ${fx} N, Fy = ${fy} N.` },
          visualizacion: {
            tipo: 'suma',
            vectores: [
              { nombre: 'F', componentes: [fx, fy, 0], color: '#ff6b35' },
              { nombre: 'Fx', componentes: [fx, 0, 0], color: '#00f5ff' },
              { nombre: 'Fy', componentes: [0, fy, 0], color: '#7fff00' }
            ]
          }
        };
      }
    }

    // D) PLANO INCLINADO
    if (norm.includes('plano inclinado') || norm.includes('fuerza normal')) {
      return {
        habla: 'En un plano inclinado con ángulo theta, el peso se descompone en una componente paralela a la rampa mg seno de theta que causa la aceleración, y una componente perpendicular mg coseno de theta que equilibra a la fuerza normal.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Componentes del Peso', latex: `P_\\parallel = m g \\sin\\theta, \\quad P_\\perp = m g \\cos\\theta`, explicacion: 'La componente paralela tira hacia abajo del plano y la perpendicular comprime la superficie.' },
          { titulo: 'Fuerza Normal y Fricción', latex: `N = m g \\cos\\theta, \\quad f_r = \\mu N = \\mu m g \\cos\\theta`, explicacion: 'La fuerza de fricción o rozamiento se opone al movimiento y es proporcional a la normal.' }
        ],
        resultado: { latex: `a = g(\\sin\\theta - \\mu\\cos\\theta)`, texto: 'Aceleración neta en el plano inclinado.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // E) LEY DE COULOMB Y CAMPO ELÉCTRICO
    if (norm.includes('ley de coulomb') || norm.includes('campo electrico')) {
      return {
        habla: 'La Ley de Coulomb establece que la fuerza electrostática entre dos cargas puntuales es directamente proporcional al producto de sus cargas e inversamente proporcional al cuadrado de la distancia que las separa.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Forma Vectorial de la Ley de Coulomb', latex: `\\vec{F}_{12} = \\frac{1}{4\\pi\\varepsilon_0} \\frac{q_1 q_2}{r^2} \\hat{r}_{12} = k_e \\frac{q_1 q_2}{r^2} \\hat{r}`, explicacion: 'Donde k es la constante de Coulomb, aproximadamente 8.99 por 10 a la nueve Newtons por metro cuadrado sobre Coulomb cuadrado.' },
          { titulo: 'Vector Campo Eléctrico', latex: `\\vec{E} = \\frac{\\vec{F}}{q_0} = k_e \\frac{q}{r^2} \\hat{r}`, explicacion: 'El campo eléctrico es una fuerza por unidad de carga de prueba.' }
        ],
        resultado: { latex: `F = k_e \\frac{|q_1 q_2|}{r^2}`, texto: 'Fuerza electrostática en Newtons.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  /**
   * 3. LÓGICA MATEMÁTICA Y TEORÍA DE CONJUNTOS
   */
  solveSetsLogic(norm, replaced) {
    // A) OPERACIONES CON CONJUNTOS (UNIÓN, INTERSECCIÓN, CARDINALIDAD)
    if (norm.includes('union de conjuntos') || norm.includes('interseccion de conjuntos') || norm.includes('diferencia de conjuntos') || norm.includes('diagrama de venn')) {
      return {
        habla: 'En la teoría de conjuntos, la unión agrupa todos los elementos de ambos conjuntos, la intersección contiene exclusivamente los elementos comunes, y la diferencia contiene los elementos que pertenecen al primero pero no al segundo.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Unión de Conjuntos (A ∪ B)', latex: `A \\cup B = \\{x : x \\in A \\lor x \\in B\\}`, explicacion: 'Elementos que pertenecen al conjunto A, o al conjunto B, o a ambos.' },
          { titulo: 'Intersección de Conjuntos (A ∩ B)', latex: `A \\cap B = \\{x : x \\in A \\land x \\in B\\}`, explicacion: 'Elementos compartidos simultáneamente por ambos conjuntos.' },
          { titulo: 'Principio de Inclusión-Exclusión', latex: `|A \\cup B| = |A| + |B| - |A \\cap B|`, explicacion: 'Para contar el total sin duplicar la intersección compartida.' }
        ],
        resultado: { latex: `A \\cup B, \\quad A \\cap B, \\quad A \\setminus B`, texto: 'Operaciones fundamentales de conjuntos.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // B) LEYES DE DE MORGAN
    if (norm.includes('de morgan') || norm.includes('leyes de morgan')) {
      return {
        habla: 'Las Leyes de De Morgan establecen la relación dual entre la unión y la intersección bajo la operación de complemento: el complemento de la unión es la intersección de los complementos.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Primera Ley de De Morgan', latex: `(A \\cup B)^c = A^c \\cap B^c`, explicacion: 'El complemento de la unión es igual a la intersección de los complementos individuales.' },
          { titulo: 'Segunda Ley de De Morgan', latex: `(A \\cap B)^c = A^c \\cup B^c`, explicacion: 'El complemento de la intersección es igual a la unión de los complementos individuales.' }
        ],
        resultado: { latex: `\\neg(p \\lor q) \\equiv \\neg p \\land \\neg q`, texto: 'Equivalencias lógicas de De Morgan.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // C) TABLAS DE VERDAD Y PROPOSICIONES
    if (norm.includes('tabla de verdad') || norm.includes('tautologia') || norm.includes('contradiccion') || norm.includes('implicacion logica')) {
      return {
        habla: 'En lógica proposicional, una tabla de verdad evalúa el valor de verdad de una fórmula para todas las posibles combinaciones de sus variables. Una tautología siempre es verdadera, una contradicción siempre es falsa, y una contingencia depende de las entradas.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Condicional Lógico (Implicación)', latex: `p \\implies q \\equiv \\neg p \\lor q`, explicacion: 'La implicación p entonces q sólo es falsa cuando el antecedente p es verdadero y el consecuente q es falso.' },
          { titulo: 'Bicondicional (Doble Implicación)', latex: `p \\iff q \\equiv (p \\implies q) \\land (q \\implies p)`, explicacion: 'Es verdadero cuando ambas proposiciones tienen el mismo valor de verdad.' }
        ],
        resultado: { latex: `p \\implies q \\equiv \\neg p \\lor q`, texto: 'Tautología: siempre verdadero; Contradicción: siempre falso.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  /**
   * 4. GEOMETRÍA EUCLIDIANA Y CÁLCULOS NUMÉRICOS (Áreas, Volúmenes, Pitágoras Numérico)
   */
  solveEuclidean(norm, replaced) {
    // A) PITÁGORAS CON NÚMEROS: "hipotenusa catetos 3 y 4", "hipotenusa de 6 y 8"
    const pythHypMatch = replaced.match(/(?:hipotenusa|calcular hipotenusa).*?(?:cateto[s]?|lados)?\s*(\d+)\s*(?:y|con|,)\s*(\d+)/i);
    if (pythHypMatch) {
      const a = parseFloat(pythHypMatch[1]);
      const b = parseFloat(pythHypMatch[2]);
      const c = Math.round(Math.sqrt(a * a + b * b) * 1000) / 1000;
      return {
        habla: `Aplicando el Teorema de Pitágoras con catetos ${a} y ${b}, la hipotenusa mide exactamente ${c}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Fórmula de Pitágoras', latex: `c = \\sqrt{a^2 + b^2}`, explicacion: 'La hipotenusa es la raíz cuadrada de la suma de los cuadrados de los catetos.' },
          { titulo: 'Sustitución y Cuadrados', latex: `c = \\sqrt{${a}^2 + ${b}^2} = \\sqrt{${a*a} + ${b*b}} = \\sqrt{${a*a + b*b}}`, explicacion: `Calculamos ${a} al cuadrado (${a*a}) más ${b} al cuadrado (${b*b}) igual a ${a*a + b*b}.` },
          { titulo: 'Extracción de Raíz', latex: `c = ${c}`, explicacion: `La raíz cuadrada de ${a*a + b*b} da como resultado final ${c}.` }
        ],
        resultado: { latex: `c = ${c}`, texto: `Hipotenusa calculada: c = ${c}.` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // B) ÁREA DEL CÍRCULO CON NÚMERO: "area del circulo de radio 5", "circulo radio 3"
    const circMatch = replaced.match(/(?:area|superficie)\s*(?:del)?\s*circulo.*?(?:radio|r)\s*(\d+)/i);
    if (circMatch) {
      const r = parseFloat(circMatch[1]);
      const area = Math.round(Math.PI * r * r * 100) / 100;
      const perim = Math.round(2 * Math.PI * r * 100) / 100;
      return {
        habla: `El área del círculo con radio ${r} es de ${area} unidades cuadradas, y su circunferencia o perímetro es de ${perim}.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Fórmula del Área', latex: `A = \\pi r^2 = \\pi (${r})^2 = ${r*r}\\pi \\approx ${area}`, explicacion: `Multiplicamos pi por el radio ${r} elevado al cuadrado.` },
          { titulo: 'Perímetro o Longitud', latex: `P = 2\\pi r = 2\\pi (${r}) = ${2*r}\\pi \\approx ${perim}`, explicacion: `Dos por pi por el radio.` }
        ],
        resultado: { latex: `A = ${area}, \\quad P = ${perim}`, texto: `Área del círculo: ${area} u², Perímetro: ${perim} u.` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // C) ÁREA DEL TRIÁNGULO: "area del triangulo base 8 altura 5"
    const triMatch = replaced.match(/(?:area|superficie)\s*(?:del)?\s*triangulo.*?(?:base)\s*(\d+).*?(?:altura)\s*(\d+)/i);
    if (triMatch) {
      const b = parseFloat(triMatch[1]);
      const h = parseFloat(triMatch[2]);
      const a = (b * h) / 2;
      return {
        habla: `El área del triángulo con base ${b} y altura ${h} es de ${a} unidades cuadradas.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Fórmula Fundamental del Triángulo', latex: `A = \\frac{b \\cdot h}{2} = \\frac{(${b})(${h})}{2} = \\frac{${b*h}}{2} = ${a}`, explicacion: 'Multiplicamos la longitud de la base por la altura y dividimos entre dos.' }
        ],
        resultado: { latex: `A = ${a}`, texto: `Área: ${a} u².` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // D) VOLUMEN DE LA ESFERA: "volumen de la esfera de radio 4"
    const sphereMatch = replaced.match(/volumen\s*(?:de la)?\s*esfera.*?(?:radio|r)\s*(\d+)/i);
    if (sphereMatch) {
      const r = parseFloat(sphereMatch[1]);
      const vol = Math.round(((4 / 3) * Math.PI * Math.pow(r, 3)) * 100) / 100;
      return {
        habla: `El volumen de la esfera de radio ${r} es de ${vol} unidades cúbicas.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Fórmula de Volumen de la Esfera', latex: `V = \\frac{4}{3}\\pi r^3 = \\frac{4}{3}\\pi (${r})^3 = \\frac{4}{3}\\pi (${r*r*r}) \\approx ${vol}`, explicacion: 'Cuatro tercios de pi por el radio al cubo.' }
        ],
        resultado: { latex: `V = ${vol}`, texto: `Volumen de la esfera: ${vol} u³.` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    // E) VOLUMEN DEL CILINDRO: "volumen del cilindro radio 3 altura 10"
    const cylMatch = replaced.match(/volumen\s*(?:del)?\s*cilindro.*?(?:radio)\s*(\d+).*?(?:altura)\s*(\d+)/i);
    if (cylMatch) {
      const r = parseFloat(cylMatch[1]);
      const h = parseFloat(cylMatch[2]);
      const vol = Math.round((Math.PI * r * r * h) * 100) / 100;
      return {
        habla: `El volumen del cilindro de radio ${r} y altura ${h} es de ${vol} unidades cúbicas.`,
        emocion: 'feliz',
        pasos: [
          { titulo: 'Fórmula de Volumen del Cilindro', latex: `V = \\pi r^2 h = \\pi (${r})^2 (${h}) = ${r*r*h}\\pi \\approx ${vol}`, explicacion: 'Área de la base circular multiplicada por la altura del cilindro.' }
        ],
        resultado: { latex: `V = ${vol}`, texto: `Volumen del cilindro: ${vol} u³.` },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }

  /**
   * 5. PREGUNTAS TÍPICAS DE EXPOSICIÓN ORAL Y PROFESOR UNIVERSITARIO
   */
  solveProfessorQuestions(norm) {
    if (norm.includes('por que es importante el algebra lineal') || norm.includes('importancia del algebra lineal')) {
      return {
        habla: 'El álgebra lineal es el lenguaje fundamental de la ciencia de datos, los gráficos por computadora en tres dimensiones, el aprendizaje automático y la física cuántica, porque permite manipular millones de variables simultáneamente mediante matrices y vectores.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Modelado Multivariable', latex: `A\\vec{x} = \\vec{b} \\implies \\vec{x} = A^{-1}\\vec{b}`, explicacion: 'Permite resolver sistemas masivos de ecuaciones en ingeniería, redes eléctricas y finanzas.' },
          { titulo: 'Gráficos por Computadora 3D', latex: `\\vec{v}' = M_{\\text{rot}} \\cdot M_{\\text{tras}} \\cdot \\vec{v}`, explicacion: 'Todo motor de videojuegos (como Unity, Unreal o Three.js) transforma vértices mediante matrices de proyección 4x4.' }
        ],
        resultado: { latex: `\\mathbb{R}^n \\xrightarrow{A} \\mathbb{R}^m`, texto: 'El álgebra lineal sustenta la computación moderna, IA y gráficos 3D.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('aplicaciones de los vectores') || norm.includes('vectores en la vida real')) {
      return {
        habla: 'Los vectores se aplican en la vida real para modelar cualquier fenómeno físico con dirección: navegación por satélite GPS, diseño de estructuras arquitectónicas contra terremotos, videojuegos 3D, animación digital y flujo de fluidos.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Dinámica y Estructuras', latex: `\\sum \\vec{F} = \\vec{0} \\quad (\\text{Equilibrio Estático})`, explicacion: 'Los ingenieros calculan las fuerzas vectoriales en puentes y edificios para evitar colapsos estructurales.' },
          { titulo: 'Navegación y Cinemática', latex: `\\vec{r}(t) = \\vec{r}_0 + \\vec{v}t + \\tfrac{1}{2}\\vec{a}t^2`, explicacion: 'Los pilotos y sistemas de piloto automático calculan la velocidad resultante sumando el vector viento a la velocidad propia.' }
        ],
        resultado: { latex: `\\vec{F}, \\vec{v}, \\vec{a}, \\vec{p}`, texto: 'Vectores: base de la física, ingeniería, robótica y gráficos.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('diferencia entre vector y escalar') || norm.includes('escalar o vector')) {
      return {
        habla: 'Un escalar queda completamente definido por un solo número y su unidad de medida, como la temperatura o la masa; mientras que un vector requiere obligatoriamente magnitud, dirección y sentido, como la velocidad o la fuerza.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Escalar (Magnitud Pura)', latex: `m = 75\\,\\text{kg}, \\quad T = 24^\\circ\\text{C}, \\quad t = 10\\,\\text{s}`, explicacion: 'No tiene orientación en el espacio; no tiene sentido decir "veinticuatro grados Celsius hacia el norte".' },
          { titulo: 'Vector (Magnitud + Dirección + Sentido)', latex: `\\vec{v} = 100\\,\\text{km/h} \\text{ al Noreste} \\implies \\langle 70.7, 70.7 \\rangle`, explicacion: 'El efecto físico depende crucialmente de hacia dónde apunta.' }
        ],
        resultado: { latex: `s \\in \\mathbb{R} \\quad \\text{vs} \\quad \\vec{v} \\in \\mathbb{R}^n`, texto: 'Escalar = valor numérico; Vector = valor numérico con orientación espacial.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('por que el producto cruz es perpendicular') || norm.includes('por que es perpendicular el producto cruz')) {
      return {
        habla: 'El producto cruz es perpendicular a ambos vectores por definición de su construcción geométrica y algebraica: el producto escalar del vector resultante con cualquiera de los dos vectores originales siempre es idénticamente cero.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Demostración por Producto Escalar', latex: `(\\vec{A} \\times \\vec{B}) \\cdot \\vec{A} = 0 \\quad \\text{y} \\quad (\\vec{A} \\times \\vec{B}) \\cdot \\vec{B} = 0`, explicacion: 'Por las propiedades de los determinantes, cualquier producto mixto con dos filas iguales es nulo.' },
          { titulo: 'Regla de la Mano Derecha', latex: `\\hat{n} = \\frac{\\vec{A} \\times \\vec{B}}{\\|\\vec{A} \\times \\vec{B}\\|}`, explicacion: 'Alineando los dedos con A y cerrándolos hacia B, el pulgar extendido apunta en el vector normal unitario.' }
        ],
        resultado: { latex: `\\vec{A} \\times \\vec{B} \\perp \\vec{A}, \\quad \\vec{A} \\times \\vec{B} \\perp \\vec{B}`, texto: 'Demostrado: el vector resultante es ortogonal al plano generador.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que significa que dos vectores sean ortogonales') || norm.includes('vectores ortogonales')) {
      return {
        habla: 'Dos vectores son ortogonales cuando forman un ángulo recto exacto de noventa grados entre sí, lo cual ocurre si y solamente si su producto escalar o producto punto es igual a cero.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Condición Necesaria y Suficiente', latex: `\\vec{A} \\cdot \\vec{B} = 0 \\iff \\vec{A} \\perp \\vec{B}`, explicacion: 'Como A punto B es ||A||·||B||·cos(90°) y el coseno de 90° es cero, el producto punto nulo garantiza ortogonalidad.' },
          { titulo: 'Ejemplo Numérico', latex: `\\langle 2, 3 \\rangle \\cdot \\langle -3, 2 \\rangle = (2)(-3) + (3)(2) = -6 + 6 = 0`, explicacion: 'Vectores ortogonales en el plano.' }
        ],
        resultado: { latex: `\\vec{u} \\cdot \\vec{v} = 0 \\implies 90^\\circ`, texto: 'Ortogonalidad: ángulo de 90° y producto punto nulo.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    if (norm.includes('que es una transformacion lineal')) {
      return {
        habla: 'Una transformación lineal es una función entre dos espacios vectoriales que preserva las operaciones de suma vectorial y multiplicación por escalar, lo que significa que transforma rectas en rectas y mantiene el origen fijo.',
        emocion: 'explicando',
        pasos: [
          { titulo: 'Axiomas de Linealidad', latex: `T(\\vec{u} + \\vec{v}) = T(\\vec{u}) + T(\\vec{v}) \\quad \\text{y} \\quad T(c\\vec{u}) = cT(\\vec{u})`, explicacion: 'La transformación de una combinación lineal es la combinación lineal de las transformaciones.' },
          { titulo: 'Representación Matricial', latex: `T(\\vec{x}) = A \\vec{x}`, explicacion: 'Toda transformación lineal en dimensión finita puede representarse como una multiplicación por matriz.' }
        ],
        resultado: { latex: `T(\\alpha\\vec{u} + \\beta\\vec{v}) = \\alpha T(\\vec{u}) + \\beta T(\\vec{v})`, texto: 'Transformación lineal: preserva sumas y múltiplos escalares.' },
        visualizacion: { tipo: 'ninguna', vectores: [] }
      };
    }

    return null;
  }
}

export const advancedMathModules = new AdvancedMathModules();
