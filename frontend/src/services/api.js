// ========================================================
// VECTRA // FRONTEND HTTP CLIENT — MODO FERIA (OFFLINE FIRST)
// En feria sin internet: motor local responde SIEMPRE instantáneo.
// Si hay conexión (servidor local o internet), la usa como mejora.
// ========================================================
import { localMathSolver } from './localMathSolver.js';

const API_BASE = '/api';

// Detectar si hay servidor local o conexión (rápido, 800ms timeout)
let _serverAvailable = null; // null = no chequeado, true/false = resultado
let _lastCheck = 0;

async function _checkServerAvailable() {
  const now = Date.now();
  // Re-chequear solo cada 30 segundos para no saturar
  if (_serverAvailable !== null && now - _lastCheck < 30000) return _serverAvailable;
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 800);
    const res = await fetch(`${API_BASE}/health`, { signal: ctrl.signal });
    _serverAvailable = res.ok;
  } catch {
    _serverAvailable = false;
  }
  _lastCheck = now;
  return _serverAvailable;
}

export async function askVectra(message, history = [], forcedProviderId = null) {
  // 1. INTENTAR MOTOR LOCAL PRIMERO (siempre disponible, sin internet)
  const local = localMathSolver.solve(message);

  // Si el motor local resolvió con confianza (matemáticas o temas de la feria), retornar ya
  if (local && local._meta?.offline === true) {
    return local;
  }

  // 2. Si la consulta es conversacional y no hay servidor, usar local como fallback fluido
  const serverUp = await _checkServerAvailable();
  if (!serverUp) {
    if (local) return local;
    // Generar respuesta local conversacional enriquecida
    return localMathSolver.solveConversational(message);
  }

  // 3. Servidor disponible: llamar al backend con timeout corto
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500);

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

    console.warn(`[VECTRA] API devolvió HTTP ${response.status}. Usando motor local...`);
    return local || localMathSolver.solveConversational(message);
  } catch (err) {
    console.warn('[VECTRA] Sin red — modo local offline activo:', err.message);
    return local || localMathSolver.solveConversational(message);
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
