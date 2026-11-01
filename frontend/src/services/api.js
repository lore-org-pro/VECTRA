// ========================================================
// VECTRA // FRONTEND HTTP CLIENT
// ========================================================

const API_BASE = '/api';

export async function askVectra(message, history = [], forcedProviderId = null) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, forcedProviderId })
  });

  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}`);
  }

  return response.json();
}

export async function fetchTTS(text) {
  const response = await fetch(`${API_BASE}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    return { fallbackToBrowserSpeech: true, text };
  }

  return response.json();
}

export async function getProvidersTelemetry() {
  const response = await fetch(`${API_BASE}/providers`);
  if (!response.ok) throw new Error('Error al obtener proveedores');
  return response.json();
}

export async function testProvider(providerId) {
  const response = await fetch(`${API_BASE}/providers/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId })
  });
  return response.json();
}

export async function toggleProvider(providerId, active) {
  const response = await fetch(`${API_BASE}/providers/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerId, active })
  });
  return response.json();
}

export async function getDemoQuestions() {
  const response = await fetch(`${API_BASE}/demo/questions`);
  if (!response.ok) throw new Error('Error al obtener preguntas demo');
  return response.json();
}

export async function getSupabaseStatus() {
  try {
    const response = await fetch(`${API_BASE}/supabase/status`);
    if (!response.ok) return { connected: false };
    return response.json();
  } catch {
    return { connected: false };
  }
}
