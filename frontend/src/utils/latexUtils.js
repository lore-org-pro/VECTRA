// ========================================================
// VECTRA // LATEX & TEXT SANITIZATION UTILITIES
// ========================================================

/**
 * Limpia texto conversacional para que nunca muestre comandos LaTeX crudos
 * en los globos de diálogo, sugerencias, subtítulos o voz.
 */
export function cleanTextForDisplay(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    // Glitches de codificación UTF-8 comunes (ej: Â en Â tres dimensiones o Â en Â²)
    .replace(/Â\s*/g, '')
    // Comandos de conjuntos
    .replace(/\\mathbb\{R\}\^3/g, 'R³')
    .replace(/\\mathbb\{R\}\^2/g, 'R²')
    .replace(/\\mathbb\{R\}/g, 'R')
    .replace(/\\mathbf\{R\}\^3/g, 'R³')
    .replace(/\\mathbf\{R\}\^2/g, 'R²')
    .replace(/\\mathbf\{R\}/g, 'R')
    .replace(/\\mathbb\{([A-Za-z]+)\}/g, '$1')
    // Vectores y acentos
    .replace(/\\vec\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\hat\{([^}]+)\}/g, '$1')
    // Símbolos angulares y corchetes
    .replace(/\\langle\s*/g, '(')
    .replace(/\s*\\rangle/g, ')')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\pm/g, '±')
    .replace(/\\approx/g, '≈')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neq/g, '≠')
    // Matrices o pmatrix coladas en texto
    .replace(/\\?begin\{?pmatrix\}?/gi, '(')
    .replace(/\\?end\{?pmatrix\}?/gi, ')')
    .replace(/beginpmatrix/gi, '(')
    .replace(/endpmatrix/gi, ')')
    .replace(/\\\\/g, ', ')
    .replace(/\\quad/g, ' ')
    .replace(/\\qquad/g, ' ')
    .replace(/\\;/g, ' ')
    .replace(/\\,/g, ' ')
    .replace(/\\!/g, '')
    .trim();
}

/**
 * Sanitiza y repara expresiones matemáticas para KaTeX.
 * Maneja: beginpmatrix sin backslash, cuerpos de matrices sin \\,
 * comandos sin \, glitches JSON/UTF-8, y LaTeX concatenado del LLM.
 */
export function cleanAndSanitizeLaTeX(str) {
  if (!str) return '';
  let s = String(str).trim();

  // 1. Corregir glitches de escape JSON (\b -> backspace \x08)
  s = s.replace(/\x08eig/g, '\\begin');
  s = s.replace(/\x08end/g, '\\end');

  // 2. Glitches UTF-8
  s = s.replace(/Â\s*/g, '');

  // 3. Normalizar `beginpmatrix` / `endpmatrix` SIN barra invertida.
  //    Usamos replace simple antes de la regex general para capturar la concatenación directa.
  //    Ej: "beginpmatrix2" → "\begin{pmatrix}2"
  s = s.replace(/beginpmatrix/gi, '\\begin{pmatrix}');
  s = s.replace(/endpmatrix/gi,   '\\end{pmatrix}');
  s = s.replace(/beginbmatrix/gi, '\\begin{bmatrix}');
  s = s.replace(/endbmatrix/gi,   '\\end{bmatrix}');
  s = s.replace(/beginvmatrix/gi, '\\begin{vmatrix}');
  s = s.replace(/endvmatrix/gi,   '\\end{vmatrix}');

  // 4. Corregir entornos con barra pero sin llaves / con espacios: \begin pmatrix, \begin{pmatrix
  s = s.replace(/\\begin\s*\{?pmatrix\}?/gi, '\\begin{pmatrix}');
  s = s.replace(/\\end\s*\{?pmatrix\}?/gi,   '\\end{pmatrix}');
  s = s.replace(/\\begin\s*\{?bmatrix\}?/gi, '\\begin{bmatrix}');
  s = s.replace(/\\end\s*\{?bmatrix\}?/gi,   '\\end{bmatrix}');
  s = s.replace(/\\begin\s*\{?vmatrix\}?/gi, '\\begin{vmatrix}');
  s = s.replace(/\\end\s*\{?vmatrix\}?/gi,   '\\end{vmatrix}');
  s = s.replace(/\\begin\s*\{?matrix\}?/gi,  '\\begin{matrix}');
  s = s.replace(/\\end\s*\{?matrix\}?/gi,    '\\end{matrix}');
  s = s.replace(/\\begin\s*\{?aligned\}?/gi, '\\begin{aligned}');
  s = s.replace(/\\end\s*\{?aligned\}?/gi,   '\\end{aligned}');

  // 5. Normalizar separadores de fila dentro de entornos matriciales.
  //    KaTeX exige \\ entre filas. El LLM a veces usa \n o un solo \.
  s = s.replace(/(\\begin\{[a-z]*matrix\})([\s\S]*?)(\\end\{[a-z]*matrix\})/gi,
    (_m, openTag, body, closeTag) => {
      let clean = body
        .replace(/[\r\n]+/g, ' \\\\ ')   // saltos de línea → \\
        .replace(/\\\\{2,}/g, ' \\\\ ')   // cuádruples → doble
        .replace(/(^|[^\\])\\\s+(-?\d)/g, '$1\\\\ $2') // \<espacio>NUM → \\ NUM
        .trim();
      return `${openTag} ${clean} ${closeTag}`;
    }
  );

  // 6. Corregir comandos comunes sin barra invertida (solo si no son parte de otro token)
  s = s.replace(/(^|[^\\a-zA-Z])vec\s*\{/g,    '$1\\vec{');
  s = s.replace(/(^|[^\\a-zA-Z])mathbf\s*\{/g, '$1\\mathbf{');
  s = s.replace(/(^|[^\\a-zA-Z])mathbb\s*\{/g, '$1\\mathbb{');
  s = s.replace(/(^|[^\\a-zA-Z])langle\b/g,    '$1\\langle');
  s = s.replace(/(^|[^\\a-zA-Z])rangle\b/g,    '$1\\rangle');
  s = s.replace(/(^|[^\\a-zA-Z])cdot\b/g,      '$1\\cdot');
  s = s.replace(/(^|[^\\a-zA-Z])times\b/g,     '$1\\times');
  s = s.replace(/(^|[^\\a-zA-Z])hat\s*\{/g,    '$1\\hat{');

  return s;
}

/**
 * Fallback amigable si KaTeX encuentra una sintaxis irreparable.
 * Convierte expresiones matriciales complejas rotas a formato tupla legible (x, y, z).
 */
export function formatFallbackMath(rawStr) {
  if (!rawStr) return '';
  const clean = cleanTextForDisplay(rawStr);
  // Si parece una matriz de números verticales, convertir a tupla (x, y, z)
  const nums = clean.match(/-?\d+(?:\.\d+)?/g);
  if (nums && nums.length >= 2 && nums.length <= 4) {
    return `(${nums.join(', ')})`;
  }
  return clean;
}
