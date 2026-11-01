// ========================================================
// VECTRA Serverless — POST /api/chat
// ========================================================
import 'dotenv/config';
import { llmRouter } from './_lib/router/llmRouter.js';
import { stepGenerator } from './_lib/math/stepGenerator.js';
import { reasoningEngine } from './_lib/math/reasoningEngine.js';
import { supabaseService } from './_lib/services/supabaseService.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message, history, forcedProviderId } = req.body;
  if (!message) return res.status(400).json({ error: 'Mensaje requerido' });

  try {
    const rawResult = await llmRouter.route(message, history || [], forcedProviderId);
    const verifiedResult = stepGenerator.verifyAndCorrect(rawResult, message);

    const reasoning = reasoningEngine.analyze(message);
    if (reasoning) verifiedResult.razonamiento = reasoning;

    supabaseService.logInteraction(message, verifiedResult).catch(() => {});

    return res.status(200).json(verifiedResult);
  } catch (err) {
    console.error('[API-CHAT-ERROR]', err);
    return res.status(500).json({
      habla: 'Ocurrió una anomalía transitoria en el procesamiento. Modo de emergencia activo.',
      emocion: 'error',
      pasos: [],
      resultado: { latex: '\\text{Error}', texto: err.message },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: ['Intenta con otra pregunta', 'Repetir consulta'],
      _meta: { error: err.message, providerUsed: 'emergency_fallback' }
    });
  }
}
