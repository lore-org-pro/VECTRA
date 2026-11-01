// ========================================================
// VECTRA // OLLAMA LOCAL ADAPTER (100% Offline)
// ========================================================
import { repairAndParseJSON } from '../../utils/jsonRepair.js';

export async function callOllama(provider, systemPrompt, userMessage, history = []) {
  const host = process.env.OLLAMA_HOST || provider.baseURL || 'http://127.0.0.1:11434';
  const url = `${host}/api/chat`;
  const model = process.env.OLLAMA_DEFAULT_MODEL || provider.model || 'qwen3.5:0.8b';
  const timeoutMs = provider.timeoutMs || 15000;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userMessage }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        format: 'json',
        stream: false,
        options: {
          temperature: 0.1
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const error = new Error(`Ollama HTTP ${response.status}: ${errText.slice(0, 150)}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    let content = data.message?.content;
    if (!content && data.message?.thinking) {
      // Intentar extraer bloque JSON si quedó dentro de thinking
      const jsonMatch = data.message.thinking.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      }
    }

    if (!content) {
      throw new Error('Respuesta de Ollama vacía');
    }

    return repairAndParseJSON(content);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Timeout de ${timeoutMs}ms superado en Ollama local`);
      timeoutErr.statusCode = 408;
      throw timeoutErr;
    }
    // Si no está corriendo Ollama
    if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
      const connErr = new Error('Ollama no está ejecutándose en localhost:11434');
      connErr.statusCode = 503;
      throw connErr;
    }
    throw err;
  }
}
