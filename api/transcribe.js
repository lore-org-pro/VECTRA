// ========================================================
// VECTRA Serverless — POST /api/transcribe
// Transcripción con Groq Whisper Large V3 Turbo + Filtro Antirruido
// ========================================================
import 'dotenv/config';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    let audioBuffer;
    if (Buffer.isBuffer(req.body)) {
      audioBuffer = req.body;
    } else if (req.body && typeof req.body === 'string') {
      audioBuffer = Buffer.from(req.body);
    } else {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      audioBuffer = Buffer.concat(chunks);
    }

    if (!audioBuffer || audioBuffer.length < 500) {
      return res.status(400).json({ error: 'Audio data is too small or empty', text: '' });
    }

    const groqKey = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',')[0].trim();
    if (!groqKey) {
      return res.status(500).json({ error: 'Groq API Key no configurada para Whisper' });
    }

    const contentType = req.headers['content-type'] || 'audio/webm';
    const ext = contentType.includes('mp4') ? 'mp4' : contentType.includes('wav') ? 'wav' : contentType.includes('ogg') ? 'ogg' : 'webm';

    const audioBlob = new Blob([audioBuffer], { type: contentType });
    const formData = new FormData();
    formData.append('file', audioBlob, `speech.${ext}`);
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('language', 'es');
    formData.append('temperature', '0.0');
    formData.append('prompt', 'VECTRA, asistente de matemáticas y vectores en aula con ruido de fondo. Transcribe únicamente la voz principal ignorando murmullos de alumnos y ruido ambiental. Operaciones: suma, resta, producto punto, cruz, magnitud, coordenadas, calcular, explicar.');

    const startTime = Date.now();
    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`
      },
      body: formData,
      signal: AbortSignal.timeout(10000)
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.warn('[Whisper STT] Error de Groq:', errText);
      return res.status(groqResponse.status).json({ error: errText, text: '' });
    }

    const result = await groqResponse.json();
    let text = (result.text || '').trim();

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
    return res.status(200).json({ text, durationMs });
  } catch (err) {
    console.error('[API-TRANSCRIBE-ERROR]', err);
    return res.status(500).json({ error: err.message, text: '' });
  }
}
