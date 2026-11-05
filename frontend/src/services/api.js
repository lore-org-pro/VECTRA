// ========================================================
// VECTRA // FRONTEND HTTP CLIENT (CON MOTOR LOCAL OFFLINE RESILIENTE)
// ========================================================
import { localMathSolver } from './localMathSolver.js';

const API_BASE = '/api';

export async function askVectra(message, history = [], forcedProviderId = null) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // 6.5s timeout max

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, forcedProviderId }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return await response.json();
    }

    // Si la API remota devuelve error (429 rate limit, 500, etc.), recurrir al motor local
    console.warn(`[VECTRA] API devolvió HTTP ${response.status}. Activando motor local offline...`);
    const local = localMathSolver.solve(message);
    if (local) return local;

    throw new Error(`HTTP error ${response.status}`);
  } catch (err) {
    console.warn('[VECTRA] Modo local offline activado por falla de red/API:', err.message);
    const local = localMathSolver.solve(message);
    if (local) return local;
    throw err;
  }
}

export async function fetchTTS(text) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${API_BASE}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { fallbackToBrowserSpeech: true, text };
    }

    return await response.json();
  } catch {
    return { fallbackToBrowserSpeech: true, text };
  }
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
