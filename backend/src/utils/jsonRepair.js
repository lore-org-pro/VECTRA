// ========================================================
// VECTRA // JSON SANITIZER & REPAIR UTILITY
// ========================================================

/**
 * Limpia y repara respuestas de LLMs para garantizar JSON válido.
 * Maneja bloques de código ```json, texto conversacional extra,
 * comillas no escapadas y comas colgantes.
 */
export function repairAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Respuesta vacía o formato inválido');
  }

  let cleaned = rawText.trim();

  // 1. Eliminar bloques markdown ```json ... ```
  if (cleaned.includes('```json')) {
    const match = cleaned.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  } else if (cleaned.includes('```')) {
    const match = cleaned.match(/```\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      cleaned = match[1].trim();
    }
  }

  // 2. Extraer el primer objeto JSON {...} si hay texto conversacional antes o después
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // 3. Intento de parseo directo
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    // 4. Intentos de reparación heurística
    try {
      // Reemplazar comas colgantes en arrays/objetos: ,} o ,]
      let fixed = cleaned.replace(/,\s*([}\]])/g, '$1');
      // Reemplazar saltos de línea dentro de strings que rompen JSON
      fixed = fixed.replace(/[\r\n]+/g, ' ');
      return JSON.parse(fixed);
    } catch {
      throw new Error(`Error fatal al parsear JSON del LLM: ${err.message}`);
    }
  }
}
