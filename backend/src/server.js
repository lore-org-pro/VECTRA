import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { llmRouter } from './router/llmRouter.js';
import { circuitBreaker } from './router/circuitBreaker.js';
import { stepGenerator } from './math/stepGenerator.js';
import { reasoningEngine } from './math/reasoningEngine.js';
import { ttsService } from './tts/ttsService.js';
import { supabaseService } from './services/supabaseService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env buscando tanto en Jarvis root como en la carpeta superior
const rootEnvPath = path.resolve(__dirname, '../../.env');
const localEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Middleware para datos binarios de audio de grabación del micrófono (Whisper STT)
app.use(express.raw({ type: ['audio/*', 'application/octet-stream'], limit: '25mb' }));
app.use(express.json());

// Servir archivos de audio de la caché local
const audioCacheDir = path.resolve(__dirname, '../cache/audio');
if (!fs.existsSync(audioCacheDir)) {
  fs.mkdirSync(audioCacheDir, { recursive: true });
}
app.use('/cache/audio', express.static(audioCacheDir));

// 1. Endpoint de Salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'VECTRA Vectorial AI',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// 1.1 Estado de Conexión a Supabase
app.get('/api/supabase/status', async (req, res) => {
  const status = supabaseService.getStatus();
  res.json(status);
});

// 2. Chat / Consulta Vectorial Principal
app.post('/api/chat', async (req, res) => {
  const { message, history, forcedProviderId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // A) Enrutamiento con Failover automático
    const rawResult = await llmRouter.route(message, history || [], forcedProviderId);

    // B) Verificación determinista matemática (sobrescribe errores del LLM)
    const verifiedResult = stepGenerator.verifyAndCorrect(rawResult, message);

    // B.1) Inyectar razonamiento matemático previo
    const reasoning = reasoningEngine.analyze(message);
    if (reasoning) {
      verifiedResult.razonamiento = reasoning;
    }

    // C) Registro asíncrono en Supabase (no bloquea respuesta)
    supabaseService.logInteraction(message, verifiedResult).catch(() => {});

    res.json(verifiedResult);
  } catch (err) {
    console.error('[API-CHAT-ERROR]', err);
    res.status(500).json({
      habla: 'Ocurrió una anomalía transitoria en el procesamiento. Modo de emergencia activo.',
      emocion: 'error',
      pasos: [],
      resultado: { latex: '\\text{Error}', texto: err.message },
      visualizacion: { tipo: 'ninguna', vectores: [] },
      sugerencias: ['Intenta con otra pregunta de demo', 'Repetir consulta'],
      _meta: { error: err.message, providerUsed: 'emergency_fallback' }
    });
  }
});

// 3. Síntesis de Voz (TTS)
app.post('/api/tts', async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Texto requerido para síntesis' });
  }

  try {
    const result = await ttsService.synthesize(text);
    res.json(result);
  } catch (err) {
    res.json({
      fallbackToBrowserSpeech: true,
      error: err.message
    });
  }
});

