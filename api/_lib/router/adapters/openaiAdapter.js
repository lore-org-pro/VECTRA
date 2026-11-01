// ========================================================
// VECTRA // OPENAI-COMPATIBLE ADAPTER (Groq, OpenRouter, Mistral, NIM)
// ========================================================
import { repairAndParseJSON } from '../../utils/jsonRepair.js';

export async function callOpenAICompatible(provider, apiKey, systemPrompt, userMessage, history = []) {
  const url = `${provider.baseURL}/chat/completions`;
  const timeoutMs = provider.timeoutMs || 8000;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-6),
    { role: 'user', content: userMessage }
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  // OpenRouter headers
  if (provider.id === 'openrouter') {
    headers['HTTP-Referer'] = 'https://vectra.ai';
    headers['X-Title'] = 'VECTRA Vector AI';
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages,
        temperature: 0.1,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const error = new Error(`HTTP ${response.status}: ${errText.slice(0, 150)}`);
      error.statusCode = response.status;
      throw error;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Respuesta del modelo sin contenido de texto');
    }

    return repairAndParseJSON(content);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Timeout de ${timeoutMs}ms superado sin respuesta`);
      timeoutErr.statusCode = 408;
      throw timeoutErr;
    }
    throw err;
  }
}
