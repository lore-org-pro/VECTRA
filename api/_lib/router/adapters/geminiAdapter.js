// ========================================================
// VECTRA // GOOGLE GEMINI ADAPTER
// ========================================================
import { repairAndParseJSON } from '../../utils/jsonRepair.js';

export async function callGemini(provider, apiKey, systemPrompt, userMessage, history = []) {
  const model = provider.model || 'gemini-2.0-flash';
  const url = `${provider.baseURL}/models/${model}:generateContent?key=${apiKey}`;
  const timeoutMs = provider.timeoutMs || 8000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Formatear contenidos para Gemini
  const contents = [];
  // Historial previo
  for (const h of history.slice(-6)) {
    contents.push({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    });
  }
  // Turno actual
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.1,
      responseMimeType: 'application/json'
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const error = new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 150)}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Respuesta de Gemini vacía o bloqueada por filtros de seguridad');
    }

    return repairAndParseJSON(text);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Timeout de ${timeoutMs}ms superado en Gemini`);
      timeoutErr.statusCode = 408;
      throw timeoutErr;
    }
    throw err;
  }
}
