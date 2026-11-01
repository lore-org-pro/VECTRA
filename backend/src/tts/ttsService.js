// ========================================================
// VECTRA // TTS DISPATCHER: EDGE TTS (Jorge, hombre es-MX)
//           → ElevenLabs → Google Neural → Browser fallback
// ========================================================
import { audioCache } from './audioCache.js';
import { EdgeTTS } from 'node-edge-tts';

class TTSService {
  constructor() {
    this.totalCharsUsed = 0;
    this.edgeTTSBlockedUntil = 0; // Timestamp hasta el cual EdgeTTS está en pausa tras 429
  }

  cleanForSpeech(text) {
    return (text || '')
      .replace(/\\vec\{([^}]+)\}/g, 'vector $1')
      .replace(/\\mathbf\{([^}]+)\}/g, '$1')
      .replace(/\\times/g, ' cruz ')
      .replace(/\\cdot/g, ' punto ')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1')
      .replace(/\^2/g, ' al cuadrado')
      .replace(/\^3/g, ' al cubo')
      .replace(/[\n\r]+/g, ' ')
      .replace(/[*_~`#\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Genera audio con Microsoft Edge TTS (voz masculina neural, sin API key)
   * Si Microsoft responde 429, activa circuit breaker por 5 minutos para evitar lentitud.
   */
  async synthesizeWithEdgeTTS(text) {
    if (Date.now() < this.edgeTTSBlockedUntil) {
      // Circuit breaker activo: no perder tiempo reintentando Edge TTS con 429
      return null;
    }

    const clean = this.cleanForSpeech(text);
    if (!clean) return null;

    const voice = 'es-MX-JorgeNeural';
    try {
      const filePath = audioCache.getPath(text);
      const tts = new EdgeTTS({
        voice,
        lang: 'es-MX',
        outputFormat: 'audio-24khz-48kbitrate-mono-mp3',
        saveSubtitles: false,
        timeout: 4000
      });
      await tts.ttsPromise(clean, filePath);
      console.log(`[TTS] ✅ Edge TTS (${voice}) exitoso`);
      return audioCache.getUrl(text);
    } catch (err) {
      if (err.message && err.message.includes('429')) {
        console.warn(`[TTS] Edge TTS 429 (rate-limit). Activando circuit breaker por 5 min. Usando Google TTS rápido.`);
        this.edgeTTSBlockedUntil = Date.now() + 5 * 60 * 1000;
      } else {
        console.warn(`[TTS] Edge TTS falló (${err.message}). Pasando a Google TTS.`);
      }
      return null;
    }
  }

  /**
   * Genera audio en español neutro / latinoamericano mediante Google TTS (alta velocidad y paralelismo)
   */
  async synthesizeWithGoogle(text) {
    const clean = this.cleanForSpeech(text);
    if (!clean) return null;

    const sentences = clean.match(/[^.!?,;:]+[.!?,;:]+|[^.!?,;:]+$/g) || [clean];
    const chunks = [];
    let cur = '';

    for (const s of sentences) {
      if ((cur + ' ' + s).length > 120) {
        if (cur.trim()) chunks.push(cur.trim());
        cur = s;
      } else {
        cur = cur ? cur + ' ' + s : s;
      }
    }
    if (cur.trim()) chunks.push(cur.trim());

    try {
      // Descarga concurrente de fragmentos para latencia ultra-baja (<400ms)
      const fetchPromises = chunks.map(async (chunk, idx) => {
        if (!chunk.trim()) return null;
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=es-MX&q=${encodeURIComponent(chunk.trim())}`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) return null;
        const ab = await res.arrayBuffer();
        return { idx, buf: Buffer.from(ab) };
      });

      const results = await Promise.all(fetchPromises);
      const validBuffers = results
        .filter(Boolean)
        .sort((a, b) => a.idx - b.idx)
        .map((r) => r.buf);

      if (validBuffers.length === 0) return null;
      const combinedBuffer = Buffer.concat(validBuffers);
      return audioCache.save(text, combinedBuffer);
    } catch (err) {
      console.warn(`[TTS] Google TTS error: ${err.message}`);
      return null;
    }
  }

  async synthesize(text) {
    if (!text || typeof text !== 'string') {
      return { fallbackToBrowserSpeech: false, audioUrl: null, text: '' };
    }

    // 1. Revisar caché local en disco (0 ms latencia, funciona 100% offline)
    if (audioCache.has(text)) {
      return {
        cached: true,
        audioUrl: audioCache.getUrl(text),
        provider: 'cache',
        fallbackToBrowserSpeech: false,
        charsUsedSession: this.totalCharsUsed
      };
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Adam (multilingual)
    const modelId = process.env.ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2';

    // 2. Si hay clave de ElevenLabs configurada, intentar con prioridad
    if (apiKey) {
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const audioUrl = audioCache.save(text, buffer);
          this.totalCharsUsed += text.length;

          return {
            cached: false,
            audioUrl,
            provider: 'elevenlabs',
            fallbackToBrowserSpeech: false,
            charsUsedSession: this.totalCharsUsed
          };
        } else {
          console.warn(`[TTS-FAILOVER] ElevenLabs HTTP ${response.status}. Pasando a Edge TTS.`);
        }
      } catch (err) {
        clearTimeout(timeoutId);
        console.warn(`[TTS-FAILOVER] ElevenLabs no disponible (${err.message}). Pasando a Edge TTS.`);
      }
    }

    // 3. Microsoft Edge TTS — Jorge (es-MX, voz masculina neural, GRATIS, sin API key)
    let edgeFailedNetwork = false;
    try {
      const audioUrl = await this.synthesizeWithEdgeTTS(text);
      if (audioUrl) {
        this.totalCharsUsed += text.length;
        console.log(`[TTS] ✅ Edge TTS (JorgeNeural) → ${audioUrl}`);
        return {
          cached: false,
          audioUrl,
          provider: 'edge_tts_jorge',
          fallbackToBrowserSpeech: false,
          charsUsedSession: this.totalCharsUsed
        };
      }
    } catch (err) {
      if (/ENOTFOUND|EAI_AGAIN|fetch failed|ECONNREFUSED/i.test(err.message || '')) {
        edgeFailedNetwork = true;
      }
      console.warn(`[TTS-FAILOVER] Edge TTS falló (${err.message}). Pasando a Google TTS.`);
    }

    // 4. Proveedor gratuito de respaldo: Google Neural TTS es-MX (solo si no estamos offline)
    if (!edgeFailedNetwork) {
      try {
        const audioUrl = await this.synthesizeWithGoogle(text);
        if (audioUrl) {
          this.totalCharsUsed += text.length;
          return {
            cached: false,
            audioUrl,
            provider: 'google_neural',
            fallbackToBrowserSpeech: false,
            charsUsedSession: this.totalCharsUsed
          };
        }
      } catch (err) {
        console.warn(`[TTS-FAILOVER] Google TTS falló (${err.message}).`);
      }
    }

    // 5. Último recurso absoluto: retorno de texto para speech del navegador
    return {
      cached: false,
      audioUrl: null,
      fallbackToBrowserSpeech: true,
      reason: 'Todos los sintetizadores de audio fallaron',
      charsUsedSession: this.totalCharsUsed
    };
  }

  getStats() {
    return {
      charsUsedSession: this.totalCharsUsed,
      elevenLabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY),
      edgeTTSVoices: ['es-MX-JorgeNeural', 'es-ES-AlvaroNeural', 'es-AR-TomasNeural']
    };
  }
}

export const ttsService = new TTSService();