// 3.1 Transcripción de Voz (Whisper STT via Groq) - Inmune a bloqueos de Brave y Web Speech API
app.post('/api/transcribe', async (req, res) => {
  try {
    if (!req.body || (Buffer.isBuffer(req.body) && req.body.length === 0)) {
      return res.status(400).json({ error: 'Audio data is empty' });
    }

    const contentType = req.headers['content-type'] || 'audio/webm';
    const groqKey = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',')[0].trim();
    if (!groqKey) {
      return res.status(500).json({ error: 'Groq API Key no configurada para Whisper' });
    }

    // Detección infalible de formato por Magic Bytes en lugar de headers ambiguos
    let ext = 'webm';
    let cleanMime = 'audio/webm';
    const bodyBuf = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body);

    if (bodyBuf[0] === 0x1A && bodyBuf[1] === 0x45 && bodyBuf[2] === 0xDF && bodyBuf[3] === 0xA3) {
      ext = 'webm';
      cleanMime = 'audio/webm';
    } else if (bodyBuf.length >= 4 && bodyBuf.subarray(0, 4).toString() === 'RIFF') {
      ext = 'wav';
      cleanMime = 'audio/wav';
    } else if (bodyBuf.length >= 4 && bodyBuf.subarray(0, 4).toString() === 'OggS') {
      ext = 'ogg';
      cleanMime = 'audio/ogg';
    } else if (bodyBuf.length >= 8 && bodyBuf.subarray(4, 8).toString() === 'ftyp') {
      ext = 'mp4';
      cleanMime = 'audio/mp4';
    } else {
      ext = 'webm';
      cleanMime = 'audio/webm';
    }

    const audioBlob = new Blob([bodyBuf], { type: cleanMime });
    const formData = new FormData();
    formData.append('file', audioBlob, `speech.${ext}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');
    formData.append('temperature', '0.0');
    // Prompt acústico guía para filtrar ruido de aula escolar, murmullos y ecos
    formData.append('prompt', 'VECTRA, asistente de matemáticas y vectores en aula con ruido de fondo. Transcribe únicamente la voz principal ignorando murmullos de alumnos y ruido ambiental. Operaciones: suma, resta, producto punto, cruz, magnitud, coordenadas, calcular, explicar.');

    const startTime = Date.now();
    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`
      },
      body: formData,
      signal: AbortSignal.timeout(12000)
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn('[Whisper STT] Error de Groq:', errText);
      return res.status(200).json({ error: errText, text: '', durationMs: Date.now() - startTime });
    }

    const result = await groqResponse.json();
    let text = (result.text || '').trim();

    // Filtrar alucinaciones acústicas típicas de Whisper provocadas por ruido ambiental o silencio
    const isHallucination = [
      /subt[ií]tulos/i,
      /amara\.org/i,
      /suscr[ií]bete/i,
      /gracias\s*por\s*ver/i,
      /muchas\s*gracias/i,
      /hasta\s*la\s*pr[oó]xima/i,
      /\[m[uú]sica\]/i,
      /\[aplausos\]/i,
      /^[.\s,;!?-]+$/
    ].some((rx) => rx.test(text));

    if (isHallucination) {
      console.log(`[Whisper STT] 🔇 Ruido de fondo filtrado: "${text}"`);
      text = '';
    }

    const durationMs = Date.now() - startTime;
    console.log(`[Whisper STT] ✅ Transcrito en ${durationMs}ms: "${text}"`);

    res.json({ text, durationMs });
  } catch (err) {
    console.error('[Whisper STT] Error inesperado:', err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Lista y Telemetría de Proveedores (Panel Presentador)
app.get('/api/providers', (req, res) => {
  const providersPath = path.resolve(__dirname, '../../providers.json');
  let providers = [];
  if (fs.existsSync(providersPath)) {
    providers = JSON.parse(fs.readFileSync(providersPath, 'utf-8'));
  }

  const liveStates = circuitBreaker.getAllStates();
  const stateMap = new Map(liveStates.map((s) => [s.id, s]));

  const enriched = providers.map((p) => {
    const live = stateMap.get(p.id) || {};
    return {
      ...p,
      status: live.status || (p.active ? 'ACTIVE' : 'DISABLED'),
      averageLatencyMs: live.averageLatencyMs || 0,
      rpmCount: live.rpmCount || 0,
      rpdCount: live.rpdCount || 0,
      lastError: live.lastError || null
    };
  });

  res.json({
    providers: enriched,
    ttsStats: ttsService.getStats()
  });
});

// 5. Test de Proveedores (Botón "Probar Todos" o individual)
app.post('/api/providers/test', async (req, res) => {
  const { providerId } = req.body;
  const testMessage = 'Calcula la magnitud del vector (3, 4, 0).';

  try {
    const startTime = Date.now();
    const result = await llmRouter.route(testMessage, [], providerId);
    const latency = Date.now() - startTime;

    res.json({
      success: true,
      providerId: result._meta?.providerUsed,
      providerName: result._meta?.providerName,
      latencyMs: latency,
      responseSample: result.habla
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// 6. Activar/Desactivar Proveedor
app.post('/api/providers/toggle', (req, res) => {
  const { providerId, active } = req.body;
  circuitBreaker.toggleProvider(providerId, active);
  res.json({ success: true, providerId, active });
});

// 7. Lista de Preguntas de Demo
app.get('/api/demo/questions', (req, res) => {
  const questionsPath = path.resolve(__dirname, '../../demo-data/demoQuestions.json');
  if (fs.existsSync(questionsPath)) {
    res.json(JSON.parse(fs.readFileSync(questionsPath, 'utf-8')));
  } else {
    res.status(404).json({ error: 'demoQuestions.json no encontrado' });
  }
});

app.listen(PORT, () => {
  console.log(`\x1b[36m[VECTRA-BACKEND]\x1b[0m Servidor activo en http://localhost:${PORT}`);
});
