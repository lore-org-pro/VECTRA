// ========================================================
// VECTRA Serverless — POST /api/tts
// Returns JSON with audioUrl (base64 data URI) or fallbackToBrowserSpeech
// ========================================================
import 'dotenv/config';
import { ttsService } from './_lib/tts/ttsService.js';
import { audioCache } from './_lib/tts/audioCache.js';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text requerido' });

  try {
    const result = await ttsService.synthesize(text);

    // On Vercel: if we have a file in /tmp, embed it as base64 data URI so the
    // client can play it without needing a separate file-serving route.
    if (result.audioUrl && result.audioUrl.startsWith('/_audio_/')) {
      const hash = path.basename(result.audioUrl, '.mp3');
      const buf = audioCache.getBuffer(hash);
      if (buf) {
        result.audioUrl = `data:audio/mpeg;base64,${buf.toString('base64')}`;
      } else {
        // File lost (cold start), fall back to browser TTS
        result.audioUrl = null;
        result.fallbackToBrowserSpeech = true;
      }
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('[API-TTS-ERROR]', err);
    return res.status(200).json({
      fallbackToBrowserSpeech: true,
      audioUrl: null,
      text,
      reason: err.message
    });
  }
}
